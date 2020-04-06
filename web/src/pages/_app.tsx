import 'bulma/css/bulma.css';

import { CacheProvider } from '@emotion/core';
import { cache } from 'emotion';
import { ThemeProvider } from 'emotion-theming';
import { AppProps, AppContext } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { createIntl, createIntlCache } from 'react-intl';

import { makeDependenciesContainer } from 'src/DI/DependenciesContainer';
import { DIProvider } from 'src/DI/DI';
import { useMedia } from 'src/hooks/useMedia';
import { AppStateProvider } from 'src/state/AppState';
import { IntlStateProvider } from 'src/state/IntlState';
import { RatesStateProvider } from 'src/state/RatesState';
import { UserStateProvider, useUserState } from 'src/state/UserState';
import { mediaQueries } from 'src/styles/media';
import { defaultTheme } from 'src/themes';
import { formatStaticURL } from 'src/utils/url';

const intlCache = createIntlCache();

const EntryPoint = ({ children }: { children: React.ReactElement }) => {
  const {
    userState: { syncUser },
  } = useUserState();

  React.useEffect(() => {
    syncUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
};

const CustomHead = () => {
  const intl = useIntl();
  const router = useRouter();

  const { iconFolder, manifestName } = useMedia(
    [mediaQueries.darkMode],
    [{ iconFolder: 'dark-icon', manifestName: 'dark-manifest.json' }],
    { iconFolder: 'icon', manifestName: 'manifest.json' },
  );

  return (
    <Head>
      <link rel="apple-touch-icon" sizes="180x180" href={formatStaticURL(`${iconFolder}/apple-touch-icon.png`)} />
      <link rel="icon" type="image/png" sizes="32x32" href={formatStaticURL(`${iconFolder}/favicon-32x32.png`)} />
      <link rel="icon" type="image/png" sizes="16x16" href={formatStaticURL(`${iconFolder}/favicon-16x16.png`)} />
      <link rel="shortcut icon" href={formatStaticURL(`${iconFolder}/favicon.ico`)} />
      <link rel="manifest" href={formatStaticURL(manifestName)} />
      <title>{intl.formatMessage({ id: 'Meta.title' })}</title>
      <meta name="description" content={intl.formatMessage({ id: 'Meta.description' })} />
      <meta name="keywords" content={intl.formatMessage({ id: 'Meta.keywords' })} />
      <meta name="og:site_name" content="eye8.kg" />
      <meta name="og:url" content={router.asPath} />
      <meta name="og:title" content={intl.formatMessage({ id: 'Meta.title' })} />
      <meta name="og:description" content={intl.formatMessage({ id: 'Meta.description' })} />
      <meta name="og:image" content={formatStaticURL('icon/android-chrome-192x192.png')} />
      <meta name="og:type" content="website" />
    </Head>
  );
};

const CustomNextApp = ({
  Component,
  pageProps,
  locale,
  messages,
}: AppProps & { locale: string; messages: Record<string, string> }) => {
  const intl = createIntl(
    {
      locale,
      messages,
    },
    intlCache,
  );

  return (
    <CacheProvider value={cache}>
      <DIProvider value={{ dependencies: makeDependenciesContainer() }}>
        <ThemeProvider theme={defaultTheme}>
          <AppStateProvider>
            <IntlStateProvider intl={intl}>
              <RatesStateProvider>
                <UserStateProvider>
                  <EntryPoint>
                    <>
                      <CustomHead />
                      <Component {...pageProps} />
                    </>
                  </EntryPoint>
                </UserStateProvider>
              </RatesStateProvider>
            </IntlStateProvider>
          </AppStateProvider>
        </ThemeProvider>
      </DIProvider>
    </CacheProvider>
  );
};

CustomNextApp.getInitialProps = async ({ Component, ctx }: AppContext) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  const { req } = ctx;
  const { locale, messages } = req || (window as any).__NEXT_DATA__.props;

  return { pageProps, locale, messages };
};

export default CustomNextApp;