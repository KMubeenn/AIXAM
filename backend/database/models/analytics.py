"""
Analytics Models - Tracks token usage, costs, and application performance.

Tables:
- TokenUsage: Per-request token counts and costs
- DailyUsageSummary: Pre-aggregated daily stats for fast charts
- RequestMetrics: API latency, errors, response times
- SystemHealth: Service uptime monitoring
- HourlyPerformanceSummary: Pre-aggregated performance stats
"""
import uuid
from django.db import models
from django.conf import settings

from database.models.chat import ChatSession


class TokenUsage(models.Model):
    """Tracks each LLM API call's token consumption and cost."""
    
    REQUEST_TYPE_CHOICES = [
        ('chat', 'Chat'),
        ('embedding', 'Embedding'),
        ('rag_query', 'RAG Query'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='token_usage'
    )
    session = models.ForeignKey(
        ChatSession, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='token_usage'
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    model_name = models.CharField(max_length=100)  # e.g., "llama-3.1-8b-instant"
    provider = models.CharField(max_length=50)  # e.g., "groq", "gemini"
    input_tokens = models.PositiveIntegerField(default=0)
    output_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    request_type = models.CharField(max_length=50, choices=REQUEST_TYPE_CHOICES, default='chat')
    
    class Meta:
        db_table = 'token_usage'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.total_tokens} tokens @ {self.timestamp}"


class DailyUsageSummary(models.Model):
    """Pre-aggregated daily stats for faster dashboard queries."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='daily_usage'
    )
    date = models.DateField(db_index=True)
    total_requests = models.PositiveIntegerField(default=0)
    total_input_tokens = models.PositiveIntegerField(default=0)
    total_output_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    total_cost_usd = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    model_breakdown = models.JSONField(default=dict)  # Token counts by model
    
    class Meta:
        db_table = 'daily_usage_summary'
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.total_tokens} tokens"


class RequestMetrics(models.Model):
    """Tracks latency and performance of each API request."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    endpoint = models.CharField(max_length=200, db_index=True)
    method = models.CharField(max_length=10)  # GET, POST, etc.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='request_metrics'
    )
    session = models.ForeignKey(
        ChatSession, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='request_metrics'
    )
    response_time_ms = models.PositiveIntegerField()
    llm_latency_ms = models.PositiveIntegerField(null=True, blank=True)
    db_latency_ms = models.PositiveIntegerField(null=True, blank=True)
    status_code = models.PositiveIntegerField()
    is_error = models.BooleanField(default=False)
    error_message = models.TextField(blank=True, null=True)
    time_to_first_token_ms = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'request_metrics'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['endpoint', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.method} {self.endpoint} - {self.response_time_ms}ms"


class SystemHealth(models.Model):
    """Periodic health snapshots for monitoring uptime and system status."""
    
    SERVICE_CHOICES = [
        ('api', 'API Server'),
        ('database', 'Database'),
        ('llm_groq', 'Groq LLM'),
        ('llm_gemini', 'Gemini LLM'),
        ('pinecone', 'Pinecone Vector DB'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    service_name = models.CharField(max_length=100, choices=SERVICE_CHOICES, db_index=True)
    is_healthy = models.BooleanField(default=True)
    latency_ms = models.PositiveIntegerField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'system_health'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['service_name', 'timestamp']),
        ]
    
    def __str__(self):
        status = "✓" if self.is_healthy else "✗"
        return f"{status} {self.service_name} @ {self.timestamp}"


class HourlyPerformanceSummary(models.Model):
    """Pre-aggregated hourly performance stats."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hour = models.DateTimeField(db_index=True)  # Hour bucket
    endpoint = models.CharField(max_length=200, null=True, blank=True)  # Nullable for overall stats
    total_requests = models.PositiveIntegerField(default=0)
    avg_response_time_ms = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    p50_response_time_ms = models.PositiveIntegerField(null=True, blank=True)
    p95_response_time_ms = models.PositiveIntegerField(null=True, blank=True)
    p99_response_time_ms = models.PositiveIntegerField(null=True, blank=True)
    error_count = models.PositiveIntegerField(default=0)
    error_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0)
    
    class Meta:
        db_table = 'hourly_performance_summary'
        ordering = ['-hour']
        indexes = [
            models.Index(fields=['endpoint', 'hour']),
        ]
    
    def __str__(self):
        endpoint_str = self.endpoint or "overall"
        return f"{endpoint_str} @ {self.hour} - {self.total_requests} requests"
