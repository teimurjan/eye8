import * as React from 'react';

import { HomePresenter } from 'src/components/Client/Home/HomePresenter';
import { HomeView } from 'src/components/Client/Home/HomeView';
import { useDependencies } from 'src/DI/DI';
import { useAppState } from 'src/state/AppState';


export const HomeContainer = () => {
  const { appState } = useAppState();
  const {
    dependencies: {
      services: { banner: bannerService, productType: productTypeService },
    },
  } = useDependencies();

  return (
    <HomePresenter
      appState={appState}
      bannerService={bannerService}
      productTypeService={productTypeService}
      View={HomeView}
    />
  );
};
