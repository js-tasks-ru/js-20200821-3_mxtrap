/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return '';
  }

  if (!size) {
    return string;
  }

  let count = 0;
  let newStr = '';
  for (let i = 0; i < string.length; i++) {
    if (count < size) {
      newStr += string[i];
    }
    if (string[i] === string[i + 1]) {
      count++;
    }
    else {
      count = 0;
    }
  }
  return newStr;
}
