export const formatNumber = (number: number, decimalPlaces = 0): string => {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: decimalPlaces,
  }).format(number);
};
