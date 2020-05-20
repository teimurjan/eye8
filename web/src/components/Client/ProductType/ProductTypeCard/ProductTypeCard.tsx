/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import * as React from 'react';
import { useIntl } from 'react-intl';

import { IProductTypeListResponseItem } from 'src/api/ProductTypeAPI';
import { Image } from 'src/components/admin-ui/Image/Image';
import { Button } from 'src/components/client-ui/Button/Button';
import { LinkPassingProps } from 'src/components/client-ui/LinkPassingProps/LinkPassingProps';
import { Subtitle } from 'src/components/client-ui/Subtitle/Subtitle';
import { Tag } from 'src/components/client-ui/Tag/Tag';
import { Title } from 'src/components/client-ui/Title/Title';
import { usePriceRangeText } from 'src/components/Client/Price/Price';
import { mediaQueries } from 'src/styles/media';
import { formatMediaURL } from 'src/utils/url';

export interface IProps {
  productType: IProductTypeListResponseItem;
}

export const ProductTypeCard = ({ productType }: IProps) => {
  const theme = useTheme<ClientUITheme>();
  const intl = useIntl();
  const asPath = `/products/${productType.slug}`;
  const ref = React.useRef<HTMLAnchorElement>(null);
  const { price, discount } = usePriceRangeText({ range: productType.products || [] });

  return (
    <LinkPassingProps
      ref={ref}
      css={css`
        color: unset;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
      href="/products/[slug]"
      as={asPath}
      passHref
    >
      <Image className="image is-square" imgProps={{ src: formatMediaURL(productType.image), alt: productType.name }} />
      <div
        css={css`
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 0 5px;
        `}
      >
        <Title
          css={css`
            margin-top: 10px;
          `}
          size={6}
        >
          {productType.name}
        </Title>
        <Subtitle
          css={css`
            margin-bottom: 20px;
            @media ${mediaQueries.maxWidth768} {
              margin-bottom: 10px;
            }
          `}
          size={6}
        >
          {productType.short_description}
        </Subtitle>
      </div>
      <Button
        css={css`
          width: 100% !important;
          margin-top: auto;

          @media ${mediaQueries.maxWidth768} {
            height: 48px;
          }
        `}
      >
        <span
          css={css`
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 15px;

            @media ${mediaQueries.maxWidth768} {
              flex-direction: column;
            }
          `}
        >
          <span>{intl.formatMessage({ id: 'common.buy' })}</span>
          {price && (
            <>
              <span
                css={css`
                  &::after {
                    content: '|';
                  }

                  @media ${mediaQueries.maxWidth768} {
                    &::after {
                      content: '';
                      margin: 5px 0 2.5px 0;
                      height: 1px;
                      background: ${theme.borderColor};
                      width: 80px;
                      display: block;
                    }
                  }
                `}
              ></span>
              <span
                css={css`
                  color: ${theme.textColor};

                  button:hover &,
                  button:focus & {
                    color: inherit;
                  }

                  del {
                    font-size: 14px;
                    color: ${theme.textSecondaryColor};
                  }

                  @media ${mediaQueries.maxWidth768} {
                    font-size: 12px;

                    del {
                      font-size: 10px;
                    }
                  }
                `}
              >
                {price}
              </span>
            </>
          )}
        </span>
      </Button>
      {discount && (
        <Tag
          css={css`
            position: absolute;
            top: 10px;
            right: 10px;
          `}
        >
          {discount}
        </Tag>
      )}
    </LinkPassingProps>
  );
};
