/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArray = path.split('.');

  return object=>{
    let value = {...object};
    for (const item of pathArray) {
      if (value.hasOwnProperty(item)) {
        value = value[item];
      }
      else {
        return;
      }
    }
    return value;
  };
}
