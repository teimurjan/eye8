import * as React from 'react';

// https://usehooks.com/useMedia/
export const useMedia = <T>(queries: string[], values: T[], defaultValue: T) => {
  const mediaQueryLists = queries.map(q => window.matchMedia(q));

  const getValue = () => {
    const index = mediaQueryLists.findIndex(mql => mql.matches);
    return typeof values[index] !== 'undefined' ? values[index] : defaultValue;
  };

  const [value, setValue] = React.useState(getValue);

  React.useEffect(() => {
    const handler = () => setValue(getValue);
    mediaQueryLists.forEach(mql => mql.addListener(handler));
    return () => mediaQueryLists.forEach(mql => mql.removeListener(handler));
  }, []);

  return value;
};