export const toStrictInteger = (value: string) => {
  if (/^(\-|\+)?([0-9]+)$/.test(value)) {
    return Number(value);
  } else {
    return NaN;
  }
};
