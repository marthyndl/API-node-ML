const express = require('express');
const app = express();
const pretty = require('express-prettify');
const routeItems = require('./routes/items');

app.use(function(req, res, next){
    res.append('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.append('Access-Control-Allow-Credentials', 'true');
    res.append('Access-Control-Allow-Methods', ['GET', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE']);
    res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.use(pretty({ query: 'pretty' }));
app.set('json spaces', 4);

app.get('/', (req, res, next) => {
    res.send('API its running.');
});
app.use('/api/items', routeItems);

const port = 5000;
app.listen(port, () => `Server running on port ${port} !!!`);