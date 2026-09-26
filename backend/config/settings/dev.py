from .base import *
from .base import BASE_DIR

DEBUG = True

ALLOWED_HOSTS = ['*']

# Allow all origins in dev mode to support any local port (5173, 5174, etc.)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}