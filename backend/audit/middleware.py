import threading

_thread_locals = threading.local()


def get_current_user():
    """Lets audit/signals.py know who's currently making the request."""
    return getattr(_thread_locals, "user", None)


class CurrentUserMiddleware:
    """Stashes the logged-in user so audit signals can record who did what,
    without changing every view to pass the user down manually."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _thread_locals.user = getattr(request, "user", None)
        response = self.get_response(request)
        _thread_locals.user = None
        return response