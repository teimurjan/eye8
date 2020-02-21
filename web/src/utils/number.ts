export const isStringNumber = (s: string) => parseInt(s, 10).toString() === s;
export const isAllowedForNumberInput = (s: string) => s.length === 0 || isStringNumber(s);

export const calculateDiscountedPrice = (price: number, discount: number) => {
  return Math.round(price - (price * discount) / 100);
};