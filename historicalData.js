var fs = require('fs');
const { max } = require('moment');
var moment = require('moment');

var fngData = JSON.parse(fs.readFileSync('resource/fng.json', 'utf8'));
var btcData = JSON.parse(fs.readFileSync('resource/btc.json', 'utf8'));

// Date Close
var btcList = [];
btcData.forEach(function (item) {
    btcList[item.Date] = item.Close;
});

var fngList = [];
fngData.forEach(function (item) {
    var t = Number(item.timestamp) * 1000;
    var date = moment(t).format('YYYY-MM-DD');
    item.date = date;
    item.value = Number(item.value);
    if (date.includes('2022')) {
        fngList.push(item);
    } else if (date.includes('2021')) {
        fngList.push(item);
    } else if (date.includes('2020')) {
        // fngList.push(item);
    } else if (date.includes('2019')) {
        // fngList.push(item);
    }else if (date.includes('2018')) {
        // fngList.push(item);
    }
});

function formatNum(v) {
    var f = Number.parseFloat(v).toFixed(2);
    return f;
}

var planData = new Object();
planData.buyQty = 80;
planData.buyLimit = 20;
planData.sellQty = 10;
planData.sellLimit = 80;

var totalBtc = 0;
var totalInvestment = 0;
function fixed() {
    fngList.forEach(function (item) {
        var price = btcList[item.date];
        totalBtc = totalBtc + 10 / price;
        totalInvestment = totalInvestment + 10;
    });
}

var planBtc = 0;
var planInvestment = 0;
var planMAXnInvestment = 0;

function plan() {
    fngList.forEach(function (item) {
        var price = btcList[item.date];
        if (item.value < planData.buyLimit) {
            var i = planData.buyQty;
            planBtc = planBtc + i / price;
            planInvestment = planInvestment + i;
            console.log("[Buy] btc: %s invest: %s", formatNum(planBtc), planInvestment);
        } else if (item.value > planData.sellLimit) {
            var i = planData.sellQty;
            planBtc = planBtc - i / price;
            planInvestment = planInvestment - i;
            console.log("[Sell] btc: %s invest: %s", formatNum(planBtc), planInvestment);
        }
        planMAXnInvestment = Math.max(planMAXnInvestment, planInvestment);
    });
}

fixed();
plan();
var f = formatNum(totalBtc / totalInvestment * 40000);
console.log("Total btc: %s invest: %s, ratio: %s", totalBtc, totalInvestment, f);
var f = formatNum(planBtc / planInvestment * 40000);
console.log("Plan btc: %s invest: %s, ratio: %s, max: %s", planBtc, planInvestment, f, planMAXnInvestment);



//console.log(fngData);
// console.log(btcData);
//  console.log(fngList);
//console.log(btcList);



