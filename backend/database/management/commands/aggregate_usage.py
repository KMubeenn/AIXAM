"""
Aggregate Usage Command - Aggregates daily token usage statistics.

Usage:
    python manage.py aggregate_usage
    python manage.py aggregate_usage --date=2026-02-01
    python manage.py aggregate_usage --days=7
"""
from datetime import datetime, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from database.models import TokenUsage, DailyUsageSummary


class Command(BaseCommand):
    help = 'Aggregate daily token usage statistics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Specific date to aggregate (YYYY-MM-DD format)',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=1,
            help='Number of days to aggregate (default: 1, yesterday)',
        )

    def handle(self, *args, **options):
        if options['date']:
            # Aggregate specific date
            try:
                target_date = datetime.strptime(options['date'], '%Y-%m-%d').date()
                self.aggregate_date(target_date)
            except ValueError:
                self.stderr.write(self.style.ERROR('Invalid date format. Use YYYY-MM-DD'))
                return
        else:
            # Aggregate last N days
            days = options['days']
            today = timezone.now().date()
            
            for i in range(1, days + 1):
                target_date = today - timedelta(days=i)
                self.aggregate_date(target_date)

    def aggregate_date(self, target_date):
        """Aggregate usage for a specific date."""
        self.stdout.write(f'Aggregating usage for {target_date}...')
        
        # Get all users with usage on this date
        user_usage = TokenUsage.objects.filter(
            timestamp__date=target_date
        ).values('user_id').annotate(
            total_requests=Count('id'),
            total_input_tokens=Sum('input_tokens'),
            total_output_tokens=Sum('output_tokens'),
            total_tokens=Sum('total_tokens'),
            total_cost=Sum('cost_usd'),
        )
        
        created_count = 0
        updated_count = 0
        
        for usage in user_usage:
            user_id = usage['user_id']
            
            # Get model breakdown
            model_stats = TokenUsage.objects.filter(
                user_id=user_id,
                timestamp__date=target_date
            ).values('model_name', 'provider').annotate(
                tokens=Sum('total_tokens'),
                cost=Sum('cost_usd'),
            )
            
            model_breakdown = {}
            for stat in model_stats:
                key = f"{stat['provider']}/{stat['model_name']}"
                model_breakdown[key] = {
                    'tokens': stat['tokens'] or 0,
                    'cost': float(stat['cost'] or 0),
                }
            
            # Update or create summary record
            summary, created = DailyUsageSummary.objects.update_or_create(
                user_id=user_id,
                date=target_date,
                defaults={
                    'total_requests': usage['total_requests'] or 0,
                    'total_input_tokens': usage['total_input_tokens'] or 0,
                    'total_output_tokens': usage['total_output_tokens'] or 0,
                    'total_tokens': usage['total_tokens'] or 0,
                    'total_cost_usd': usage['total_cost'] or Decimal('0'),
                    'model_breakdown': model_breakdown,
                }
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'  Created: {created_count}, Updated: {updated_count}'
            )
        )
