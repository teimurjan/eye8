import * as React from 'react';

import { useHistory } from 'react-router';
import { injectIntl } from 'react-intl';

import { useAdminBannersState } from 'src/state/AdminBannersState';
import { useIntlState } from 'src/state/IntlState';

import { useDependencies } from 'src/DI/DI';

import { AdminBannersCreatePresenter } from './AdminBannersCreatePresenter';
import { AdminBannersCreateView } from './AdminBannersCreateView';

export const AdminBannersCreateContainer = () => {
  const history = useHistory();

  const { dependencies } = useDependencies();
  const { adminBannersState } = useAdminBannersState();
  const { intlState } = useIntlState();

  return (
    <AdminBannersCreatePresenter
      history={history}
      View={injectIntl(AdminBannersCreateView)}
      service={dependencies.services.banner}
      intlState={intlState}
      adminBannersState={adminBannersState}
    />
  );
};