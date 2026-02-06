# Analytics & Token Usage Tracking Implementation

## Document Information

- **Date**: February 1, 2026
- **Version**: 1.0
- **Author**: Development Team

---

## 1. Overview

This document describes the implementation of the Analytics and Token Usage Tracking system for the Legal Assistant application. The system enables tracking of LLM token consumption, cost calculation, and API performance metrics.

### 1.1 Purpose

The analytics system was implemented to:

1. **Track Token Usage** - Monitor how many tokens each user consumes per request
2. **Calculate Costs** - Estimate API costs based on model pricing
3. **Visualize Usage** - Provide users with charts showing their usage patterns
4. **Monitor Performance** - Track API response times and error rates

---

## 2. Database Schema

### 2.1 New Tables Created

Five new tables were added to the database:

| Table Name                   | Purpose                    | Key Fields                                                             |
| ---------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| `token_usage`                | Per-request token tracking | user_id, session_id, model_name, input_tokens, output_tokens, cost_usd |
| `daily_usage_summary`        | Pre-aggregated daily stats | user_id, date, total_tokens, total_cost_usd, model_breakdown           |
| `request_metrics`            | API performance tracking   | endpoint, response_time_ms, status_code, is_error                      |
| `system_health`              | Service uptime monitoring  | service_name, is_healthy, latency_ms                                   |
| `hourly_performance_summary` | Aggregated hourly metrics  | hour, endpoint, avg_response_time_ms, error_count                      |

### 2.2 Migration File

**Location**: `backend/database/migrations/0003_hourlyperformancesummary_systemhealth_and_more.py`

---

## 3. Backend Implementation

### 3.1 Files Created

| File Path                                                 | Purpose                                              |
| --------------------------------------------------------- | ---------------------------------------------------- |
| `backend/core/services/token_service.py`                  | Core service for token tracking and cost calculation |
| `backend/api/views/analytics.py`                          | REST API endpoints for usage data                    |
| `backend/api/urls/analytics.py`                           | URL routing for analytics endpoints                  |
| `backend/api/middleware/metrics.py`                       | Request performance tracking middleware              |
| `backend/database/management/commands/aggregate_usage.py` | Daily aggregation command                            |
| `backend/database/models/analytics.py`                    | Django ORM models for analytics tables               |

### 3.2 Files Modified

| File Path                              | Modification                                  |
| -------------------------------------- | --------------------------------------------- |
| `backend/api/services/chat_service.py` | Added token tracking after each chat response |
| `backend/api/urls/__init__.py`         | Registered analytics URL patterns             |
| `backend/configs/settings.py`          | Added metrics middleware to MIDDLEWARE list   |
| `backend/database/models/__init__.py`  | Exported new analytics models                 |

---

## 4. Service Details

### 4.1 TokenTrackingService (`token_service.py`)

**Purpose**: Central service for recording token usage and calculating costs.

**Key Methods**:

- `record_usage()` - Records a single API request's token consumption
- `record_usage_async()` - Async version for ASGI contexts
- `get_user_summary()` - Returns aggregated usage stats for a user
- `get_daily_breakdown()` - Returns daily usage for charting
- `get_session_breakdown()` - Returns per-session usage breakdown

**Pricing Configuration**:

```python
PRICING = {
    "groq": {
        "llama-3.1-8b-instant": {"input": 0.05, "output": 0.08},
        "llama-3.3-70b-versatile": {"input": 0.59, "output": 0.79},
    },
    "gemini": {
        "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
        "gemini-1.5-pro": {"input": 1.25, "output": 5.00},
    },
}
```

### 4.2 RequestMetricsMiddleware (`metrics.py`)

**Purpose**: Tracks performance metrics for all API requests.

**What it Records**:

- Response time (milliseconds)
- HTTP method and endpoint path
- Status code
- Whether request resulted in error
- Error message (if applicable)

**Configuration**: Added to `MIDDLEWARE` in `settings.py`

### 4.3 API Endpoints

| Endpoint                         | Method | Description                         |
| -------------------------------- | ------ | ----------------------------------- |
| `/api/analytics/usage/`          | GET    | User's usage summary (last 30 days) |
| `/api/analytics/usage/daily/`    | GET    | Daily breakdown for charts          |
| `/api/analytics/usage/sessions/` | GET    | Per-session usage list              |

**Query Parameters**:

- `days` - Number of days to look back (default: 30, max: 365)
- `limit` - Max sessions to return (default: 20, max: 50)

### 4.4 Aggregation Command

**Command**: `python manage.py aggregate_usage`

**Purpose**: Populates `daily_usage_summary` table from `token_usage` records.

**Usage**:

```bash
# Aggregate yesterday's data
python manage.py aggregate_usage

# Aggregate last 7 days
python manage.py aggregate_usage --days=7

# Aggregate specific date
python manage.py aggregate_usage --date=2026-02-01
```

**Recommended**: Run daily via cron job or scheduled task.

---

## 5. Frontend Implementation

### 5.1 Files Created

| File Path                                          | Purpose                            |
| -------------------------------------------------- | ---------------------------------- |
| `frontend/src/api/analytics.js`                    | API client for analytics endpoints |
| `frontend/src/components/profile/UsageSection.jsx` | Usage dashboard component          |

### 5.2 Files Modified

| File Path                        | Modification                 |
| -------------------------------- | ---------------------------- |
| `frontend/src/pages/Profile.jsx` | Added "Usage" tab to sidebar |

### 5.3 UsageSection Component Features

- **Summary Cards**: Total tokens, cost, and request count
- **Line Chart**: Daily token usage trend (Recharts library)
- **Pie Chart**: Usage breakdown by model
- **Session List**: Top sessions ranked by token usage
- **Token Breakdown**: Input vs output token comparison

### 5.4 Dependencies Added

```bash
npm install recharts
```

---

## 6. Data Flow

```
User sends chat message
        ↓
ChatBot generates response
        ↓
chat_service.py estimates tokens
        ↓
TokenTrackingService.record_usage_async()
        ↓
token_usage table (Supabase)
        ↓
UsageSection.jsx fetches via /api/analytics/
        ↓
Charts displayed in Profile → Usage tab
```

---

## 7. Directory Structure

```
backend/
├── api/
│   ├── middleware/
│   │   └── metrics.py          [NEW]
│   ├── urls/
│   │   └── analytics.py        [NEW]
│   ├── views/
│   │   └── analytics.py        [NEW]
│   └── services/
│       └── chat_service.py     [MODIFIED]
├── core/
│   └── services/
│       └── token_service.py    [NEW]
├── database/
│   ├── models/
│   │   ├── analytics.py        [NEW]
│   │   └── __init__.py         [MODIFIED]
│   ├── management/
│   │   └── commands/
│   │       └── aggregate_usage.py [NEW]
│   └── migrations/
│       └── 0003_hourlyperformancesummary_*.py [NEW]
└── configs/
    └── settings.py             [MODIFIED]

frontend/
├── src/
│   ├── api/
│   │   └── analytics.js        [NEW]
│   ├── components/
│   │   └── profile/
│   │       └── UsageSection.jsx [NEW]
│   └── pages/
│       └── Profile.jsx         [MODIFIED]
└── package.json                [MODIFIED - added recharts]
```

---

## 8. Testing & Verification

1. **Generate Usage Data**: Send chat messages to create token_usage records
2. **View Dashboard**: Navigate to Profile → Usage tab
3. **Check Database**: Query `token_usage` and `request_metrics` tables in Supabase
4. **Run Aggregation**: Execute `python manage.py aggregate_usage`

---

## 9. Future Enhancements

- Admin-only performance dashboard
- Real-time streaming metrics
- Usage alerts and quotas
- Export usage reports to CSV/PDF
