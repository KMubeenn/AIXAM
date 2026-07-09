# AWS & Vercel Deployment Documentation

This document records the exact production architecture, domain mappings, server ports, and SSL certification details for the live **AIXAM** platform.

---

## 1. Live Deployment Endpoints
*   **Frontend Application (Vercel):** [https://aixam-opal.vercel.app/](https://aixam-opal.vercel.app/)
*   **Backend API (AWS EC2):** [https://aixam.duckdns.org/api/](https://aixam.duckdns.org/api/)
*   **Health Status Check:** [https://aixam.duckdns.org/api/health/](https://aixam.duckdns.org/api/health/)

---

## 2. Infrastructure Architecture
AIXAM splits client and server concerns across two cloud providers to optimize performance, cost, and load times:

```
[ Client Browser ]
        |
        +---> HTTPS (443) ---> [ Vercel Frontend (aixam-opal.vercel.app) ]
        |
        +---> HTTPS (443) ---> [ AWS EC2 Backend (aixam.duckdns.org) ]
                                    |
                                  [ Nginx Reverse Proxy (Ports 80/443) ]
                                    |
                                  [ Uvicorn ASGI Server (Port 8000) ]
                                    |
                                  [ Supabase Postgres Database (Remote) ]
```

---

## 3. AWS EC2 Instance Specifications
*   **Instance Name:** `Aixam`
*   **Instance Type:** `m7i-flex.large` (2 vCPUs, 8 GiB RAM - high compute efficiency for LangGraph chains).
*   **Operating System:** Ubuntu Server 24.04 LTS (HVM).
*   **Static Elastic IP:** `107.22.44.245` (allocated via AWS EC2 Network & Security to prevent IP changes on reboot).

---

## 4. Nginx Port & Reverse Proxy Configuration
An Nginx reverse proxy runs directly on the EC2 instance, directing web traffic to the appropriate internal services.

### Ports Used:
*   **Port 80 (HTTP):** Listens for incoming HTTP requests. Certbot automatically redirects all port 80 traffic to port 443 (HTTPS) to enforce encryption.
*   **Port 443 (HTTPS):** Listens for encrypted web traffic. Terminate SSL handshake here and proxies unencrypted traffic internally.
*   **Port 8000 (Internal):** The internal loopback port (`127.0.0.1:8000`) where the Uvicorn ASGI Django application is listening.

### Nginx Block (`/etc/nginx/sites-available/aixam`):
```nginx
server {
    server_name aixam.duckdns.org;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSockets and Async ASGI connection upgrade support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/aixam.duckdns.org/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/aixam.duckdns.org/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = aixam.duckdns.org) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name aixam.duckdns.org;
    return 404; # managed by Certbot
}
```

---

## 5. SSL / HTTPS Certification
We secure transit data using **Let's Encrypt** authority.
*   **Certification Tool:** **Certbot** (`python3-certbot-nginx` package).
*   **Verification Domain:** `aixam.duckdns.org` (Dynamic DNS).
*   **Renewal System:** Certbot configures a systemd timer that runs twice a day to check if the certificate is within 30 days of expiration and automatically updates the certificates at `/etc/letsencrypt/live/aixam.duckdns.org/` without requiring server downtime.

---

## 6. ASGI Backend Service (`Systemd`)
The Django backend runs continuously in the background as a system service named `aixam.service`.

*   **Status Command:** `sudo systemctl status aixam`
*   **Restart Command:** `sudo systemctl restart aixam`
*   **Internal Executable:** `/home/ubuntu/AIXAM/backend/.venv/bin/uvicorn`
*   **Target Application:** `configs.asgi:application` (binds to `127.0.0.1:8000`).
