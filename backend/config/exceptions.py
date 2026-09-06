from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Wraps every DRF error response in a consistent shape:
    { "error": { "message": "...", "detail": ... } }
    instead of DRF's default inconsistent formats.
    """
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "error": {
                "message": str(exc),
                "detail": response.data,
            }
        }

    return response