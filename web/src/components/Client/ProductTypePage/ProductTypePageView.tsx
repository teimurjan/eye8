/** @jsx jsx */
import * as React from 'react';

import { css, jsx } from '@emotion/core';
import { uniqBy } from 'lodash';

import { IViewProps as IProps } from './ProductTypePagePresenter';
import { LoaderLayout } from 'src/components/common/LoaderLayout/LoaderLayout';
import { ErrorLayout } from 'src/components/common/ErrorLayout/ErrorLayout';
import { useIntl } from 'react-intl';
import { ProductTypeImageCarousel } from '../ProductType/ProductTypeImageCarousel/ProductTypeImageCarousel';
import { Title } from 'src/components/common/Title/Title';
import { Subtitle } from 'src/components/common/Subtitle/Subtitle';
import { calculateDiscountedPrice } from 'src/utils/number';
import { FormNativeSelectField } from 'src/components/common/FormNativeSelectField/FormNativeSelectField';
import { Message } from 'src/components/common/Message/Message';

const getAllFeatureValuesGroupedByType = (
  products: IProps['products'],
  allFeatureTypes: Array<IProps['products'][0]['feature_values'][0]['feature_type']>,
) =>
  allFeatureTypes.reduce<{ [key: string]: IProps['products'][0]['feature_values'] }>(
    (acc, featureType) => ({
      ...acc,
      [featureType.id]: products.reduce(
        (acc, product) =>
          uniqBy<IProps['products'][0]['feature_values'][0]>(
            [...acc, ...product.feature_values.filter(featureValue => featureValue.feature_type.id === featureType.id)],
            'id',
          ),
        [],
      ),
    }),
    {},
  );

export const ProductTypePageView = ({ productType, products, error, isLoading }: IProps) => {
  const intl = useIntl();
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [initialValuesSet, setInitialValuesSet] = React.useState(false);
  const [chosenFeatureValues, setChosenFeatureValues] = React.useState<{ [key: string]: number }>({});

  const allImages = products.reduce((acc, product) => [...acc, ...product.images], [
    ...(productType ? [productType.image] : []),
  ]);

  const allFeatureTypes =
    products.length > 0 ? products[0].feature_values.map(featureValue => featureValue.feature_type) : [];

  const allFeatureValuesGroupedByFeatureType = getAllFeatureValuesGroupedByType(products, allFeatureTypes);

  React.useEffect(() => {
    if (!initialValuesSet && Object.keys(allFeatureValuesGroupedByFeatureType).length > 0) {
      setInitialValuesSet(true);
      setChosenFeatureValues(
        Object.keys(allFeatureValuesGroupedByFeatureType).reduce((acc, featureTypeId) => {
          const featueValues = allFeatureValuesGroupedByFeatureType[featureTypeId];
          return { ...acc, [featureTypeId]: featueValues.length > 0 ? featueValues[0].id : undefined };
        }, {}),
      );
    }
  }, [allFeatureValuesGroupedByFeatureType, initialValuesSet]);

  const matchingProduct = products.find(product =>
    product.feature_values.every(featureValue => chosenFeatureValues[featureValue.feature_type.id] === featureValue.id),
  );

  const autoChangeImage = React.useCallback(() => {
    const activeImage = allImages[activeImageIndex];
    if (matchingProduct && matchingProduct.images.indexOf(activeImage) === -1) {
      if (matchingProduct.images[0]) {
        setActiveImageIndex(allImages.indexOf(matchingProduct.images[0]));
      }
    }
  }, [activeImageIndex, allImages, matchingProduct]);

  const onFeatureValueChange = React.useCallback(
    (featureTypeId: number, featureValueId: number) => {
      setChosenFeatureValues({ ...chosenFeatureValues, [featureTypeId]: featureValueId });
      autoChangeImage();
    },
    [autoChangeImage, chosenFeatureValues],
  );

  if (isLoading) {
    return <LoaderLayout />;
  }

  if (error) {
    return <ErrorLayout>{intl.formatMessage({ id: error })}</ErrorLayout>;
  }

  const getOptions = (featureType: IProps['products'][0]['feature_values'][0]['feature_type']) =>
    allFeatureValuesGroupedByFeatureType[featureType.id].map(featureValue => ({
      title: featureValue.name,
      value: featureValue.id.toString(),
    }));

  return productType ? (
    <div>
      <div
        css={css`
          align-items: flex-start;
          margin-bottom: 1.5rem;
        `}
        className="level"
      >
        <div
          css={css`
            justify-content: flex-start;
          `}
          className="level-left"
        >
          <ProductTypeImageCarousel
            images={allImages}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
          />
        </div>
        <div
          css={css`
            align-items: flex-start;
            padding-left: 1.5rem;
            flex-direction: column;
          `}
          className="level-item"
        >
          <Title
            css={css`
              margin-bottom: 1.5rem !important;
            `}
            size={1}
          >
            {productType.name}
          </Title>
          {allFeatureTypes.map(featureType => (
            <FormNativeSelectField
              key={featureType.id}
              labelProps={{ children: featureType.name }}
              selectProps={{
                value: chosenFeatureValues[featureType.id] ? chosenFeatureValues[featureType.id].toString() : undefined,
                onChange: e => onFeatureValueChange(featureType.id, parseInt(e.currentTarget.value, 10)),
                options: getOptions(featureType),
              }}
              fieldProps={{ style: { width: 300 } }}
            />
          ))}
          <div
            css={css`
              margin-bottom: 1.5rem;
            `}
          >
            {matchingProduct && matchingProduct.quantity > 0 ? (
              <Subtitle className="has-text-primary" size={3}>
                ${calculateDiscountedPrice(matchingProduct.price, matchingProduct.discount)}
              </Subtitle>
            ) : (
              <Subtitle className="has-text-grey-light" size={3}>
                {intl.formatMessage({ id: 'ProductPage.notInStock' })}
              </Subtitle>
            )}
          </div>
          <Message
            css={css`
              width: 100%;
            `}
          >
            <Message.Body>{productType.short_description}</Message.Body>
          </Message>
        </div>
      </div>
      <div className="content" dangerouslySetInnerHTML={{ __html: productType.description }}></div>
    </div>
  ) : null;
};