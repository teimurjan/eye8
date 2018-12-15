from api.http.headers import ACCEPT_LANGUAGE_HEADER


class LanguageHttpMiddleware:
    def __init__(self, language_repo):
        self._language_repo = language_repo

    def handle(self, request):
        language_name = request.META.get(
            ACCEPT_LANGUAGE_HEADER, 'en-US'
        ).split(',')[0]
        languages = tuple(self._language_repo.filter_by(name=language_name))
        request.language = None if not languages else languages[0]