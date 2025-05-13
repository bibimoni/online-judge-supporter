const wrapperRes = (responseStatus, testcase) => {
  if (testcase == undefined) {
    return {
      "status": responseStatus
    };
  }
  return {
    "status": responseStatus,
    "testcase": testcase
  };
};
export { wrapperRes };
export default {
  wrapperRes
};
