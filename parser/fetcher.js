const axios = require('axios');

// fetch the html of a page
const get_html_data = (url) => {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(({ data }) => resolve(data))
      .catch(err => reject(err));
  })
};

module.exports = { get_html_data };
