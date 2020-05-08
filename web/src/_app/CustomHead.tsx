import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useIntl } from 'react-intl';

import { useMedia } from 'src/hooks/useMedia';
import { mediaQueries } from 'src/styles/media';
import { withPublicURL } from 'src/utils/url';

const YM_SCRIPT = `
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  ym(${process.env.YM_ACCOUNT_ID}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
  });
`;

export const CustomHead = () => {
  const intl = useIntl();
  const router = useRouter();

  const { iconFolder, manifestName } = useMedia(
    [mediaQueries.darkMode],
    [{ iconFolder: 'dark-icon', manifestName: 'dark-manifest.json' }],
    { iconFolder: 'icon', manifestName: 'manifest.json' },
  );

  return (
    <Head>
      <script type="text/javascript" dangerouslySetInnerHTML={{ __html: YM_SCRIPT }} />
      <noscript>
        <div>
          <img src="https://mc.yandex.ru/watch/62615554" style={{ position: 'absolute', left: '-9999px' }} alt="" />
        </div>
      </noscript>
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      ></link>
      <link rel="apple-touch-icon" sizes="180x180" href={withPublicURL(`${iconFolder}/apple-touch-icon.png`)} />
      <link rel="icon" type="image/png" sizes="32x32" href={withPublicURL(`${iconFolder}/favicon-32x32.png`)} />
      <link rel="icon" type="image/png" sizes="16x16" href={withPublicURL(`${iconFolder}/favicon-16x16.png`)} />
      <link rel="shortcut icon" href={withPublicURL(`${iconFolder}/favicon.ico`)} />
      <link rel="manifest" href={withPublicURL(manifestName)} />
      <title>{intl.formatMessage({ id: 'Meta.title' })}</title>
      <meta name="description" content={intl.formatMessage({ id: 'Meta.description' })} />
      <meta name="keywords" content={intl.formatMessage({ id: 'Meta.keywords' })} />
      <meta name="og:site_name" content="Eye8" />
      <meta name="og:url" content={withPublicURL(router.asPath)} />
      <meta name="og:title" content={intl.formatMessage({ id: 'Meta.title' })} />
      <meta name="og:description" content={intl.formatMessage({ id: 'Meta.description' })} />
      <meta name="og:image" content={withPublicURL('img/preview.jpg')} />
      <meta name="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={withPublicURL(router.asPath)} />
      <meta name="twitter:title" content={intl.formatMessage({ id: 'Meta.title' })} />
      <meta name="twitter:description" content={intl.formatMessage({ id: 'Meta.description' })} />
      <meta name="twitter:image:src" content={withPublicURL('img/preview.jpg')} />
    </Head>
  );
};