"""
Script to generate the Database Migration Documentation DOCX file.
"""
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from datetime import datetime
import os

doc = Document()

# Title
title = doc.add_heading('Database Migration Documentation', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Subtitle
subtitle = doc.add_paragraph('Lawbot: Docker PostgreSQL to Supabase Cloud')
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_paragraph(f'Date: {datetime.now().strftime("%B %d, %Y")}')
doc.add_paragraph()

# Executive Summary
doc.add_heading('1. Executive Summary', level=1)
doc.add_paragraph(
    'This document outlines the complete migration process of the Lawbot backend database '
    'from a local Docker PostgreSQL instance to Supabase cloud-hosted PostgreSQL. The migration '
    'enables cloud-based data persistence, improved scalability, and remote accessibility.'
)

# Migration Details
doc.add_heading('2. Migration Details', level=1)

table = doc.add_table(rows=5, cols=2)
table.style = 'Table Grid'
headers = table.rows[0].cells
headers[0].text = 'Parameter'
headers[1].text = 'Value'

data = [
    ('Source Database', 'Docker PostgreSQL (localhost:5432)'),
    ('Target Database', 'Supabase PostgreSQL (aws-1-ap-south-1.pooler.supabase.com)'),
    ('Database Name', 'postgres'),
    ('Connection Type', 'Session Pooler (IPv4 compatible)'),
]
for i, (param, value) in enumerate(data, 1):
    row = table.rows[i].cells
    row[0].text = param
    row[1].text = value

doc.add_paragraph()

# Issue Encountered
doc.add_heading('3. Issue Encountered and Resolution', level=1)
doc.add_heading('IPv6 Connectivity Issue', level=2)
doc.add_paragraph(
    "During migration, it was discovered that Supabase's direct database URLs (db.*.supabase.co) "
    "require IPv6 connectivity. The local network did not support IPv6, causing connection failures."
)
doc.add_heading('Resolution', level=2)
doc.add_paragraph(
    "The solution was to use Supabase's Session Pooler connection (aws-1-ap-south-1.pooler.supabase.com), "
    "which supports both IPv4 and IPv6. This is a free feature provided by Supabase's Supavisor connection pooler."
)

# Files Modified
doc.add_heading('4. Files Modified', level=1)

# File 1: .env
doc.add_heading('4.1 .env', level=2)
doc.add_paragraph('Location: d:\\ML\\Lawbot\\.env')
doc.add_paragraph('Purpose: Environment variables configuration')
doc.add_heading('Changes Made:', level=3)
doc.add_paragraph('Added Supabase database credentials:')
changes = """SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.wmtgpgulspcmjzmietvj
SUPABASE_DB_PASSWORD=Lawbot12123.
SUPABASE_DB_HOST=aws-1-ap-south-1.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_PROJECT_URL=https://wmtgpgulspcmjzmietvj.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_AhgcD00KMBdmyFrHJUkAwg_jCcjNizo"""
doc.add_paragraph(changes)
doc.add_heading('Reason:', level=3)
doc.add_paragraph(
    'Centralizes all Supabase connection parameters in environment variables for security '
    '(credentials not hardcoded) and flexibility (easy to change between environments).'
)

# File 2: settings.py
doc.add_heading('4.2 settings.py', level=2)
doc.add_paragraph('Location: d:\\ML\\Lawbot\\backend\\configs\\settings.py')
doc.add_paragraph('Purpose: Django settings configuration')
doc.add_heading('Changes Made:', level=3)
doc.add_paragraph('Updated DATABASES configuration from hardcoded values to environment variables:')
before = """# Before (Docker)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "lawbot",
        "USER": "lawbot",
        "PASSWORD": "lawbot",
        "HOST": "localhost",
        "PORT": "5432",
    }
}"""
doc.add_paragraph(before)

after = """# After (Supabase)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("SUPABASE_DB_NAME", "postgres"),
        "USER": os.getenv("SUPABASE_DB_USER", "postgres"),
        "PASSWORD": os.getenv("SUPABASE_DB_PASSWORD", ""),
        "HOST": os.getenv("SUPABASE_DB_HOST", "localhost"),
        "PORT": os.getenv("SUPABASE_DB_PORT", "5432"),
        "OPTIONS": {
            "sslmode": "require",
        },
    }
}"""
doc.add_paragraph(after)
doc.add_heading('Reason:', level=3)
doc.add_paragraph(
    '1. Environment variables allow dynamic configuration without code changes. '
    '2. SSL mode is required for secure Supabase connections. '
    '3. Fallback defaults ensure the app works in development.'
)

# File 3: db.py
doc.add_heading('4.3 db.py', level=2)
doc.add_paragraph('Location: d:\\ML\\Lawbot\\backend\\configs\\db.py')
doc.add_paragraph('Purpose: Django ORM initialization for standalone usage with FastAPI')
doc.add_heading('Changes Made:', level=3)
doc.add_paragraph('Added dotenv loading before Django setup:')
code = """from dotenv import load_dotenv

def setup_django():
    # Load .env file from project root
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    load_dotenv(os.path.join(project_root, ".env"))
    
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "configs.settings")
    django.setup()"""
doc.add_paragraph(code)
doc.add_heading('Reason:', level=3)
doc.add_paragraph(
    'Ensures environment variables from .env are loaded before Django reads settings.py, '
    'which is necessary since the backend uses FastAPI with Django ORM (not standard Django startup).'
)

# File 4: manage.py
doc.add_heading('4.4 manage.py', level=2)
doc.add_paragraph('Location: d:\\ML\\Lawbot\\backend\\manage.py')
doc.add_paragraph('Purpose: Django command-line utility for migrations and admin tasks')
doc.add_heading('Changes Made:', level=3)
doc.add_paragraph('Added dotenv loading at the top of the file:')
code2 = """from dotenv import load_dotenv

# Load .env file from project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(project_root, ".env"))"""
doc.add_paragraph(code2)
doc.add_heading('Reason:', level=3)
doc.add_paragraph(
    'Required for Django migrations (python manage.py migrate) to access Supabase credentials. '
    'Without this, migrations would fail to connect to the database.'
)

# Database Schema
doc.add_heading('5. Database Tables Created', level=1)
doc.add_paragraph('The following tables were created in Supabase:')

table2 = doc.add_table(rows=5, cols=2)
table2.style = 'Table Grid'
headers2 = table2.rows[0].cells
headers2[0].text = 'Table Name'
headers2[1].text = 'Description'

tables_data = [
    ('users', 'Custom User model extending Django AbstractUser'),
    ('chat_sessions', 'Chat conversation sessions for each user'),
    ('messages', 'Individual messages within chat sessions'),
    ('session_memories', 'LangChain memory state for session recovery'),
]
for i, (name, desc) in enumerate(tables_data, 1):
    row = table2.rows[i].cells
    row[0].text = name
    row[1].text = desc

doc.add_paragraph()

# Verification
doc.add_heading('6. Verification Results', level=1)
doc.add_paragraph('All tests passed successfully:')
doc.add_paragraph('Database connection via pooler: PASSED', style='List Bullet')
doc.add_paragraph('Django migrations applied: PASSED', style='List Bullet')
doc.add_paragraph('User model accessible: PASSED', style='List Bullet')
doc.add_paragraph('ChatSession model accessible: PASSED', style='List Bullet')
doc.add_paragraph('Message model accessible: PASSED', style='List Bullet')
doc.add_paragraph('SessionMemory model accessible: PASSED', style='List Bullet')

# Summary
doc.add_heading('7. Summary', level=1)
doc.add_paragraph(
    'The database migration from Docker PostgreSQL to Supabase was completed successfully. '
    'Four configuration files were modified to enable environment-based database configuration '
    'with SSL support. The Session Pooler connection was used to ensure IPv4 compatibility. '
    'All Django models are now persisting data to the Supabase cloud database.'
)

# Save
output_path = 'd:/ML/Lawbot/docs/Database_Migration_Docker_to_Supabase.docx'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
doc.save(output_path)
print(f'Document saved to: {output_path}')
