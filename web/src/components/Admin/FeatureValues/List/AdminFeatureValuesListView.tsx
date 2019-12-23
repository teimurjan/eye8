import * as React from 'react';

import { IntlShape, injectIntl } from 'react-intl';

import { AdminTable, IntlRenderer } from 'src/components/Admin/AdminTable';
import { Container } from 'src/components/common/Container/Container';
import { LinkButton } from 'src/components/common/LinkButton/LinkButton';
import { NoDataAvailable } from 'src/components/common/NoDataAvailable/NoDataAvaiable';
import { Section } from 'src/components/common/Section/Section';

import { IViewProps as IProps } from './AdminFeatureValuesListPresenter';
import { FeatureValueTypeRenderer } from './FeatureValueTypeRenderer';

const NewFeatureValueButton = injectIntl(({ intl }) => (
  <LinkButton to="/admin/featureValues/new" color="is-primary">
    {intl.formatMessage({ id: 'AdminFeatureValues.notFound.cta' })}
  </LinkButton>
));

const NoFeatureValuesAvialable = injectIntl(({ intl }) => (
  <NoDataAvailable
    title={intl.formatMessage({ id: 'AdminFeatureValues.notFound.title' })}
    description={intl.formatMessage({
      id: 'AdminFeatureValues.notFound.description',
    })}
    CTA={<NewFeatureValueButton />}
  />
));

const renderNoData = () => <NoFeatureValuesAvialable />;

type FeatureValue = IProps['featureValues'][0];

export const AdminFeatureValuesListView = ({
  featureValues,
  locales,
  intl,
  isLoading,
  isDataLoaded,
}: IProps & { intl: IntlShape }) => (
  <Section>
    <Container>
      <AdminTable<FeatureValue>
        pathPrefix="/admin/featureValues"
        isLoading={isLoading}
        isDataLoaded={isDataLoaded}
        entities={featureValues}
        renderNoData={renderNoData}
        intl={intl}
      >
        <AdminTable.Col<FeatureValue> key_="id" title={intl.formatMessage({ id: 'common.ID' })} />
        <AdminTable.Col<FeatureValue>
          key_="name"
          title={intl.formatMessage({ id: 'AdminFeatureValues.names' })}
          renderer={new IntlRenderer(locales)}
        />
        <AdminTable.Col<FeatureValue>
          key_="feature_type"
          title={intl.formatMessage({ id: 'AdminFeatureValues.featureType' })}
          renderer={new FeatureValueTypeRenderer(intl.locale)}
        />
      </AdminTable>

      {isDataLoaded && featureValues.length > 0 && <NewFeatureValueButton />}
    </Container>
  </Section>
);