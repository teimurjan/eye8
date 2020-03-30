import * as React from 'react';
import { injectIntl } from 'react-intl';
import { useHistory, useParams } from 'react-router';

import { AdminFeatureTypesEditPresenter } from 'src/components/Admin/FeatureTypes/Edit/AdminFeatureTypesEditPresenter';
import { AdminFeatureTypesEditView } from 'src/components/Admin/FeatureTypes/Edit/AdminFeatureTypesEditView';
import { useDependencies } from 'src/DI/DI';
import { useAdminFeatureTypesState } from 'src/state/AdminFeatureTypesState';
import { useIntlState } from 'src/state/IntlState';



export const AdminFeatureTypesEditContainer = () => {
  const history = useHistory();
  const params = useParams<{ id: string }>();

  const { dependencies } = useDependencies();
  const { adminFeatureTypesState } = useAdminFeatureTypesState();
  const { intlState } = useIntlState();

  return (
    <AdminFeatureTypesEditPresenter
      featureTypeId={parseInt(params.id, 10)}
      history={history}
      View={injectIntl(AdminFeatureTypesEditView)}
      service={dependencies.services.featureType}
      intlState={intlState}
      adminFeatureTypesState={adminFeatureTypesState}
    />
  );
};
