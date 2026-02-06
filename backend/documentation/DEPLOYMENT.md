# Lexa Backend Deployment Documentation

## Deployment Overview

| Component         | Value                              |
| ----------------- | ---------------------------------- |
| **Platform**      | AWS EC2 (Amazon Linux 2023)        |
| **Instance Type** | t2.micro (Free Tier)               |
| **Public IP**     | `3.239.50.12` (changes on restart) |
| **Backend URL**   | `http://3.239.50.12`               |
| **Health Check**  | `http://3.239.50.12/api/health/`   |
| **Status**        | ✅ Running                         |

---

## Architecture

```
Browser → Nginx (Port 80) → Gunicorn (Port 8000) → Django
```

- **Nginx**: Reverse proxy, listens on port 80, forwards to Gunicorn
- **Gunicorn**: ASGI server with Uvicorn workers, runs Django app
- **lexa.service**: Systemd service that keeps Gunicorn running

---

## Issues Faced & Solutions

### 1. Missing `configs` Module

**Error:** `ModuleNotFoundError: No module named 'configs'`
**Solution:** Added `backend/configs/` directory to Git (was not tracked).

### 2. Deprecated LangChain Imports

**Error:** `ImportError: cannot import name 'create_tool_calling_agent'`
**Solution:** Updated imports for LangChain 0.3.x:

- `langchain.schema.runnable` → `langchain_core.runnables`
- `langchain.text_splitter` → `langchain_text_splitters`
- Removed deprecated `AgentExecutor` and `create_tool_calling_agent`

### 3. Disk Space Full (8GB)

**Error:** `No space left on device`
**Solution:** Increased EBS volume from 8GB to 20GB in AWS Console.

### 4. Worker Memory Issues

**Error:** `Worker was sent SIGKILL! Perhaps out of memory?`
**Solution:** Reduced Gunicorn workers from 2 to 1, increased timeout to 120s.

### 5. Mixed Content Error (CURRENT)

**Error:** `Mixed Content: HTTPS page requesting HTTP resource`
**Solution Pending:** Need domain + SSL certificate (Let's Encrypt).

---

## Nginx Configuration

**File:** `/etc/nginx/conf.d/lexa.conf`

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/ec2-user/legal_assistant/backend/static/;
    }
}
```

---

## Gunicorn Systemd Service

**File:** `/etc/systemd/system/lexa.service`

```ini
[Unit]
Description=Lexa Backend
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/legal_assistant/backend
Environment="PATH=/home/ec2-user/legal_assistant/backend/.venv/bin"
ExecStart=/home/ec2-user/legal_assistant/backend/.venv/bin/gunicorn configs.asgi:application -w 1 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000 --timeout 120
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## Managing the Service

```bash
# Start/Stop/Restart
sudo systemctl start lexa
sudo systemctl stop lexa
sudo systemctl restart lexa

# Check status
sudo systemctl status lexa
sudo systemctl status nginx

# View logs
journalctl -u lexa -f

# Deploy updates
cd ~/legal_assistant && git pull && sudo systemctl restart lexa
```

---

## Next Steps: Enable HTTPS

1. **Get a domain** (e.g., from Namecheap, ~$10/year)
2. **Get Elastic IP** in AWS (so IP doesn't change)
3. **Point domain to EC2** (A record to Elastic IP)
4. **Install SSL** with Let's Encrypt:
   ```bash
   sudo yum install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```
5. **Update CORS** with new domain
6. **Update Vercel** `VITE_API_URL` to `https://yourdomain.com`
