"""
Token Tracking Service - Records token usage and calculates costs.

Provides:
- Token usage recording for each LLM request
- Cost calculation based on model pricing
- Aggregated stats retrieval for dashboards (with Redis caching)
"""
from decimal import Decimal
from datetime import datetime, timedelta
from typing import Optional
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from database.models import TokenUsage, DailyUsageSummary, ChatSession, User


def _get_redis_service():
    """Lazy import Redis service."""
    try:
        from core.services.redis_service import RedisService
        return RedisService
    except ImportError:
        return None


class TokenTrackingService:
    """
    Service for tracking token usage and calculating costs.
    """
    
    # Pricing per 1M tokens (in USD)
    PRICING = {
        "groq": {
            "llama-3.1-8b-instant": {"input": 0.05, "output": 0.08},
            "llama-3.3-70b-versatile": {"input": 0.59, "output": 0.79},
            "llama-3.1-70b-versatile": {"input": 0.59, "output": 0.79},
            "mixtral-8x7b-32768": {"input": 0.24, "output": 0.24},
            "gemma2-9b-it": {"input": 0.20, "output": 0.20},
        },
        "gemini": {
            "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
            "gemini-1.5-pro": {"input": 1.25, "output": 5.00},
            "gemini-pro": {"input": 0.50, "output": 1.50},
        },
    }
    
    # Default pricing if model not found
    DEFAULT_PRICING = {"input": 0.10, "output": 0.20}
    
    @classmethod
    def get_pricing(cls, provider: str, model_name: str) -> dict:
        """Get pricing for a specific model."""
        provider_pricing = cls.PRICING.get(provider.lower(), {})
        return provider_pricing.get(model_name, cls.DEFAULT_PRICING)
    
    @classmethod
    def calculate_cost(cls, provider: str, model_name: str, 
                       input_tokens: int, output_tokens: int) -> Decimal:
        """
        Calculate cost for a request based on token counts.
        
        Args:
            provider: LLM provider (groq, gemini)
            model_name: Model identifier
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            
        Returns:
            Cost in USD as Decimal
        """
        pricing = cls.get_pricing(provider, model_name)
        
        # Calculate cost (pricing is per 1M tokens)
        input_cost = (Decimal(input_tokens) / Decimal(1_000_000)) * Decimal(str(pricing["input"]))
        output_cost = (Decimal(output_tokens) / Decimal(1_000_000)) * Decimal(str(pricing["output"]))
        
        return input_cost + output_cost
    
    @classmethod
    def record_usage(
        cls,
        user: User,
        session: Optional[ChatSession],
        model_name: str,
        provider: str,
        input_tokens: int,
        output_tokens: int,
        request_type: str = "chat"
    ) -> Optional[TokenUsage]:
        """
        Record token usage for a request.
        
        Args:
            user: User making the request
            session: Chat session (optional)
            model_name: Model identifier
            provider: LLM provider
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            request_type: Type of request (chat, embedding, rag_query)
            
        Returns:
            Created TokenUsage record or None on failure
        """
        try:
            total_tokens = input_tokens + output_tokens
            cost = cls.calculate_cost(provider, model_name, input_tokens, output_tokens)
            
            usage = TokenUsage.objects.create(
                user=user,
                session=session,
                model_name=model_name,
                provider=provider,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
                cost_usd=cost,
                request_type=request_type,
            )
            
            print(f"[TokenTracking] Recorded {total_tokens} tokens, cost: ${cost:.6f}")
            
            # Invalidate analytics cache for this user
            redis = _get_redis_service()
            if redis and redis.is_available():
                redis.invalidate_analytics(user.id)
            
            return usage
            
        except Exception as e:
            print(f"[TokenTracking] Error recording usage: {e}")
            return None
    
    @classmethod
    async def record_usage_async(
        cls,
        user: User,
        session: Optional[ChatSession],
        model_name: str,
        provider: str,
        input_tokens: int,
        output_tokens: int,
        request_type: str = "chat"
    ) -> Optional[TokenUsage]:
        """Async version of record_usage for ASGI contexts."""
        from asgiref.sync import sync_to_async
        return await sync_to_async(cls.record_usage, thread_sensitive=True)(
            user, session, model_name, provider, input_tokens, output_tokens, request_type
        )
    
    @classmethod
    def get_user_summary(cls, user: User, days: int = 30) -> dict:
        """
        Get aggregated usage summary for a user (with Redis caching).
        
        Args:
            user: User to get stats for
            days: Number of days to look back
            
        Returns:
            Dict with total_tokens, total_cost, total_requests, by_model breakdown
        """
        # Check Redis cache first
        redis = _get_redis_service()
        cache_key = f"summary_{days}"
        if redis and redis.is_available():
            cached = redis.get_analytics(user.id, cache_key)
            if cached:
                print(f"[TokenTracking] Analytics cache HIT for user {user.id}")
                return cached
        
        since = timezone.now() - timedelta(days=days)
        
        # Aggregate totals
        totals = TokenUsage.objects.filter(
            user=user,
            timestamp__gte=since
        ).aggregate(
            total_tokens=Sum('total_tokens'),
            total_input_tokens=Sum('input_tokens'),
            total_output_tokens=Sum('output_tokens'),
            total_cost=Sum('cost_usd'),
            total_requests=Count('id'),
        )
        
        # Breakdown by model
        by_model = {}
        model_stats = TokenUsage.objects.filter(
            user=user,
            timestamp__gte=since
        ).values('model_name', 'provider').annotate(
            tokens=Sum('total_tokens'),
            cost=Sum('cost_usd'),
            requests=Count('id'),
        )
        
        for stat in model_stats:
            key = f"{stat['provider']}/{stat['model_name']}"
            by_model[key] = {
                "tokens": stat['tokens'] or 0,
                "cost": float(stat['cost'] or 0),
                "requests": stat['requests'],
            }
        
        result = {
            "total_tokens": totals['total_tokens'] or 0,
            "total_input_tokens": totals['total_input_tokens'] or 0,
            "total_output_tokens": totals['total_output_tokens'] or 0,
            "total_cost_usd": float(totals['total_cost'] or 0),
            "total_requests": totals['total_requests'] or 0,
            "period_days": days,
            "by_model": by_model,
        }
        
        # Cache the result
        if redis and redis.is_available():
            redis.set_analytics(user.id, cache_key, result)
        
        return result
    
    @classmethod
    def get_daily_breakdown(cls, user: User, days: int = 30) -> list:
        """
        Get daily token usage breakdown (with Redis caching).
        
        Args:
            user: User to get stats for
            days: Number of days to look back
            
        Returns:
            List of dicts with date, tokens, cost, requests per day
        """
        # Check Redis cache first
        redis = _get_redis_service()
        cache_key = f"daily_{days}"
        if redis and redis.is_available():
            cached = redis.get_analytics(user.id, cache_key)
            if cached:
                print(f"[TokenTracking] Daily analytics cache HIT for user {user.id}")
                return cached
        
        since = timezone.now() - timedelta(days=days)
        
        daily = TokenUsage.objects.filter(
            user=user,
            timestamp__gte=since
        ).annotate(
            date=TruncDate('timestamp')
        ).values('date').annotate(
            tokens=Sum('total_tokens'),
            input_tokens=Sum('input_tokens'),
            output_tokens=Sum('output_tokens'),
            cost=Sum('cost_usd'),
            requests=Count('id'),
        ).order_by('-date')
        
        result = [
            {
                "date": item['date'].isoformat() if item['date'] else None,
                "tokens": item['tokens'] or 0,
                "input_tokens": item['input_tokens'] or 0,
                "output_tokens": item['output_tokens'] or 0,
                "cost": float(item['cost'] or 0),
                "requests": item['requests'],
            }
            for item in daily
        ]
        
        # Cache the result
        if redis and redis.is_available():
            redis.set_analytics(user.id, cache_key, result)
        
        return result
    
    @classmethod
    def get_session_breakdown(cls, user: User, limit: int = 20) -> list:
        """
        Get per-session token usage for a user.
        
        Args:
            user: User to get stats for
            limit: Max number of sessions to return
            
        Returns:
            List of dicts with session info and usage stats
        """
        session_stats = TokenUsage.objects.filter(
            user=user,
            session__isnull=False
        ).values(
            'session_id', 'session__title'
        ).annotate(
            tokens=Sum('total_tokens'),
            cost=Sum('cost_usd'),
            requests=Count('id'),
        ).order_by('-tokens')[:limit]
        
        return [
            {
                "session_id": str(item['session_id']),
                "title": item['session__title'] or "Untitled Chat",
                "tokens": item['tokens'] or 0,
                "cost": float(item['cost'] or 0),
                "requests": item['requests'],
            }
            for item in session_stats
        ]
