import * as React from 'react';
import { useHistory } from 'react-router';

import { AdminPromoCodesCreatePresenter } from 'src/components/Admin/PromoCodes/Create/AdminPromoCodesCreatePresenter';
import { AdminPromoCodesCreateView } from 'src/components/Admin/PromoCodes/Create/AdminPromoCodesCreateView';
import { useDependencies } from 'src/DI/DI';
import { useAdminPromoCodesState } from 'src/state/AdminPromoCodesState';

export const AdminPromoCodesCreateContainer = () => {
  const history = useHistory();

  const { dependencies } = useDependencies();
  const { adminPromoCodesState } = useAdminPromoCodesState();

  return (
    <AdminPromoCodesCreatePresenter
      history={history}
      View={AdminPromoCodesCreateView}
      service={dependencies.services.promoCode}
      adminPromoCodesState={adminPromoCodesState}
    />
  );
};