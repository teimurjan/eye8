import * as React from "react";

import { withRouter } from "react-router";

import { injectAdminFeatureTypesState } from "src/state/AdminFeatureTypesState";
import { injectIntlState } from "src/state/IntlState";

import { injectDependencies } from "src/DI/DI";
import {
  AdminFeatureTypesCreatePresenter,
  IProps
} from "./AdminFeatureTypesCreatePresenter";
import { AdminFeatureTypesCreateView } from "./AdminFeatureTypesCreateView";

const ConnectedAdminFeatureTypesCreatePresenter = injectIntlState(
  injectAdminFeatureTypesState(
    withRouter<IProps>(AdminFeatureTypesCreatePresenter)
  )
);

export const AdminFeatureTypesCreateContainer = injectDependencies(
  ({ dependencies }) => (
    <ConnectedAdminFeatureTypesCreatePresenter
      View={AdminFeatureTypesCreateView}
      service={dependencies.services.featureType}
    />
  )
);