import { match } from "react-router";

export const getNumberParam = <T extends { [key: string]: string }>(
  m: match<T>,
  paramKey: keyof T
): number | undefined => {
  const paramStr = m.params[paramKey];

  return paramStr ? parseInt(paramStr, 10) : undefined;
};