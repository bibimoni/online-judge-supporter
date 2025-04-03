const getTestIndexFromTestName = (name, regexes, indexPosition) => {
  for (const regex of regexes) {
    const match = name.match(regex);
    if (match && match.length > indexPosition && match[indexPosition]) {
      return match[indexPosition];
    }
  }
  return undefined;
}

module.exports = { getTestIndexFromTestName };
