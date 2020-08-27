/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const newArray = [...arr];

  const compare = (first, second) => first.localeCompare(second, 'ru', {caseFirst: 'upper'});

  return newArray.sort((a, b) => {
    if (param === 'asc') {
      return compare(a, b);
    }
    if (param === 'desc') {
      return compare(b, a);
    }
  });
}
