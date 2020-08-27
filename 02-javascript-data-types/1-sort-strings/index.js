/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const newArray = Array.from(arr);

  if (param === 'asc') {
    return newArray.sort((a, b) => a.localeCompare(b, 'ru', {caseFirst: 'upper'}));
  }

  if (param === 'desc') {
    return newArray.sort((a, b) => b.localeCompare(a, 'ru', {caseFirst: 'upper'}));
  }

  return newArray;
}
