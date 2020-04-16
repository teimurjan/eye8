import { NextRouter } from 'next/router';
import * as React from 'react';

import { IProductTypeListResponseItem, IProductTypeListResponseMeta } from 'src/api/ProductTypeAPI';
import { IProps as IListViewProps } from 'src/components/Client/ProductType/ProductTypesList/ProductTypesListView';
import { IProductTypeService } from 'src/services/ProductTypeService';
import { agregateOrderedMapToArray } from 'src/utils/agregate';

export interface IProps {
  ListView: React.ComponentClass<IListViewProps> | React.SFC<IListViewProps>;
  productTypeService: IProductTypeService;
  categoryIdOrSlug?: number | string;
  router: NextRouter;
  initialProps?: {
    productTypes: { [key: string]: IProductTypeListResponseItem };
    productTypesMeta: IProductTypeListResponseMeta;
    productTypesOrder: number[];
    error?: string;
  };
}

export const ProductTypesPagePresenter = ({
  ListView,
  categoryIdOrSlug,
  productTypeService,
  initialProps,
  router,
}: IProps) => {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [isLoading, setLoading] = React.useState(false);
  const [productTypes, setProductTypes] = React.useState<{ [key: string]: IProductTypeListResponseItem }>({});
  const [productTypesMeta, setProductTypesMeta] = React.useState<IProductTypeListResponseMeta>({
    count: 0,
    pages_count: 0,
    limit: 0,
    page: 0,
  });
  const [productTypesOrder, setProductTypesOrder] = React.useState<number[]>([]);

  const loadProductTypes = React.useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const { entities, result, meta } = await productTypeService.getForCategory(categoryIdOrSlug!, page);
        setProductTypes(entities.productTypes || {});
        setProductTypesMeta(meta);
        setProductTypesOrder(result);
      } catch (e) {
        setError('errors.common');
      } finally {
        setLoading(false);
      }
    },
    [categoryIdOrSlug, productTypeService],
  );

  const onPageChange = React.useCallback(
    (page: number) => {
      const url = `${router.asPath.split('?')[0]}?page=${page}`
      router.push(router.pathname, url, { shallow: true });
      loadProductTypes(page);
    },
    [router, loadProductTypes],
  );

  // When navigating between categories the initialProps are changing and needed to be set to state
  React.useEffect(() => {
    if (initialProps) {
      setError(initialProps.error);
      setProductTypes(initialProps.productTypes);
      setProductTypesMeta(initialProps.productTypesMeta);
      setProductTypesOrder(initialProps.productTypesOrder);
    }
  }, [initialProps]);

  React.useEffect(() => {
    if (categoryIdOrSlug && !initialProps) {
      loadProductTypes(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryIdOrSlug]);

  return (
    <ListView
      productTypes={agregateOrderedMapToArray(productTypes, productTypesOrder)}
      meta={productTypesMeta}
      isLoading={isLoading}
      error={error}
      onPageChange={onPageChange}
    />
  );
};
