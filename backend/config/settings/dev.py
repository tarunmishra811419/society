from .base import *
from .base import BASE_DIR

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Vite dev server
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}