import * as React from 'react';

import { History } from 'history';
import * as yup from 'yup';

import * as schemaValidator from 'src/components/SchemaValidator';

import { IContextValue as AdminFeatureTypesStateContextValue } from 'src/state/AdminFeatureTypesState';
import { IContextValue as AdminProductTypesStateContextValue } from 'src/state/AdminProductTypesState';
import { IContextValue as AdminCategoriesStateContextValue } from 'src/state/AdminCategoriesState';
import { IContextValue as IntlStateContextValue } from 'src/state/IntlState';

import { IProductTypeListRawIntlResponseItem } from 'src/api/ProductTypeAPI';

import { IProductTypeService } from 'src/services/ProductTypeService';

import { useTimeoutExpired } from 'src/hooks/useTimeoutExpired';

import { getFieldName, parseFieldName } from '../../IntlField';
import { useLazy } from 'src/hooks/useLazy';
import {
  PRODUCT_TYPE_NAME_FIELD_KEY,
  PRODUCT_TYPE_DESCRIPTION_FIELD_KEY,
  PRODUCT_TYPE_SHORT_DESCRIPTION_FIELD_KEY,
} from '../Create/AdminProductTypesCreatePresenter';

export interface IProps
  extends AdminCategoriesStateContextValue,
    AdminProductTypesStateContextValue,
    AdminFeatureTypesStateContextValue,
    IntlStateContextValue {
  View: React.ComponentClass<IViewProps> | React.SFC<IViewProps>;
  service: IProductTypeService;
  history: History;
  productTypeId: number;
}

export interface IViewProps {
  isOpen: boolean;
  edit: (values: {
    names: { [key: string]: string };
    descriptions: { [key: string]: string };
    short_descriptions: { [key: string]: string };
    feature_types: string[];
    category_id?: string;
    image: string;
  }) => any;
  isLoading: boolean;
  isUpdating: boolean;
  error?: string;
  preloadingError?: string;
  close: () => any;
  availableLocales: IntlStateContextValue['intlState']['availableLocales'];
  validate?: (values: object) => object | Promise<object>;
  categories: AdminCategoriesStateContextValue['adminCategoriesState']['categories'];
  featureTypes: AdminFeatureTypesStateContextValue['adminFeatureTypesState']['featureTypes'];
  initialValues: object;
}

export const CATEGORY_NAME_FIELD_KEY = 'name';

export const AdminProductTypesEditPresenter: React.FC<IProps> = ({
  intlState,
  history,
  adminCategoriesState: { getCategories, categories, isListLoading: categoriesLoading },
  adminFeatureTypesState: { getFeatureTypes, featureTypes, isListLoading: featureTypesLoading },
  adminProductTypesState: { setProductType: setProductTypeToState },
  intlState: { availableLocales },
  service,
  View,
  productTypeId,
}) => {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [productType, setProductType] = React.useState<IProductTypeListRawIntlResponseItem | undefined>(undefined);
  const [isUpdating, setUpdating] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [preloadingError, setPreloadingError] = React.useState<string | undefined>(undefined);

  const isTimeoutExpired = useTimeoutExpired(1000);

  const makeValidator = React.useCallback(
    () =>
      new schemaValidator.SchemaValidator(
        yup.object().shape(
          intlState.availableLocales.reduce(
            (acc, locale) => ({
              ...acc,
              [getFieldName(PRODUCT_TYPE_NAME_FIELD_KEY, locale)]: yup.string().required('common.errors.field.empty'),
              [getFieldName(PRODUCT_TYPE_DESCRIPTION_FIELD_KEY, locale)]: yup
                .string()
                .required('common.errors.field.empty'),
              [getFieldName(PRODUCT_TYPE_SHORT_DESCRIPTION_FIELD_KEY, locale)]: yup
                .string()
                .required('common.errors.field.empty'),
            }),
            {
              category_id: yup.number().required('common.errors.field.empty'),
              feature_types: yup
                .array()
                .of(yup.number())
                .required('AdminProductTypes.errors.noFeatureTypes')
                .min(1, 'AdminProductTypes.errors.noFeatureTypes'),
              image: yup.mixed().required('common.errors.field.empty'),
            },
          ),
        ),
      ),
    [intlState],
  );

  const validator = useLazy({
    make: makeValidator,
    trigger: availableLocales.length,
  });

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        Promise.all([getCategories(), getFeatureTypes()]);

        const productType = await service.getOneRawIntl(productTypeId);
        if (productType) {
          setProductType(productType);
        } else {
          setPreloadingError('AdminProductTypes.notFound');
        }
      } catch (e) {
        setPreloadingError('errors.common');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = React.useCallback(() => history.push('/admin/productTypes'), [history]);

  const edit: IViewProps['edit'] = React.useCallback(
    async values => {
      setUpdating(true);

      const formattedValues = Object.keys(values).reduce(
        (acc, fieldName) => {
          const { key, id } = parseFieldName(fieldName);
          if (
            [
              PRODUCT_TYPE_NAME_FIELD_KEY,
              PRODUCT_TYPE_DESCRIPTION_FIELD_KEY,
              PRODUCT_TYPE_SHORT_DESCRIPTION_FIELD_KEY,
            ].indexOf(key) !== -1
          ) {
            const pluralKeys = `${key}s`;
            return { ...acc, [pluralKeys]: { ...acc[pluralKeys], [id]: values[fieldName] } };
          }

          return acc;
        },
        {
          names: {},
          descriptions: {},
          short_descriptions: {},
          category_id: parseInt(values.category_id as string, 10),
          feature_types: values.feature_types.map(id => parseInt(id, 10)),
          image: values.image,
        },
      );

      try {
        const productType = await service.edit(productTypeId, formattedValues);
        setProductTypeToState(productType);
        setUpdating(false);
        close();
      } catch (e) {
        setError('errors.common');
        setUpdating(false);
      }
    },
    [setProductTypeToState, productTypeId, close, service],
  );

  const initialValues = React.useMemo(() => {
    if (productType) {
      return {
        ...availableLocales.reduce(
          (acc, locale) => ({
            ...acc,
            [getFieldName(PRODUCT_TYPE_NAME_FIELD_KEY, locale)]: productType.name[locale.id],
            [getFieldName(PRODUCT_TYPE_DESCRIPTION_FIELD_KEY, locale)]: productType.description[locale.id],
            [getFieldName(PRODUCT_TYPE_SHORT_DESCRIPTION_FIELD_KEY, locale)]: productType.short_description[locale.id],
          }),
          {},
        ),
        category_id: productType.category,
        feature_types: productType.feature_types,
        image: productType.image,
      };
    }

    return {};
  }, [availableLocales, productType]);

  return (
    <View
      featureTypes={featureTypes}
      categories={categories}
      isOpen={true}
      edit={edit}
      error={error}
      isUpdating={isUpdating}
      isLoading={isTimeoutExpired && (isLoading || categoriesLoading || featureTypesLoading)}
      close={close}
      availableLocales={availableLocales}
      validate={(validator || { validate: undefined }).validate}
      initialValues={initialValues}
      preloadingError={preloadingError}
    />
  );
};