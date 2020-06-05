/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from 'emotion-theming';
import React from 'react';
import { useIntl } from 'react-intl';

import { IOrderForUserResponseItem } from 'src/api/OrderAPI';
import { Anchor } from 'src/components/client-ui/Anchor/Anchor';
import { Tag } from 'src/components/client-ui/Tag/Tag';
import { Tooltip } from 'src/components/client-ui/Tooltip/Tooltip';
import { PriceText } from 'src/components/Client/Price/Price';
import { useIntlState } from 'src/state/IntlState';
import { mediaQueries } from 'src/styles/media';
import { getFormattedDateString } from 'src/utils/date';
import { calculateDiscountedPrice } from 'src/utils/number';
import { isPromoCodeApplicableForProduct } from 'src/utils/promoCode';

interface IProps {
  order: IOrderForUserResponseItem;
  className?: string;
}

const OrderStatus = ({ status }: { status: IOrderForUserResponseItem['status'] }) => {
  const intl = useIntl();

  return status === 'rejected' || status === 'completed' ? (
    <Tag
      css={css`
        text-transform: uppercase;
      `}
    >
      {intl.formatMessage({ id: `Order.status.${status}` })}
    </Tag>
  ) : (
    <Tooltip<HTMLSpanElement>
      placement="top"
      delay={300}
      renderTrigger={({ open, close, ref }) => (
        <Tag
          ref={ref}
          onMouseEnter={open}
          onMouseLeave={close}
          css={css`
            text-transform: uppercase;
          `}
        >
          {intl.formatMessage({ id: `Order.status.${status}` })}
        </Tag>
      )}
    >
      {intl.formatMessage({ id: `Order.status.${status}.tooltip` })}
    </Tooltip>
  );
};

export const OrderItem: React.FC<IProps> = ({ order, className }) => {
  const theme = useTheme<ClientUITheme>();
  const intl = useIntl();
  const {
    intlState: { locale },
  } = useIntlState();

  const total = order.items.reduce(
    (acc, item) =>
      acc +
      calculateDiscountedPrice(item.product_price_per_item, [
        item.product_discount,
        order.promo_code && item.product && isPromoCodeApplicableForProduct(order.promo_code, item.product)
          ? order.promo_code.discount || 0
          : 0,
      ]) *
        item.quantity,
    0,
  );

  const orderCreatedOnDate = new Date(order.created_on);

  return (
    <div
      className={className}
      css={css`
        border-bottom: 1px solid ${theme.borderColor};
        padding: 0 10px;

        &:hover {
          background: ${theme.backgroundPrimaryHoverColor};
        }
      `}
    >
      <div
        css={css`
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
        `}
      >
        <div
          css={css`
            text-transform: uppercase;
          `}
        >
          {intl.formatMessage({ id: 'Order.orderPlaced' })}
          <br />
          {orderCreatedOnDate.toLocaleDateString(locale)}
        </div>
        <div
          css={css`
            text-transform: uppercase;
            text-align: right;
          `}
        >
          {intl.formatMessage({ id: 'Cart.total' })}:
          <br />
          <b>
            <PriceText price={total} date={getFormattedDateString(orderCreatedOnDate)} />
          </b>
        </div>
      </div>
      <div
        css={css`
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        `}
      >
        <div>
          {order.items.map(item =>
            item.product ? (
              <Anchor key={item.id} href={`/products/${item.product.product_type.slug}`}>
                {item.product.product_type.name}{' '}
                <FontAwesomeIcon
                  size="sm"
                  css={css`
                    margin-left: 5px;
                    display: none;

                    @media ${mediaQueries.maxWidth768} {
                      display: inline-block;
                      vertical-align: baseline;
                    }
                  `}
                  icon={faExternalLinkAlt}
                />
              </Anchor>
            ) : null,
          )}
        </div>
        <OrderStatus status={order.status} />
      </div>
    </div>
  );
};