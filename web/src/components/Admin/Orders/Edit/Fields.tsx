/** @jsx jsx */
import * as React from 'react';

import { css, jsx } from '@emotion/core';

import { Field as FinalFormField, FieldRenderProps } from 'react-final-form';
import { useIntl } from 'react-intl';
import { FormTextField } from 'src/components/common/FormTextField/FormTextField';
import { IOrderListResponseItem } from 'src/api/OrderAPI';
import { Field } from 'src/components/common/Field/Field';
import { Label } from 'src/components/common/Label/Label';
import { HelpText } from 'src/components/common/HelpText/HelpText';
import { ProductSelectContainer } from 'src/components/ProductSelect/ProductSelectContainer';
import { Quantity } from 'src/components/Client/Cart/CartItem/Quantity';
import { PriceText } from 'src/components/Client/Price/Price';
import { calculateDiscountedPrice } from 'src/utils/number';
import { FormNativeSelectField } from 'src/components/common/FormNativeSelectField/FormNativeSelectField';

const UserNameField = ({ input, meta }: FieldRenderProps<string>) => {
  const intl = useIntl();

  const showError = meta.touched && meta.error;

  return (
    <FormTextField
      labelProps={{
        children: intl.formatMessage({ id: 'AdminOrders.userName' }),
      }}
      inputProps={{
        ...input,
        isDanger: showError,
      }}
      helpTextProps={{
        children: showError ? intl.formatMessage({ id: meta.error }) : undefined,
        type: 'is-danger',
      }}
    />
  );
};

const UserPhoneNumberField = ({ input, meta }: FieldRenderProps<string>) => {
  const intl = useIntl();

  const showError = meta.touched && meta.error;

  return (
    <FormTextField
      labelProps={{
        children: intl.formatMessage({ id: 'AdminOrders.userPhoneNumber' }),
      }}
      inputProps={{
        ...input,
        isDanger: showError,
      }}
      helpTextProps={{
        children: showError ? intl.formatMessage({ id: meta.error }) : undefined,
        type: 'is-danger',
      }}
    />
  );
};

const UserAddressField = ({ input, meta }: FieldRenderProps<string>) => {
  const intl = useIntl();

  const showError = meta.touched && meta.error;

  return (
    <FormTextField
      labelProps={{
        children: intl.formatMessage({ id: 'AdminOrders.userAddress' }),
      }}
      inputProps={{
        ...input,
        isDanger: showError,
      }}
      helpTextProps={{
        children: showError ? intl.formatMessage({ id: meta.error }) : undefined,
        type: 'is-danger',
      }}
    />
  );
};

const StatusSelectField = ({ input, meta }: FieldRenderProps<string>) => {
  const showError = meta.touched && meta.error;

  const intl = useIntl();

  return (
    <FormNativeSelectField
      labelProps={{
        children: intl.formatMessage({
          id: 'AdminOrders.statusSelect.label',
        }),
      }}
      selectProps={{
        ...input,
        options: [
          {
            title: 'idle',
            value: 'idle',
          },
          {
            title: 'approved',
            value: 'approved',
          },
          {
            title: 'completed',
            value: 'completed',
          },
          {
            title: 'rejected',
            value: 'rejected',
          },
        ],
      }}
      helpTextProps={{
        children: showError ? intl.formatMessage({ id: meta.error }) : undefined,
        type: 'is-danger',
      }}
    />
  );
};

const OrderItemsField = ({ input, meta }: FieldRenderProps<IOrderListResponseItem['items']>) => {
  const intl = useIntl();

  const showError = meta.touched && meta.error;

  const setOrderItem = React.useCallback(
    (id: number, orderItem: IOrderListResponseItem['items'][0]) => {
      input.onChange(input.value.map(orderItem_ => (orderItem_.id === id ? orderItem : orderItem_)));
    },
    [input],
  );

  const removeOrderItem = React.useCallback(
    (orderItem: IOrderListResponseItem['items'][0]) => {
      input.onChange(input.value.filter(orderItem_ => orderItem_.id !== orderItem.id));
    },
    [input],
  );

  const addOrderItem = React.useCallback(
    (orderItem: IOrderListResponseItem['items'][0]) => {
      const itemWithProduct = input.value.find(
        orderItem_ => orderItem_.product && orderItem.product && orderItem_.product.id === orderItem.product.id,
      );

      if (itemWithProduct) {
        setOrderItem(itemWithProduct.id, { ...itemWithProduct, quantity: itemWithProduct.quantity + 1 });
      } else {
        input.onChange([...input.value, orderItem]);
      }
    },
    [setOrderItem, input],
  );

  const totalPrice = input.value
    ? input.value.reduce(
        (acc, orderItem) =>
          acc +
          calculateDiscountedPrice(orderItem.product_price_per_item, orderItem.product_discount) * orderItem.quantity,
        0,
      )
    : 0;

  return (
    <Field>
      <Label>{intl.formatMessage({ id: 'AdminOrders.items' })}</Label>
      {input.value
        ? input.value.map(orderItem => (
            <div key={orderItem.id}>
              <div
                css={css`
                  display: flex;
                  justify-content: space-between;
                `}
              >
                {orderItem.product && orderItem.product.product_type.name}
                <ProductSelectContainer
                  placeholder={intl.formatMessage({ id: 'AdminOrders.anotherProduct.placeholder' })}
                  onChange={product => {
                    setOrderItem(orderItem.id, {
                      id: NaN,
                      product_price_per_item: product.price,
                      product_discount: product.discount,
                      product_upc: product.upc,
                      product,
                      quantity: 1,
                    });
                  }}
                />
              </div>
              <Quantity
                count={orderItem.quantity}
                allowedCount={orderItem.product ? orderItem.product.quantity : 0}
                onAddClick={() => setOrderItem(orderItem.id, { ...orderItem, quantity: orderItem.quantity + 1 })}
                onRemoveClick={() =>
                  orderItem.quantity === 1
                    ? removeOrderItem(orderItem)
                    : setOrderItem(orderItem.id, { ...orderItem, quantity: orderItem.quantity - 1 })
                }
              />
            </div>
          ))
        : null}
      <ProductSelectContainer
        placeholder={intl.formatMessage({ id: 'AdminOrders.newProduct.placeholder' })}
        onChange={product => {
          addOrderItem({
            id: NaN,
            product_price_per_item: product.price,
            product_discount: product.discount,
            product_upc: product.upc,
            product,
            quantity: 1,
          });
        }}
      />
      <div>
        {intl.formatMessage({ id: 'Cart.total' })}: <PriceText price={totalPrice} />
      </div>
      <HelpText type="is-danger">{showError ? intl.formatMessage({ id: meta.error }) : undefined}</HelpText>
    </Field>
  );
};

export const Fields: React.SFC<{}> = () => {
  return (
    <React.Fragment>
      <FinalFormField key="user_name" name="user_name" component={UserNameField} />
      <FinalFormField key="user_phone_number" name="user_phone_number" component={UserPhoneNumberField} />
      <FinalFormField key="user_address" name="user_address" component={UserAddressField} />
      <FinalFormField key="items" name="items" render={props => <OrderItemsField {...props} />} />
      <FinalFormField key="status" name="status" component={StatusSelectField} />
    </React.Fragment>
  );
};