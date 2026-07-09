# AWS Deployment Guide for AIXAM

This guide outlines the recommended deployment strategy for AIXAM on AWS, detailing why specific services were selected and providing step-by-step instructions.

---

## 1. Selected AWS Architecture
For an educational platform utilizing Django (Backend) and React (Frontend), we recommend using **AWS EC2 (Elastic Compute Cloud)** combined with **Amazon S3** and **AWS Route 53** (DNS). 

### Why EC2 over AWS Lambda + API Gateway?
While AWS Lambda (Serverless) is excellent for simple microservices, it is **not recommended** for AIXAM due to:
1.  **Request Timeouts:** AWS API Gateway has a strict maximum timeout limit of **29 seconds**. LangGraph agent chains (which coordinate multiple LLM queries, plan tasks, and generate documents) can easily take 15–25 seconds. If the API Gateway encounters a slight network delay, it will terminate the connection, resulting in a `504 Gateway Timeout` error.
2.  **Monolithic Django Support:** Django is designed as a persistent monolithic server. Running it on Lambda requires complex wrappers (like `Mangum` or `Zappa`) which complicate debugging and routing.
3.  **Cold Starts:** Serverless functions suffer from "cold starts" when not used recently. An idle student agent taking an extra 5 seconds to load destroys the real-time chat UX.

### Recommended Infrastructure Layout
*   **Backend & Frontend Hosting:** Single **AWS EC2 Instance** (t3.medium or t3.small, running Ubuntu).
*   **Database:** Remain on **Supabase** (external PostgreSQL) to avoid AWS RDS hosting costs.
*   **SSL/HTTPS:** **Nginx** reverse proxy running on the EC2 instance, managed by Let's Encrypt (Certbot).
*   **Static Assets Storage:** **Amazon S3** (optional, for uploaded student PDFs/materials).

---

## 2. Containerized Deployment Strategy (Docker)
The most professional way to deploy to EC2 is using **Docker Compose**. This ensures the application runs exactly the same way in the cloud as it does on your local machine.

### The Production Docker Compose Layout
We run three containers inside the EC2 instance:
1.  **Nginx (Web Server):** Acts as the entry point. Listens on port 80/443, serves the React static build files directly, and reverse-proxies API requests to Django.
2.  **Django API (Backend):** Runs your Django application using `gunicorn` or `uvicorn` on an internal port.
3.  **Certbot (SSL):** Automatically obtains and renews your HTTPS certificates.

---

## 3. Step-by-Step Deployment Walkthrough

### Step 1: Launch the EC2 Instance
1.  Log in to the AWS Console and navigate to **EC2**.
2.  Click **Launch Instance**.
3.  Select **Ubuntu Server 24.04 LTS** as the Amazon Machine Image (AMI).
4.  Choose Instance Type: **t3.medium** (2 vCPUs, 4GB RAM) - recommended for running Django + React + Docker smoothly.
5.  Configure Security Group (Firewall):
    *   Allow **SSH** (Port 22) from your IP.
    *   Allow **HTTP** (Port 80) from anywhere.
    *   Allow **HTTPS** (Port 443) from anywhere.

### Step 2: Install Docker on EC2
SSH into your instance and run:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker
```

### Step 3: Configure Frontend for Production
Before building the React frontend, update your environment variables to point to the EC2 elastic IP or domain name:
```env
VITE_API_URL=https://yourdomain.com/api
```
Build the production assets:
```bash
npm run build
```
*(This outputs a static folder `/dist` which Nginx will serve).*

### Step 4: Clone codebase & Set Environment Variables
Clone the repo on your EC2 instance and create the production `.env` file inside `backend/`:
```env
DEBUG=False
DJANGO_SECRET_KEY=your-production-secret-key
GEMINI_API_KEY=your-key
GROQ_API_KEY=your-key
DATABASE_URL=your-supabase-postgres-string
```

### Step 5: Start the App
Run your docker-compose file to build and spin up the containers:
```bash
sudo docker-compose -f docker-compose.prod.yml up --build -d
```
Your backend will now run in isolation, Nginx will handle incoming traffic, and the site will be fully operational under HTTPS!
