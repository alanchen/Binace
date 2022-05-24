
var schedule = require('node-schedule');
var axios = require('axios');
var moment = require('moment');
const https = require('https');
const { Spot } = require('@binance/connector');
require('dotenv').config()
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.DISCORD_WEBHOOK);

run();

function run() {
    schedule.scheduleJob('0 30 08 * * *', function () {
        fearAndGreedIndex(function (index) {
            var qty = 50;
            if (index <= 20 && index >= 1) {
                // Extreme Fear
                discordWebhook('Index = ' + index + ', buy ' + qty + ' usd');
                binanceMarketOrder('BUY', qty, function (price){discordWebhook('Filled price: ' + price);});
            } else if (index < 30) {
                discordWebhook('Index = ' + index + ', buy ' + 10 + ' usd');
                binanceMarketOrder('BUY', 10, function (price){discordWebhook('Filled price: ' + price);});
            } else if (index > 90) {
                discordWebhook('Index = ' + index + ', sell ' + 10 + ' usd');
                binanceMarketOrder('SELL', 10, function (price){discordWebhook('Filled price: ' + price);});
            } else {
                // Neutral
                discordWebhook('Index = ' + index + ', do nothing', function (price){discordWebhook('Filled price: ' + price);});
            }
            balance();
        });
    });
}

function discordWebhook(msg) {
    var date = moment(Date.now()).format('YYYY-MM-DD');
    let text = `[ ${date} ]\n${msg}`;
    hook.send(text);
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

function balance(asset = 'BUSD') {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    const client = new Spot(apiKey, apiSecret);
    client.account().then(response => {
        var data = response.data;
        var balances = data.balances;
        const found = balances.find(element => element['asset'] == asset);
        var balance = found.free;
        discordWebhook('BUSD balance = ' + balance);
    })
}

function binanceMarketOrder(op = 'BUY', qty = 10, callback = null) {
    // https://github.com/binance/binance-connector-node
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    const client = new Spot(apiKey, apiSecret);

    var symbol = 'ETHBUSD';
    var type = 'MARKET'; // LIMIT
    client.newOrder(symbol, op, type, {
        quoteOrderQty: qty,
    }).then(response => {
        client.logger.log(response.data);
        var fills = response.data.fills;
        var fill = fills[0];
        var filledPrice = fill.price;
        client.logger.log(filledPrice);
        if(callback){ callback(filledPrice); }
    }).catch(error => client.logger.error(error))
}