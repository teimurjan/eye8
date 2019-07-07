from src.repos.language import LanguageRepo

from src.services.decorators import allow_roles


class LanguageService:
    def __init__(self, repo: LanguageRepo,):
        self._repo = repo

    def get_all(self):
        return self._repo.get_all()

    def get_one(self, id_):
        try:
            return self._repo.get_by_id(id_)
        except self._repo.DoesNotExist:
            raise self.ProductTypeNotFound()

    @allow_roles(['admin', 'manager'])
    def delete(self, id_):
        try:
            return self._repo.delete(id_)
        except self._repo.DoesNotExist:
            raise self.ProductTypeNotFound()