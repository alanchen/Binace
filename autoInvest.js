
var schedule = require('node-schedule');
var axios = require('axios');
var moment = require('moment');
const https = require('https');
const { Spot } = require('@binance/connector');
require('dotenv').config()
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const hook = new Webhook(process.env.DISCORD_WEBHOOK);

run();

function run() {
    schedule.scheduleJob('0 30 08 * * *', function () {
        fearAndGreedIndex(function (index) {
            var notify = function (op, qty, price) {
                binanceBalance('USDT' ,function (b) {
                    discordETHWebhook(index, op, qty, price, b);
                });
            };
            if (index <= 20 && index >= 1) {
                // Extreme Fear
                binanceMarketOrder('BUY', 30, notify);
            } else if (index <= 30) {
                binanceMarketOrder('BUY', 20, notify);
            } else if (index < 40) {
                binanceMarketOrder('BUY', 10, notify);
            } else if (index > 90) {
                binanceMarketOrder('SELL', 10, notify);
            } else {
                // Neutral
            }
        });
    });

    var rule = new schedule.RecurrenceRule();
    rule.hour = new schedule.Range(0, 23, 12);
    rule.minute = 25;
    schedule.scheduleJob(rule, function () {
        let nft = 'murmurcats';
        openseaFloorPrice(nft, function (price) {
            discordNFTWebhook(nft, price);
        });
    });

    schedule.scheduleJob(rule, function () {
        let nft = 'fomo-dog-club';
        openseaFloorPrice(nft, function (price) {
            discordNFTWebhook(nft, price);
        });
    });
}

function discordNFTWebhook(name, floor = 0.0) {
    // var date = moment(Date.now()).format('YYYY-MM-DD');
    // let text = `[ ${date} ]\n${msg}`;
    // hook.send(msg);
    let url = 'https://opensea.io/collection/' + name;

    const embed = new MessageBuilder()
        .setTitle(name)
        .setURL(url)
        .addField('Floor Price', floor.toString(), true)
        .setColor('#FF0000')
        .setTimestamp();
    hook.send(embed);
}

function discordETHWebhook(index, op = 'Buy', qty = 10, filled, balance) {
    const embed = new MessageBuilder()
        .setTitle('Fear & Greed:')
        .setURL('https://alternative.me/crypto/fear-and-greed-index/')
        .addField('Index:', index.toString())
        .addField(op, "$" + qty)
        .addField('Filled Price:', '$' + filled)
        .addField('Balance:', '$' + balance)
        .setColor('#00b0f4')
        .setTimestamp();
    hook.send(embed);
}

function openseaFloorPrice(name, callback) {
    const url = 'https://api.opensea.io/api/v1/collection/' + name;

    // At request level
    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    axios.get(url, { httpsAgent: agent })
        .then(res => {
            let stats = res.data.collection.stats;
            let floor = stats.floor_price;
            console.log(floor);
            callback(floor);
        })
        .catch(error => {
            console.error(error);
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

function binanceBalance(asset = 'USDT', callback) {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    const client = new Spot(apiKey, apiSecret);
    client.account().then(response => {
        var data = response.data;
        var balances = data.balances;
        const found = balances.find(element => element['asset'] == asset);
        var balance = found.free;
        if (callback) { callback(balance); }
    })
}

function binanceMarketOrder(op = 'BUY', qty = 10, callback = null) {
    // https://github.com/binance/binance-connector-node
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    const client = new Spot(apiKey, apiSecret);

    var symbol = 'BTCUSDT';
    var type = 'MARKET'; // LIMIT
    client.newOrder(symbol, op, type, {
        quoteOrderQty: qty,
    }).then(response => {
        client.logger.log(response.data);
        var fills = response.data.fills;
        var fill = fills[0];
        var filledPrice = fill.price;
        if (callback) { callback(op, qty, filledPrice); }
    }).catch(error => client.logger.error(error))
}
