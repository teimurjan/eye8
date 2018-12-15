from api.http.status_codes import OK_CODE
from api.views.base import ValidatableView
from api.errors import InvalidEntityFormat

class RefreshTokenView(ValidatableView):
    def __init__(self, validator, user_service):
        super().__init__(validator)
        self._user_service = user_service

    def post(self, request):
        try:
            self._validate(request.data)
            access_token, refresh_token = self._user_service.refresh_token(
                request.data)
            return {'access_token': access_token, 'refresh_token': refresh_token}, OK_CODE
        except self._user_service.TokenInvalid:
            raise InvalidEntityFormat(
                {'refresh_token': 'errors.invalidRefreshToken'}
            )