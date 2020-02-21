import * as React from 'react';

import { IntlShape } from 'react-intl';

import { ModalForm } from '../../ModalForm';

import { IViewProps as IProps } from './AdminProductsEditPresenter';
import { Fields } from '../Create/Fields';

export const AdminProductsEditView = ({
  isOpen,
  edit,
  close,
  isLoading,
  error,
  intl,
  validate,
  productTypes,
  preloadingError,
  isUpdating,
  featureValues,
  initialValues,
}: IProps & { intl: IntlShape }) => (
  <ModalForm
    formID="adminProductsEditForm"
    isOpen={isOpen}
    onSubmit={edit}
    onClose={close}
    isLoading={isUpdating}
    isPreloading={isLoading}
    preloadingError={preloadingError}
    globalError={error}
    title={intl.formatMessage({ id: 'AdminProducts.edit.title' })}
    fields={<Fields productTypes={productTypes} featureValues={featureValues} />}
    validate={validate}
    initialValues={initialValues}
    wide
  />
);