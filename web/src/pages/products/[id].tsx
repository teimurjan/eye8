import * as React from 'react';
import { Then } from 'ttypes';

import { Layout } from 'src/components/Client/Layout';
import { ProductTypePageContainer } from 'src/components/Client/ProductTypePage/ProductTypePageContainer';
import { dependenciesFactory } from 'src/DI/DependenciesContainer';
import { GetServerSideProps } from 'next';

export default ({ productType, products, error }: Then<ReturnType<typeof getServerSideProps>>['props']) => (
  <Layout>
    <ProductTypePageContainer initialProps={{ products, productType, error }} />
  </Layout>
);

export const getServerSideProps: GetServerSideProps = async ({ params = {}, req, res }) => {
  const dependencies = dependenciesFactory({ req, res });

  try {
    const productType = await dependencies.services.productType.getByID(parseInt(params.id as string, 10));
    const products = productType ? await dependencies.services.product.getForProductType(productType.id) : [];

    return {
      props: {
        productType,
        products,
      },
    };
  } catch (e) {
    return {
      props: {
        error: 'errors.common',
        productType: null,
        products: [],
      },
    };
  }
};
