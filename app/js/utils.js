export const sortByAlpha = field => (a, b) => {
  const a_field = a[field].toLowerCase();
  const b_field = b[field].toLowerCase();
  if (a_field < b_field) return -1;
  if (a_field > b_field) return 1;
  return 0;
};

export const sortByAttribute = field => (a, b) => {
  if (a[field] > b[field]) return -1;
  if (a[field] < b[field]) return 1;
  return 0;
};

export const sortByAttributeDesc = field => (a, b) => {
  if (a[field] < b[field]) return -1;
  if (a[field] > b[field]) return 1;
  return 0;
};

export const sortNullableArray = field => (a, b) => {
  const a_field = a[field] || [];
  const b_field = b[field] || [];

  if (a_field.length > b_field.length) return -1;
  if (a_field.length < b_field.length) return 1;
  return 0;
};
