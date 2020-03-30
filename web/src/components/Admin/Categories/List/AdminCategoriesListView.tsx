/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IntlShape, injectIntl } from 'react-intl';

import { AdminTable, IntlRenderer } from 'src/components/Admin/AdminTable';
import { IViewProps as IProps } from 'src/components/Admin/Categories/List/AdminCategoriesListPresenter';
import { LinkButton } from 'src/components/common/LinkButton/LinkButton';
import { NoDataAvailable } from 'src/components/common/NoDataAvailable/NoDataAvaiable';
import { Section } from 'src/components/common/Section/Section';
import { fullWidthMixin } from 'src/styles/mixins';



export const NewCategoryButton = injectIntl(({ intl }) => (
  <LinkButton to="/admin/categories/new" color="is-primary">
    {intl.formatMessage({ id: 'AdminCategories.notFound.cta' })}
  </LinkButton>
));

const NoCategoriesAvialable = injectIntl(({ intl }) => (
  <NoDataAvailable
    title={intl.formatMessage({ id: 'AdminCategories.notFound.title' })}
    description={intl.formatMessage({
      id: 'AdminCategories.notFound.description',
    })}
    CTA={
      <LinkButton to="/admin/categories/new" color="is-primary">
        {intl.formatMessage({ id: 'AdminCategories.notFound.cta' })}
      </LinkButton>
    }
  />
));

const renderNoData = () => <NoCategoriesAvialable />;

type Category = IProps['categories'][0];

export const AdminCategoriesListView = ({
  categories,
  locales,
  intl,
  isLoading,
  isDataLoaded,
}: IProps & { intl: IntlShape }) => (
  <Section css={fullWidthMixin}>
    <AdminTable<Category>
      pathPrefix="/admin/categories"
      isLoading={isLoading}
      isDataLoaded={isDataLoaded}
      entities={categories}
      renderNoData={renderNoData}
      intl={intl}
    >
      <AdminTable.Col<Category> key_="id" title={intl.formatMessage({ id: 'common.ID' })} />
      <AdminTable.Col<Category>
        key_="parent_category_id"
        title={intl.formatMessage({
          id: 'AdminCategories.parentCategoryID',
        })}
      />
      <AdminTable.Col<Category>
        key_="name"
        title={intl.formatMessage({ id: 'AdminCategories.names' })}
        renderer={new IntlRenderer(locales)}
      />
    </AdminTable>

    {isDataLoaded && categories.length > 0 && <NewCategoryButton />}
  </Section>
);
