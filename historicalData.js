var fs = require('fs');
var moment = require('moment');

var fngData = JSON.parse(fs.readFileSync('resource/fng.json', 'utf8'));
var btcData = JSON.parse(fs.readFileSync('resource/btc.json', 'utf8'));

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
        fngList.push(item);
    } else if (date.includes('2019')) {
        // fngList.push(item);
    } else if (date.includes('2018')) {
        // fngList.push(item);
    }
});

function formatNum(v) {
    var f = Number.parseFloat(v).toFixed(2);
    return f;
}

////////////////////////////////////////////
////////////////////////////////////////////

var fixedBtc = 0;
var fixedInvestment = 0;
var fixedDailyQty = 10;
function fixed() {
    fngList.forEach(function (item) {
        var price = btcList[item.date];
        fixedBtc = fixedBtc + fixedDailyQty / price;
        fixedInvestment = fixedInvestment + 10;
    });
}

function buyplan(limit, qty) {
    var btc = 0;
    var invest = 0;
    var max = 0;
    fngList.forEach(function (item) {
        var price = btcList[item.date];
        if (item.value <= limit) {
            btc = btc + qty / price;
            invest = invest + qty;
        }
        max = Math.max(max, invest);
    });
    var obj = {
        btc: btc,
        invest: invest,
        max: max
    };
    return obj;
}

function sellplan(limit, qty) {
    var btc = 0;
    var invest = 0;
    fngList.forEach(function (item) {
        var price = btcList[item.date];
        if (item.value >= limit) {
            btc = btc + qty / price;
            invest = invest + qty;
        }
    });
    var obj = {
        btc: btc,
        invest: invest,
    };
    return obj;
}

function mixplan() {
    var btc = 0;
    var invest = 0;
    var max = 0;
    fngList.forEach(function (item) {
        var price = btcList[item.date];
        if (item.value < 20) {
            btc = btc + 60 / price;
            invest = invest + 60;
        }else if(item.value >= 80){
            btc = btc - 20 / price;
            invest = invest - 20;
        }
        max = Math.max(max, invest);
    });
    var obj = {
        btc: btc,
        invest: invest,
        max: max
    };
    return obj;
}


fixed();

var f = formatNum(fixedBtc / fixedInvestment * 40000);
console.log("Total btc: %s\tinvest: %s,\tratio: %s", fixedBtc, fixedInvestment, f);

// var bObj = buyplan(20, 100);
// var sObj = sellplan(90, 50);
// var btc = bObj.btc - sObj.btc;
// var invest = bObj.invest - sObj.invest;
// var maximum = bObj.max;

var obj = mixplan();
var btc = obj.btc;
var invest = obj.invest;
var maximum = obj.max;

var f = formatNum(btc / invest * 40000);
console.log("Plan btc: %s\tinvest: %s,\tratio: %s,\tmax: %s", btc, invest, f, maximum);

// var i = planData.sellQty;
// planBtc = planBtc - i / price;
// planInvestment = planInvestment - i;

//console.log(fngData);
// console.log(btcData);
//  console.log(fngList);
//console.log(btcList);



