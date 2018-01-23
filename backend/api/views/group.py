from django.http import JsonResponse

from api.factories.services import ServiceType, ServiceFactory
from api.services.base import ListService
from api.views.base import BaseView


class GroupListView(BaseView):
  auth_rules = {
    'GET': ['manager', 'admin'],
  }

  def __init__(self, **kwargs):
    super().__init__(ServiceType.GROUPS, 'groups.', **kwargs)

  def get(self, request) -> JsonResponse:
    service: ListService = ServiceFactory.create(self.service_type, request=request)
    return service.read(**request.GET.dict())