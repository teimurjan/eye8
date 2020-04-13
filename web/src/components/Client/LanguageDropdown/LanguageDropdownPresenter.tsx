import * as React from 'react';

import { TriggerProps as PopoverTriggerProps } from 'src/components/common/Popover/Popover';
import { IIntlService } from 'src/services/IntlService';
import { IContextValue as IntlStateContextValue } from 'src/state/IntlState';
import { safeWindow } from 'src/utils/dom';

interface IProps extends IntlStateContextValue {
  View: React.ComponentClass<IViewProps> | React.SFC<IViewProps>;
  intlService: IIntlService;
}

export interface IViewProps {
  locales: string[];
  changeLocale: IIntlService['setLocale'];
  currentLocale: string;
  TriggerComponent?: React.ComponentType<PopoverTriggerProps>;
  className?: string;
}

export const LanguageDropdownPresenter = ({
  View,
  intlState: { availableLocales, locale },
  intlService,
  ...viewProps
}: IProps) => {
  const changeLocale = React.useCallback(
    (newLocale: string) => {
      intlService.setLocale(newLocale);
      safeWindow(w => w.location.reload(), undefined);
    },
    [intlService],
  );

  return (
    <View
      locales={availableLocales.map(({ name }) => name)}
      changeLocale={changeLocale}
      currentLocale={locale}
      {...viewProps}
    />
  );
};
