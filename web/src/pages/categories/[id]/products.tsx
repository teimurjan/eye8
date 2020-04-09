import * as React from 'react';
import { Then } from 'ttypes';

import { Layout } from 'src/components/Client/Layout';
import { ProductTypesPageContainer } from 'src/components/Client/ProducTypesPage/ProductTypesPageContainer';
import { dependenciesFactory } from 'src/DI/DependenciesContainer';
import { GetServerSideProps } from 'next';
import { paramToIDOrSlug } from 'src/utils/params';

export default ({
  productTypes,
  productTypesOrder,
  productTypesMeta,
  error,
}: Then<ReturnType<typeof getServerSideProps>>['props']) => (
  <Layout>
    <ProductTypesPageContainer initialProps={{ productTypes, productTypesOrder, productTypesMeta, error }} />
  </Layout>
);

export const getServerSideProps: GetServerSideProps = async ({ params = {}, req, res }) => {
  const dependencies = dependenciesFactory({ req, res });

  try {
    const { entities, meta, result } = await dependencies.services.productType.getForCategory(
      paramToIDOrSlug(params.id as string),
      1,
    );

    return {
      props: {
        productTypes: entities.productTypes || {},
        productTypesMeta: meta,
        productTypesOrder: result,
      },
    };
  } catch (e) {
    return {
      props: {
        error: 'errors.common',
        productTypes: {},
        productTypesOrder: [],
        productTypesMeta: {
          count: 0,
          pages_count: 0,
          limit: 0,
          page: 0,
        },
      },
    };
  }
};
