from cerberus import Validator
from src.validation_rules.product.update import UPDATE_PRODUCT_VALIDATION_RULES


class UpdateProductValidatorFactory:
    @staticmethod
    def create():
        return Validator(UPDATE_PRODUCT_VALIDATION_RULES)