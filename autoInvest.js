
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
                binanceMarketOrder('BUY', qty);
                discordWebhook('Index = ' + index + ', buy ' + qty +' usd');
            } else if (index < 30) {
                binanceMarketOrder('BUY', 10);
                discordWebhook('Index = ' + index + ', buy ' + 10 +' usd');
            } else if (index > 90) {
                binanceMarketOrder('SELL', 10);
                discordWebhook('Index = ' + index + ', sell ' + 10 +' usd');
            } else {
                // Neutral
                discordWebhook('Index = ' + index + ', do nothing');
            }
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

function binanceMarketOrder(op = 'BUY', qty = 10) {
    // https://github.com/binance/binance-connector-node
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    const client = new Spot(apiKey, apiSecret);

    var symbol = 'ETHBUSD';
    var type = 'MARKET'; // LIMIT
    client.newOrder(symbol, op, type, {
        quoteOrderQty: qty,
    }).then(response => client.logger.log(response.data))
        .catch(error => client.logger.error(error))
}