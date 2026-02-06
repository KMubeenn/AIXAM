"""
Django ORM initialization for standalone usage with FastAPI.
Import this module before using any Django models.
"""
import os
import django
from dotenv import load_dotenv

def setup_django():
    """Configure Django settings and initialize the ORM."""
    # Load .env file from project root
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    load_dotenv(os.path.join(project_root, ".env"))
    
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "configs.settings")
    django.setup()

setup_django()
