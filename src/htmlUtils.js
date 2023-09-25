// HTML Decode
const htmlDecode = (text, encode = false) => {
  // default execute decode
  let matchList = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&#34;': '"',
    '&quot;': '"',
    '&#39;': "'",
    // and more
  };
  // If encode===true, execute encode
  if (encode) {
    // Swap the key and value of matchList
    const newMatch = {};
    Object.keys(matchList).forEach((k) => {
      newMatch[matchList[k]] = k;
    });
    matchList = newMatch;
  }
  let regStr = '(' + Object.keys(matchList).toString() + ')';
  regStr = regStr.replace(/,/g, ')|(');
  const regExp = new RegExp(regStr, 'g');
  return text.replace(regExp, match => {
    return matchList[match];
  });
};

// HTML Encode
const htmlEncode = (text) => {
  return htmlDecode(text, true);
};

export { htmlDecode, htmlEncode }
