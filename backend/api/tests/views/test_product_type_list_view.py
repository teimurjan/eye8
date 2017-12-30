import base64
import os

from django.urls import reverse

from api.models import ProductType, FeatureValue, Category
from api.tests.views.base.base_list_view_test import ListViewTestCase
from api.tests.views.fixtures.product_type_list_view_fixture import ProductTypeListViewFixture
from api.tests.views.utils import get_intl_texts_errors, get_intl_texts
from api.utils.errors.error_constants import NOT_VALID_IMAGE, GLOBAL_ERR_KEY
from api.utils.errors.error_messages import get_not_exist_msg
from api.utils.form_fields import NAME_FIELD, DESCRIPTION_FIELD, SHORT_DESCRIPTION_FIELD, \
  FEATURE_VALUES_FIELD, CATEGORY_FIELD, IMAGE_FIELD
from main.settings import MEDIA_ROOT

list_url = reverse('product_types')


def get_data(name=get_intl_texts(), description=get_intl_texts(), short_description=get_intl_texts(),
             feature_values=None, category=None, image=None) -> dict:
  return {NAME_FIELD: name, DESCRIPTION_FIELD: description, SHORT_DESCRIPTION_FIELD: short_description,
          FEATURE_VALUES_FIELD: feature_values, CATEGORY_FIELD: category, IMAGE_FIELD: image}


def get_image(extension='jpg') -> str:
  pwd = os.path.dirname(__file__)
  with open('%s/assets/test_product_type_img.jpg' % pwd, 'rb') as image:
    return 'data:image/%s;base64,%s' % (extension, base64.b64encode(image.read()).decode())


class ProductTypeListViewTest(ListViewTestCase):
  _fixtures = ListViewTestCase._fixtures + [ProductTypeListViewFixture]
  _rm_after = [os.path.join(MEDIA_ROOT)]

  def setUp(self):
    self.phone_category_id = Category.objects.filter(name__value="Phone")[0].id
    self.laptop_category_id = Category.objects.filter(name__value="Laptop")[0].id
    self.feature_values_ids = [FeatureValue.objects.filter(name__value='Black')[0].id,
                               FeatureValue.objects.filter(name__value='White')[0].id,
                               FeatureValue.objects.filter(name__value='Gold')[0].id,
                               FeatureValue.objects.filter(name__value='64GB')[0].id,
                               FeatureValue.objects.filter(name__value='128GB')[0].id,
                               FeatureValue.objects.filter(name__value='256GB')[0].id]

  def test_should_get_success(self):
    self.should_get_all_succeed(list_url, ProductType)

  def test_should_get_with_filter_succeed(self):
    feature_values_id = self.feature_values_ids[0]
    url = '{0}?feature_value__in=[{1}]'.format(list_url, feature_values_id)
    self.should_get_succeed_with_filter(url, ProductType, {'feature_value__in': [feature_values_id]})

  def test_should_get_with_exclude_succeed(self):
    url = '{0}?exclude=["names"]'.format(list_url)
    self.should_get_succeed_with_exclude(url, ProductType, exclude=['names'])

  def test_should_get_with_serialized_field_succeed(self):
    url = '{0}?serialize=["feature_value"]'.format(list_url)
    self.should_get_succeed_with_serialize(url, ProductType, serialize=['feature_value'])

  def test_should_post_succeed(self):
    en_name = 'Iphone 8'
    en_description = 'Iphone 8 Description'
    en_short_description = 'Iphone 8 Short Description'
    data = get_data(get_intl_texts(en_name), get_intl_texts(en_description),
                    get_intl_texts(en_short_description), feature_values=self.feature_values_ids,
                    category=self.phone_category_id, image=get_image())
    expected = data.copy()
    del expected[IMAGE_FIELD]
    expected[NAME_FIELD] = en_name
    expected[DESCRIPTION_FIELD] = en_description
    expected[SHORT_DESCRIPTION_FIELD] = en_short_description
    response_data = self.should_post_succeed(list_url, data, self.admin_user_token, expected)
    self.assertIsNotNone(response_data[IMAGE_FIELD])

  def test_should_post_with_serialized_field_succeed(self):
    en_name = 'Iphone 8'
    en_description = 'Iphone 8 Description'
    en_short_description = 'Iphone 8 Short Description'
    data = get_data(get_intl_texts(en_name), get_intl_texts(en_description),
                    get_intl_texts(en_short_description), feature_values=self.feature_values_ids,
                    category=self.phone_category_id, image=get_image())
    expected = data.copy()
    del expected[IMAGE_FIELD], expected[CATEGORY_FIELD]
    expected[NAME_FIELD] = en_name
    expected[DESCRIPTION_FIELD] = en_description
    expected[SHORT_DESCRIPTION_FIELD] = en_short_description
    url = '{0}?serialize=["category"]'.format(list_url)
    response_data = self.should_post_succeed(url, data, self.admin_user_token, expected)
    self.assertIsNotNone(response_data[IMAGE_FIELD])
    self.assertIsInstance(response_data[CATEGORY_FIELD], dict)

  def test_should_post_require_auth(self):
    self.should_post_require_auth(list_url)

  def test_should_post_null_values(self):
    data = get_data()
    expected_content = {
      FEATURE_VALUES_FIELD: ['errors.productTypes.feature_values.mustNotBeNull'],
      NAME_FIELD: get_intl_texts_errors('productTypes', field='name'),
      DESCRIPTION_FIELD: get_intl_texts_errors('productTypes', field='description'),
      SHORT_DESCRIPTION_FIELD: get_intl_texts_errors('productTypes', field='short_description'),
      CATEGORY_FIELD: ['errors.productTypes.category.mustNotBeNull'],
      IMAGE_FIELD: ['errors.productTypes.image.mustNotBeNull']
    }
    self.should_post_fail(list_url, data=data, expected_content=expected_content,
                          token=self.admin_user_token)

  def test_should_post_no_data(self):
    self.should_post_fail_when_no_data_sent(list_url, self.admin_user_token)

  def test_should_post_empty_values(self):
    data = get_data(get_intl_texts(''), get_intl_texts(''),
                    get_intl_texts(''), feature_values=self.feature_values_ids,
                    category=self.phone_category_id, image=get_image())
    expected_content = {
      NAME_FIELD: get_intl_texts_errors('productTypes', error='mustNotBeEmpty', field='name'),
      DESCRIPTION_FIELD: get_intl_texts_errors('productTypes', error='mustNotBeEmpty', field='description'),
      SHORT_DESCRIPTION_FIELD: get_intl_texts_errors('productTypes', error='mustNotBeEmpty', field='short_description'),
    }
    self.should_post_fail(list_url, data=data, expected_content=expected_content,
                          token=self.admin_user_token)

  def test_should_post_too_long_values(self):
    data = get_data(get_intl_texts('a' * 31), get_intl_texts('a' * 1001),
                    get_intl_texts('a' * 301), feature_values=self.feature_values_ids,
                    category=1, image=get_image())
    expected_content = {
      NAME_FIELD: get_intl_texts_errors('productTypes', error='maxLength', field='name'),
      DESCRIPTION_FIELD: get_intl_texts_errors('productTypes', error='maxLength', field='description'),
      SHORT_DESCRIPTION_FIELD: get_intl_texts_errors('productTypes', error='maxLength', field='short_description'),
    }
    self.should_post_fail(list_url, data=data, expected_content=expected_content,
                          token=self.admin_user_token)

  def test_should_post_no_such_category(self):
    data = get_data(get_intl_texts('Iphone 8'), get_intl_texts('Iphone 8 Description'),
                    get_intl_texts('Iphone 8 Short Description'), feature_values=self.feature_values_ids,
                    category=999, image=get_image())
    expected_content = {GLOBAL_ERR_KEY: [get_not_exist_msg(Category)]}
    self.should_post_fail(list_url, data=data, expected_content=expected_content,
                          token=self.admin_user_token)

  def test_should_post_no_such_feature_value(self):
    data = get_data(get_intl_texts('Iphone 8'), get_intl_texts('Iphone 8 Description'),
                    get_intl_texts('Iphone 8 Short Description'), feature_values=[999],
                    category=self.phone_category_id, image=get_image())
    expected_content = {GLOBAL_ERR_KEY: [get_not_exist_msg(FeatureValue)]}
    self.should_post_fail(list_url, data=data, expected_content=expected_content,
                          token=self.admin_user_token)

  def test_should_post_invalid_image(self):
    data = get_data(get_intl_texts('Iphone 8'), get_intl_texts('Iphone 8 Description'),
                    get_intl_texts('Iphone 8 Short Description'), feature_values=self.feature_values_ids,
                    category=self.phone_category_id, image='invalid')
    expected_content = {GLOBAL_ERR_KEY: [NOT_VALID_IMAGE]}
    self.should_post_fail(list_url, data=data, expected_content=expected_content,
                          token=self.admin_user_token)

  def test_should_post_invalid_feature_values(self):
    data = get_data(get_intl_texts('Macbook Pro'), get_intl_texts('Macbook Pro Description'),
                    get_intl_texts('Macbook Pro Short Description'), feature_values=self.feature_values_ids,
                    category=self.laptop_category_id, image=get_image())
    expected_content = {GLOBAL_ERR_KEY: ['Invalid feature values']}
    self.should_post_fail(list_url, data=data, expected_content=expected_content,
                          token=self.admin_user_token)
