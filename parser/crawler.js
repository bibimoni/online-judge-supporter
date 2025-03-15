const axios = require('axios');

const get_data = (url) => {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(({ data }) => resolve(data))
      .catch(err => reject(err));
  })
}

module.exports = { get_data };