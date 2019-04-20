const axios = require('axios');

module.exports = axios.create({
    baseURL: 'https://api.mercadolibre.com'
});