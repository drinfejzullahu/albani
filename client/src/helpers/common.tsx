export const groupAndSumByType = (details, field = "type") => {
  return details.reduce((acc, item) => {
    if (!item[field]) return acc; // Skip if the type field is missing
    if (!acc[item[field]]) {
      acc[item[field]] = 0;
    }
    acc[item[field]] += Number(item.number);
    return acc;
  }, {});
};
