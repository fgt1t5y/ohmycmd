export const toStrictInteger = (value: string) => {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) {
    return Number(value);
  } else {
    return NaN;
  }
};
