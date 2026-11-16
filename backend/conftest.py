import os
import django
from django.conf import settings

def pytest_configure():
    os.environ['DJANGO_SETTINGS_MODULE'] = 'configs.settings'
    if not settings.configured:
        django.setup()
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
        'ATOMIC_REQUESTS': False,
    }
