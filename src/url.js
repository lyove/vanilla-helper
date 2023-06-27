/**
 * Get url paramter by key
 * @param {string} key
 * @returns string | number
 */
export const getUrlParam = (key) => {
  if (typeof key !== "string") {
    return null;
  }
  const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`);
  // test.com/#/abc?id=123 and test.com?id=123/#/abc
  const res =
    window.location.search.substr(1).match(reg) ||
    window.location.hash.substring(window.location.hash.search(/\?/) + 1).match(reg);
  if (res != null) {
    return decodeURIComponent(res[2]);
  }
};

/**
 * Get url all paramters
 * @param {string} url url
 * @returns object
 */
export const getUrlParams = (url) => {
  const uri = decodeURIComponent(url || window.location.href);
  const reg = /[?&]([^?&#]+)=([^?&#]+)/g;
  const params = {};
  let ret = reg.exec(uri);
  while (ret) {
    params[ret[1]] = ret[2];
    ret = reg.exec(uri);
  }
  return params;
};
