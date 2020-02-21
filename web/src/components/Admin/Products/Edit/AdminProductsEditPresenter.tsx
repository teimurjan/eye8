import * as React from 'react';

import { History } from 'history';
import * as yup from 'yup';

import * as schemaValidator from 'src/components/SchemaValidator';

import { IProductService } from 'src/services/ProductService';

import { IContextValue as AdminFeatureValuesStateContextValue } from 'src/state/AdminFeatureValuesState';
import { IContextValue as AdminProductsStateContextValue } from 'src/state/AdminProductsState';
import { IContextValue as AdminProductTypesStateContextValue } from 'src/state/AdminProductTypesState';

import { useTimeoutExpired } from 'src/hooks/useTimeoutExpired';

import { IProductTypeListRawIntlResponseItem } from 'src/api/ProductTypeAPI';
import { IProductListResponseItem } from 'src/api/ProductAPI';

export interface IProps
  extends AdminFeatureValuesStateContextValue,
    AdminProductsStateContextValue,
    AdminProductTypesStateContextValue {
  View: React.ComponentClass<IViewProps> | React.SFC<IViewProps>;
  service: IProductService;
  history: History;
  productId: number;
}

interface IFormValues {
  quantity: string;
  discount: string;
  price: string;
  feature_values: string[];
  product_type_id: string;
  images: Array<string | File>;
}

export interface IViewProps {
  isOpen: boolean;
  edit: (values: IFormValues) => any;
  isLoading: boolean;
  isUpdating: boolean;
  error?: string;
  preloadingError?: string;
  close: () => any;
  validate?: (values: object) => object | Promise<object>;
  featureValues: AdminFeatureValuesStateContextValue['adminFeatureValuesState']['featureValues'];
  productTypes: IProductTypeListRawIntlResponseItem[];
  initialValues?: IFormValues;
}

export const AdminProductsEditPresenter: React.FC<IProps> = ({
  productId,
  history,
  adminFeatureValuesState: { getFeatureValues, featureValues, isListLoading: featureValuesLoading },
  adminProductTypesState: { getProductTypes, productTypes, isListLoading: productTypesLoading },
  adminProductsState: { getProducts },
  service,
  View,
}) => {
  const [product, setProduct] = React.useState<IProductListResponseItem | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [isUpdating, setUpdating] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);
  const [preloadingError, setPreloadingError] = React.useState<string | undefined>(undefined);

  const isTimeoutExpired = useTimeoutExpired(1000);

  const validator = new schemaValidator.SchemaValidator(
    yup.object().shape({
      quantity: yup.number().required('common.errors.field.empty'),
      discount: yup.number().required('common.errors.field.empty'),
      price: yup.number().required('common.errors.field.empty'),
      product_type_id: yup.number().required('common.errors.field.empty'),
      feature_values: yup
        .array()
        .of(yup.number())
        .test('allFeatureValuesChosen', 'AdminProducts.errors.noFeatureValues', function(value) {
          if (!this.parent.product_type_id) {
            return true;
          }

          const chosenProductType = productTypes.find(({ id }) => this.parent.product_type_id === id);
          return chosenProductType ? chosenProductType.feature_types.length === (value || []).length : false;
        }),
      images: yup
        .array()
        .of(yup.mixed())
        .required('common.errors.field.empty')
        .min(1, 'common.errors.field.empty'),
    }),
  );

  React.useEffect(() => {
    (async () => {
      try {
        await Promise.all([getProductTypes(), getFeatureValues()]);

        const product = await service.getOne(productId);
        if (product) {
          setProduct(product);
        } else {
          setPreloadingError('AdminProducts.notFound');
        }
      } catch (e) {
        setPreloadingError('errors.common');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = React.useCallback(() => history.push('/admin/products'), [history]);

  const edit: IViewProps['edit'] = React.useCallback(
    async values => {
      setUpdating(true);

      const formattedValues = {
        ...values,
        product_type_id: parseInt(values.product_type_id, 10),
        quantity: parseInt(values.quantity, 10),
        discount: parseInt(values.discount, 10),
        price: parseInt(values.price, 10),
        feature_values: values.feature_values.map(id => parseInt(id, 10)),
      };

      try {
        await service.edit(productId, formattedValues);
        getProducts();
        setUpdating(false);
        close();
      } catch (e) {
        setError('errors.common');
        setUpdating(false);
      }
    },
    [close, getProducts, productId, service],
  );

  return (
    <View
      productTypes={productTypes}
      featureValues={featureValues}
      isOpen={true}
      edit={edit}
      error={error}
      isLoading={isTimeoutExpired && (featureValuesLoading || productTypesLoading || isLoading)}
      isUpdating={isUpdating}
      close={close}
      validate={(validator || { validate: undefined }).validate}
      preloadingError={preloadingError}
      initialValues={
        product
          ? {
              quantity: product.quantity.toString(),
              discount: product.discount.toString(),
              price: product.price.toString(),
              feature_values: product.feature_values.map(id => id.toString()),
              product_type_id: product.product_type.id.toString(),
              images: product.images,
            }
          : undefined
      }
    />
  );
};