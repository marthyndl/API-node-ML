const express = require('express');
const router = express.Router();
const axios = require('axios');
const ML = require('../../api/ML');
const _ = require('lodash');

router.get('/', async (req, res) => {
    if(req.query.q){
        let query = req.query.q;
        try {
            const {data, data: {results}} = await ML.get(`/sites/MLA/search?q=${query}&offset=1&limit=4`);
            let items =  _.map(data.results, item => ({
                ..._.pick(item, ['id', 'title', 'condition']),
                picture: _.get(item, 'thumbnail'),
                free_shipping: _.get(item, 'shipping.free_shipping'),
                price: {
                    currency: _.get(item, 'currency_id'),
                    amount: _.get(item, 'price'),
                    decimals: _.toString(_.split(_.get(item, 'price'), '.')[1])
                }
            }));

            let category = _.chain(_.map(results, 'category_id')).countBy().toPairs().max(_.last).head().value();
            let result = await ML.get(`/categories/${category}`);
            let categories = _.map(result.data.path_from_root, (item) => {
                return item.name
            });

            let output = {
                author: { name: 'Martin Daniel', lastname: 'Lopez'},
                items,
                categories
            };

            res.json(output);
        }catch({response:{data}}){
            if(data.status === 404){
                return res.status(404).json({
                    "status": 404,
                    "message": data.message
                });
            }
        }
    } else {
        return res.status(400).json({
            "status": 400,
            "message": "Bad request"
        });
    }
});

router.get('/:id', (req, res) => {
    let id = req.params.id;

    axios.all([
        ML.get(`/items/${id}`),
        ML.get(`/items/${id}/description`)
    ])
    .then(axios.spread(async (first, second) => {
        let response = {...first.data, ...second.data};

        let data = {
            ..._.pick(response, ['id', 'title', 'condition', 'sold_quantity']),
            picture: _.get(response, 'thumbnail'),
            free_shipping: _.get(response, 'shipping.free_shipping'),
            description: _.get(response, 'plain_text'),
            price: {
                currency: _.get(response, 'currency_id'),
                amount: _.get(response, 'price'),
                decimals: _.toString(_.split(_.get(response, 'price'), '.')[1])
            }
        };

        const {data:{path_from_root}} = await ML.get(`/categories/${response.category_id}`);
        let categories = _.map(path_from_root, item => {
            return item.name
        });

        let output = {
            author: { name: 'Martin Daniel', lastname: 'Lopez'},
            item: data,
            categories
        };

        res.json(output);
    }))
    .catch(({response:{data}}) => {
        if(data.status === 404){
            return res.status(404).json({
                "status": 404,
                "message": data.message
            });
        }
    });
});

module.exports = router;