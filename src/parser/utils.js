const wrapper = (responseStatus, testcase) => {
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

module.exports = { wrapper };
