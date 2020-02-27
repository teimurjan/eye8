import * as React from 'react';

import { History } from 'history';
import * as yup from 'yup';

import * as schemaValidator from 'src/components/SchemaValidator';

import { IContextValue as AdminBannersStateContextValue } from 'src/state/AdminBannersState';
import { IContextValue as IntlStateContextValue } from 'src/state/IntlState';

import { IBannerListRawIntlResponseItem } from 'src/api/BannerAPI';

import { IBannerService } from 'src/services/BannerService';

import { useTimeoutExpired } from 'src/hooks/useTimeoutExpired';

import { getFieldName, parseFieldName } from '../../IntlField';
import { useLazy } from 'src/hooks/useLazy';

export interface IProps extends AdminBannersStateContextValue, IntlStateContextValue {
  View: React.ComponentClass<IViewProps> | React.SFC<IViewProps>;
  service: IBannerService;
  history: History;
  bannerId: number;
}

export interface IViewProps {
  isOpen: boolean;
  edit: (values: {
    texts: {
      [key: string]: string;
    };
    link_texts: {
      [key: string]: string;
    };
    link?: string;
    image: string;
    text_top_offset?: string;
    text_left_offset?: string;
    text_right_offset?: string;
    text_bottom_offset?: string;
  }) => void;
  error?: string;
  close: () => void;
  availableLocales: IntlStateContextValue['intlState']['availableLocales'];
  validate?: (values: object) => object | Promise<object>;
  isLoading: boolean;
  isUpdating: boolean;
  preloadingError?: string;
  initialValues: object;
}

export const BANNER_TEXT_FIELD_KEY = 'text';
export const BANNER_LINK_TEXT_FIELD_KEY = 'link_text';

export const AdminBannersEditPresenter: React.FC<IProps> = ({
  intlState,
  history,
  adminBannersState: { setBanner: setBannerToState, isListLoading: bannersLoading },
  intlState: { availableLocales },
  service,
  View,
  bannerId,
}) => {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [banner, setBanner] = React.useState<IBannerListRawIntlResponseItem | undefined>(undefined);
  const [isUpdating, setUpdating] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [preloadingError, setPreloadingError] = React.useState<string | undefined>(undefined);

  const isTimeoutExpired = useTimeoutExpired(1000);

  const makeValidator = React.useCallback(
    () =>
      new schemaValidator.SchemaValidator(
        yup.object().shape(
          intlState.availableLocales.reduce(
            (acc, locale) => ({
              ...acc,
              [getFieldName(BANNER_TEXT_FIELD_KEY, locale)]: yup.string().required('common.errors.field.empty'),
              [getFieldName(BANNER_LINK_TEXT_FIELD_KEY, locale)]: yup.string(),
            }),
            {
              parent_banner_id: yup.number().nullable(true),
            },
          ),
        ),
      ),
    [intlState],
  );

  const validator = useLazy({
    make: makeValidator,
    trigger: availableLocales.length,
  });

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const banner = await service.getOneRawIntl(bannerId);
        if (banner) {
          setBanner(banner);
        } else {
          setPreloadingError('AdminBanners.notFound');
        }
      } catch (e) {
        setPreloadingError('errors.common');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = React.useCallback(() => history.push('/admin/banners'), [history]);

  const edit: IViewProps['edit'] = React.useCallback(
    async values => {
      setUpdating(true);

      const formattedValues = Object.keys(values).reduce(
        (acc, fieldName) => {
          const { key, id } = parseFieldName(fieldName);
          if (key === BANNER_TEXT_FIELD_KEY) {
            return {
              ...acc,
              texts: { ...acc.texts, [id]: values[fieldName] },
            };
          }
          if (key === BANNER_LINK_TEXT_FIELD_KEY) {
            return {
              ...acc,
              link_texts: { ...acc.link_texts, [id]: values[fieldName] },
            };
          }

          return acc;
        },
        {
          texts: {},
          link_texts: {},
          image: values.image,
          link: values.link ? values.link : null,
          text_top_offset: values.text_top_offset ? parseInt(values.text_top_offset, 10) : null,
          text_bottom_offset: values.text_bottom_offset ? parseInt(values.text_bottom_offset, 10) : null,
          text_left_offset: values.text_left_offset ? parseInt(values.text_left_offset, 10) : null,
          text_right_offset: values.text_right_offset ? parseInt(values.text_right_offset, 10) : null,
        },
      );

      try {
        const banner = await service.edit(bannerId, formattedValues);
        setBannerToState(banner);
        setUpdating(false);
        close();
      } catch (e) {
        setError('errors.common');
        setUpdating(false);
      }
    },
    [bannerId, close, service, setBannerToState],
  );

  const initialValues = React.useMemo(() => {
    if (banner) {
      return {
        ...availableLocales.reduce(
          (acc, locale) => ({
            ...acc,
            [getFieldName(BANNER_TEXT_FIELD_KEY, locale)]: banner.text[locale.id],
            [getFieldName(BANNER_LINK_TEXT_FIELD_KEY, locale)]: banner.link_text[locale.id],
          }),
          {},
        ),
        image: banner.image,
        link: banner.link,
        text_top_offset: banner.text_top_offset,
        text_bottom_offset: banner.text_bottom_offset,
        text_left_offset: banner.text_left_offset,
        text_right_offset: banner.text_right_offset,
      };
    }

    return {};
  }, [availableLocales, banner]);

  return (
    <View
      isOpen={true}
      edit={edit}
      error={error}
      isUpdating={isUpdating}
      isLoading={isTimeoutExpired && (isLoading || bannersLoading)}
      close={close}
      availableLocales={availableLocales}
      validate={(validator || { validate: undefined }).validate}
      initialValues={initialValues}
      preloadingError={preloadingError}
    />
  );
};