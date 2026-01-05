// FORMAT THE COUNTS
const formatCount = (count) => {
  // check if count is greater than 100
  const convertedString = parseInt(count);

  // FORMAT MILLIONS
  if (convertedString >= 1_000_000) {
    return `${(convertedString / 1_000_000).toFixed(
      convertedString % 1_000_000 === 0 ? 0 : 1
    )}M`;
  }

//   FORMAT THOUSANDS
  if (convertedString >= 1000) {
    return `${(convertedString / 1000).toFixed(
      convertedString % 1000 === 0 ? 0 : 1
    )}k`;
  }

  return convertedString.toString();
};

export default formatCount;
