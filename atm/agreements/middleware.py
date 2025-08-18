# middleware.py
class SkipSessionRefreshForSpecificGET:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # List the GET paths for which session should NOT refresh
        skip_paths = ["/api/dashboard-stats/"]

        # Flag to skip session save
        if request.method == "GET" and request.path in skip_paths:
            request._skip_session_save = True

        response = self.get_response(request)

        # Prevent saving session for this request
        if getattr(request, "_skip_session_save", False) and hasattr(request, "session"):
            request.session.save = lambda *args, **kwargs: None

        return response
