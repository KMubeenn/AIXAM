import os
from django.core.asgi import get_asgi_application
from dotenv import load_dotenv
from pathlib import Path

# Build paths inside the backend folder
BASE_DIR = Path(__file__).resolve().parent.parent  # Points to backend/

# Load environment variables from backend/.env
dotenv_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=dotenv_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configs.settings')
application = get_asgi_application()
