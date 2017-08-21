import abc

import jwt
from django.core.exceptions import FieldError
from django.db import IntegrityError
from django.http import JsonResponse

from api.models import *
from api.utils.crypt import encrypt, matches
from api.utils.errors.error_constants import GLOBAL_ERR_KEY, NOT_VALID_IMAGE, \
  SAME_CATEGORY_NAME_ERR, SAME_EMAIL_ERR, INVALID_EMAIL_OR_PASSWORD_ERR, INVALID_FEATURE_TYPE_ID_ERR, \
  SAME_PRODUCT_TYPE_NAME_ERR, INVALID_QUERY_ERR
from api.utils.errors.error_messages import get_not_exist_msg
from api.utils.form_fields_constants import NAME_FIELD, EMAIL_FIELD, PASSWORD_FIELD, DESCRIPTION_FIELD, \
  DISCOUNT_FIELD, QUANTITY_FIELD, IMAGE_FIELD, PRICE_FIELD, CATEGORY_FIELD, FEATURE_TYPES_FIELD, \
  SHORT_DESCRIPTION_FIELD, TOKEN_KEY, DATA_KEY, ID_FIELD, GROUP_FIELD, AUTH_FIELDS, FEATURE_VALUES_FIELD, \
  FEATURE_TYPE_FIELD, PRODUCT_TYPE_FIELD, IMAGES_FIELD
from api.utils.image_utils import base64_to_image, ImageToBase64ConversionException
from api.utils.response_constants import MESSAGE_OK, NOT_FOUND_CODE, BAD_REQUEST_CODE
from main import settings


def generate_token(user):
  payload = {ID_FIELD: user.pk, NAME_FIELD: user.name, GROUP_FIELD: user.group.name}
  return jwt.encode(payload, settings.SECRET_KEY).decode()


class BaseSerializer:
  def __init__(self):
    self.data = None


class ModelSerializer(BaseSerializer):
  def __init__(self, Model):
    super().__init__()
    self.Model = Model


class ListSerializer(ModelSerializer):
  @abc.abstractmethod
  def create(self):
    return

  def read(self, **kwargs):
    try:
      filtered_kwargs = {k: v for k, v in kwargs.items() if v is not None}
      return DataJsonResponse([model.to_dict() for model in self.Model.objects.filter(**filtered_kwargs)])
    except FieldError:
      return JsonResponse({GLOBAL_ERR_KEY: [INVALID_QUERY_ERR]}, status=BAD_REQUEST_CODE)


class DetailSerializer(ModelSerializer):
  def __init__(self, Model):
    super().__init__(Model)
    self.model_id = None

  def read(self):
    try:
      user = self.Model.objects.get(pk=self.model_id)
      return DataJsonResponse(user.to_dict())
    except self.Model.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(self.Model)]}, status=NOT_FOUND_CODE)

  @abc.abstractmethod
  def update(self):
    return

  def delete(self):
    try:
      self.Model.objects.get(pk=self.model_id).delete()
      return JsonResponse(MESSAGE_OK)
    except self.Model.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(self.Model)]}, status=NOT_FOUND_CODE)


class DataJsonResponse(JsonResponse):
  def __init__(self, data):
    super().__init__({DATA_KEY: data})


class AuthSerializer(BaseSerializer):
  def register(self):
    try:
      name = self.data[NAME_FIELD]
      email = self.data[EMAIL_FIELD]
      password = self.data[PASSWORD_FIELD]
      group, created = Group.objects.get_or_create(name='reader')
      user = User.objects.create(name=name, email=email, password=encrypt(password), group=group)
      return JsonResponse({TOKEN_KEY: generate_token(user)})
    except IntegrityError as e:
      if 'Duplicate entry' in str(e):
        return JsonResponse({EMAIL_FIELD: [SAME_EMAIL_ERR]}, status=BAD_REQUEST_CODE)

  def login(self):
    email = self.data[EMAIL_FIELD]
    password = self.data[PASSWORD_FIELD]
    try:
      user = User.objects.get(email=email)
      if matches(password, user.password):
        return JsonResponse({TOKEN_KEY: generate_token(user)})
      else:
        return JsonResponse({AUTH_FIELDS: [INVALID_EMAIL_OR_PASSWORD_ERR]}, status=BAD_REQUEST_CODE)
    except User.DoesNotExist:
      return JsonResponse({AUTH_FIELDS: [INVALID_EMAIL_OR_PASSWORD_ERR]}, status=BAD_REQUEST_CODE)


class UserSerializer(DetailSerializer):
  def __init__(self):
    super().__init__(User)

  def update(self):
    try:
      user = User.objects.get(pk=self.model_id)
      user.name = self.data[NAME_FIELD]
      password = self.data[PASSWORD_FIELD]
      user.password = encrypt(password)
      user.group = Group.objects.get(pk=self.data[GROUP_FIELD])
      return DataJsonResponse(user.to_dict())
    except User.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(User)]}, status=NOT_FOUND_CODE)
    except Group.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(Group)]}, status=BAD_REQUEST_CODE)


class UserListSerializer(ListSerializer):
  def __init__(self):
    super().__init__(User)

  def create(self):
    try:
      group = Group.objects.get(pk=self.data[GROUP_FIELD])
      user = User.objects.create(name=self.data[NAME_FIELD], email=self.data[EMAIL_FIELD],
                                 password=self.data[PASSWORD_FIELD], group=group)
      return DataJsonResponse(user.to_dict())
    except Group.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(Group)]}, status=BAD_REQUEST_CODE)
    except IntegrityError as e:
      if 'Duplicate entry' in str(e):
        return JsonResponse({EMAIL_FIELD: [SAME_EMAIL_ERR]}, status=BAD_REQUEST_CODE)


class CategoryListSerializer(ListSerializer):
  def __init__(self):
    super().__init__(Category)

  def create(self):
    name = self.data[NAME_FIELD]
    feature_types_ids = self.data[FEATURE_TYPES_FIELD]
    try:
      feature_types = [FeatureType.objects.get(pk=feature_type_id) for feature_type_id in feature_types_ids]
      category = Category()
      category.name = name
      category.save()
      category.feature_types.add(*feature_types)
      return DataJsonResponse(category.to_dict())
    except FeatureType.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(FeatureType)]}, status=BAD_REQUEST_CODE)
    except IntegrityError as e:
      if 'Duplicate entry' in str(e):
        return JsonResponse({NAME_FIELD: [SAME_CATEGORY_NAME_ERR]}, status=BAD_REQUEST_CODE)


class CategorySerializer(DetailSerializer):
  def __init__(self):
    super().__init__(Category)

  def update(self):
    try:
      category = Category.objects.get(pk=self.model_id)
      name = self.data[NAME_FIELD]
      category.name = name
      feature_types_ids = self.data[FEATURE_TYPES_FIELD]
      feature_types = [FeatureType.objects.get(pk=feature_type_id) for feature_type_id in feature_types_ids]
      category.feature_types.set(feature_types)
      category.save()
      return DataJsonResponse(category.to_dict())
    except FeatureType.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(FeatureType)]}, status=NOT_FOUND_CODE)
    except Category.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(Category)]}, status=NOT_FOUND_CODE)
    except IntegrityError as e:
      if 'Duplicate entry' in str(e):
        return JsonResponse({NAME_FIELD: [SAME_CATEGORY_NAME_ERR]}, status=BAD_REQUEST_CODE)


class ProductTypeListSerializer(ListSerializer):
  def __init__(self):
    super().__init__(ProductType)

  def create(self):
    try:
      name = self.data[NAME_FIELD]
      description = self.data[DESCRIPTION_FIELD]
      short_description = self.data[SHORT_DESCRIPTION_FIELD]
      category = Category.objects.get(pk=self.data[CATEGORY_FIELD])
      possible_feature_values = FeatureValue.objects.filter(feature_type__categories__in=[category])
      feature_values = list()
      for feature_value_id in self.data[FEATURE_VALUES_FIELD]:
        feature_value = FeatureValue.objects.get(pk=feature_value_id)
        if feature_value not in possible_feature_values and feature_value not in feature_values:
          return JsonResponse({FEATURE_VALUES_FIELD: [INVALID_FEATURE_TYPE_ID_ERR]}, status=BAD_REQUEST_CODE)
        feature_values.append(feature_value)
      image = base64_to_image(self.data[IMAGE_FIELD], name)
      product_type = ProductType.objects.create(name=name,
                                                description=description,
                                                short_description=short_description,
                                                image=image,
                                                category=category)
      product_type.feature_values.set(feature_values)
      return DataJsonResponse(product_type.to_dict())
    except FeatureValue.DoesNotExist:
      return JsonResponse({FEATURE_VALUES_FIELD: [get_not_exist_msg(FeatureValue)]}, status=BAD_REQUEST_CODE)
    except Category.DoesNotExist:
      return JsonResponse({CATEGORY_FIELD: [get_not_exist_msg(Category)]}, status=BAD_REQUEST_CODE)
    except ImageToBase64ConversionException:
      return JsonResponse({IMAGE_FIELD: [NOT_VALID_IMAGE]}, status=BAD_REQUEST_CODE)


class ProductTypeSerializer(DetailSerializer):
  def __init__(self):
    super().__init__(ProductType)

  def update(self):
    try:
      product_type = ProductType.objects.get(pk=self.model_id)
      name = self.data[NAME_FIELD]
      category = Category.objects.get(pk=self.data[CATEGORY_FIELD])
      possible_feature_values = FeatureValue.objects.filter(feature_type__categories__in=[category])
      feature_values = list()
      for feature_value_id in self.data[FEATURE_VALUES_FIELD]:
        feature_value = FeatureValue.objects.get(pk=feature_value_id)
        if feature_value not in possible_feature_values and feature_value not in feature_values:
          return JsonResponse({FEATURE_VALUES_FIELD: [INVALID_FEATURE_TYPE_ID_ERR]}, status=BAD_REQUEST_CODE)
        feature_values.append(feature_value)
      image = base64_to_image(self.data[IMAGE_FIELD], name)
      product_type.name = name
      product_type.description = self.data[DESCRIPTION_FIELD]
      product_type.short_description = self.data[SHORT_DESCRIPTION_FIELD]
      product_type.image = image
      product_type.category = category
      product_type.feature_values.set(feature_values)
      product_type.save()
      return DataJsonResponse(product_type.to_dict())
    except ProductType.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(ProductType)]}, status=NOT_FOUND_CODE)
    except FeatureValue.DoesNotExist:
      return JsonResponse({FEATURE_VALUES_FIELD: [get_not_exist_msg(FeatureValue)]}, status=BAD_REQUEST_CODE)
    except Category.DoesNotExist:
      return JsonResponse({CATEGORY_FIELD: [get_not_exist_msg(Category)]}, status=BAD_REQUEST_CODE)
    except ImageToBase64ConversionException:
      return JsonResponse({IMAGE_FIELD: [NOT_VALID_IMAGE]}, status=BAD_REQUEST_CODE)
    except IntegrityError as e:
      if 'Duplicate entry' in str(e):
        return JsonResponse({NAME_FIELD: [SAME_PRODUCT_TYPE_NAME_ERR]}, status=BAD_REQUEST_CODE)


class FeatureTypeListSerializer(ListSerializer):
  def __init__(self):
    super().__init__(FeatureType)

  def create(self):
    feature_type = FeatureType.objects.create(name=self.data[NAME_FIELD])
    return DataJsonResponse(feature_type.to_dict())


class FeatureTypeSerializer(DetailSerializer):
  def __init__(self):
    super().__init__(FeatureType)

  def update(self):
    try:
      feature_type = FeatureType.objects.get(pk=self.model_id)
      feature_type.name = self.data[NAME_FIELD]
      feature_type.save()
      return DataJsonResponse(feature_type.to_dict())
    except FeatureType.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(FeatureType)]}, status=NOT_FOUND_CODE)


class FeatureValueListSerializer(ListSerializer):
  def __init__(self):
    super().__init__(FeatureValue)

  def create(self):
    try:
      feature_type = FeatureType.objects.get(pk=self.data[FEATURE_TYPE_FIELD])
      feature_value = FeatureValue.objects.create(name=self.data[NAME_FIELD], feature_type=feature_type)
      return DataJsonResponse(feature_value.to_dict())
    except FeatureType.DoesNotExist:
      return JsonResponse({FEATURE_TYPE_FIELD: [INVALID_FEATURE_TYPE_ID_ERR]}, status=BAD_REQUEST_CODE)


class FeatureValueSerializer(DetailSerializer):
  def __init__(self):
    super().__init__(FeatureValue)

  def update(self):
    try:
      feature_value = FeatureValue.objects.get(pk=self.model_id)
      feature_value.name = self.data[NAME_FIELD]
      feature_value.feature_type = FeatureType.objects.get(pk=self.data[FEATURE_TYPE_FIELD])
      feature_value.save()
      return DataJsonResponse(feature_value.to_dict())
    except FeatureValue.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(FeatureValue)]}, status=NOT_FOUND_CODE)
    except FeatureType.DoesNotExist:
      return JsonResponse({FEATURE_TYPE_FIELD: [INVALID_FEATURE_TYPE_ID_ERR]}, status=BAD_REQUEST_CODE)


class ProductSerializer(DetailSerializer):
  def __init__(self):
    super().__init__(Product)

  def update(self):
    try:
      product = Product.objects.get(pk=self.model_id)
      discount = self.data[DISCOUNT_FIELD]
      price = self.data[PRICE_FIELD]
      quantity = self.data[QUANTITY_FIELD]
      product_type = ProductType.objects.get(pk=self.data[PRODUCT_TYPE_FIELD])
      product_images = list()

      for image in self.data[IMAGES_FIELD]:
        product_images.append(ProductImage(product=product, file=base64_to_image(image, product_type.name)))

      possible_feature_values = FeatureValue.objects.filter(product_types__in=[product_type])
      feature_values = list()
      for feature_value_id in self.data[FEATURE_VALUES_FIELD]:
        feature_value = FeatureValue.objects.get(pk=feature_value_id)
        feature_value_of_the_same_feature_type = \
          feature_value.feature_type in [added_feature_value.feature_type for added_feature_value in feature_values]
        if feature_value not in possible_feature_values or feature_value_of_the_same_feature_type:
          return JsonResponse({FEATURE_VALUES_FIELD: [INVALID_FEATURE_TYPE_ID_ERR]}, status=BAD_REQUEST_CODE)
        feature_values.append(feature_value)

      product.discount = discount
      product.price = price
      product.quantity = quantity
      product.product_type = product_type
      product.feature_values.set(feature_values)
      product.images.set(product_images, bulk=False)
      product.save()
      return DataJsonResponse(product.to_dict())
    except Product.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [get_not_exist_msg(Product)]}, status=NOT_FOUND_CODE)
    except ProductType.DoesNotExist:
      return JsonResponse({PRODUCT_TYPE_FIELD: [get_not_exist_msg(ProductType)]}, status=BAD_REQUEST_CODE)
    except FeatureValue.DoesNotExist:
      return JsonResponse({FEATURE_VALUES_FIELD: [get_not_exist_msg(FeatureValue)]}, status=BAD_REQUEST_CODE)
    except ImageToBase64ConversionException:
      return JsonResponse({IMAGES_FIELD: [NOT_VALID_IMAGE]}, status=BAD_REQUEST_CODE)


class ProductListSerializer(ListSerializer):
  def __init__(self):
    super().__init__(Product)

  def create(self):
    pass
