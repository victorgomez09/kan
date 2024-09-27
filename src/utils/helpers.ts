export const formatToArray = (
  value: string | string[] | undefined,
): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined);
  }
  return value ? [value] : [];
};
