import * as React from 'react';

import { useIntl } from 'react-intl';

import { ModalForm } from '../../ModalForm';

import { IViewProps as IProps } from './AdminOrdersEditPresenter';

import { Fields } from './Fields';

export const AdminOrdersEditView = ({
  isOpen,
  edit,
  close,
  isLoading,
  error,
  validate,
  preloadingError,
  isUpdating,
  initialValues,
}: IProps) => {
  const intl = useIntl();
  return (
    <ModalForm
      formID="adminOrdersEditForm"
      isOpen={isOpen}
      onSubmit={edit}
      onClose={close}
      isLoading={isUpdating}
      isPreloading={isLoading}
      preloadingError={preloadingError}
      globalError={error}
      title={intl.formatMessage({ id: 'AdminOrders.edit.title' })}
      fields={<Fields />}
      validate={validate}
      initialValues={initialValues}
      wide
    />
  );
};