
var schedule = require('node-schedule');
var axios = require('axios');
const https = require('https');
const { Spot } = require('@binance/connector');
require('dotenv').config()

run();

function run() {
    schedule.scheduleJob('0 0 * * * *', function () {
        console.log('Still running at: ' + new Date());
    });

    schedule.scheduleJob('0 30 08 * * *', function () {
        console.log('Run at: ' + new Date());
        fearAndGreedIndex(function (index) {
            if (index < 20 && index >= 1) {
                // Extreme Fear
                binanceMarketOrder('BUY', 60);
            } else if (index >= 80) {
                binanceMarketOrder('SELL', 20);
            } else {
                // Neutral
                console.log('Do nothing');
            }
        });
    });
}

function fearAndGreedIndex(callback) {
    const url = 'https://api.alternative.me/fng/';

    // At request level
    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    axios.get(url, { httpsAgent: agent })
        .then(res => {
            var data = res.data.data;
            console.log(data);
            var item = data[0];
            callback(item.value)
        })
        .catch(error => {
            console.error(error);
        });
}

function binanceMarketOrder(op = 'BUY', qty = 10) {
    // https://github.com/binance/binance-connector-node
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    const client = new Spot(apiKey, apiSecret);

    var symbol = 'ETHUSDT';
    var type = 'MARKET'; // LIMIT
    client.newOrder(symbol, op, type, {
        quoteOrderQty: qty,
    }).then(response => client.logger.log(response.data))
        .catch(error => client.logger.error(error))
}