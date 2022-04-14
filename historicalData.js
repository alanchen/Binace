var fs = require('fs');
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
    var t = Number(item.timestamp)*1000;
    var date = moment(t).format('YYYY-MM-DD');
    item.date = date;
    item.value = Number(item.value);
    fngList.push(item);
});

var buyplan = new Object();
buyplan.extemeFear = 20;
buyplan.fear = 50;
buyplan.extemeFearQty = 30;
buyplan.fearQty = 10;

var totalBtc = 0;
var totalInvestment = 0;
function fixed(){
    fngList.forEach(function (item) {
        var price = btcList[item.date];
        totalBtc = totalBtc + 10/price;
        totalInvestment = totalInvestment + 10;
    });
}

var planBtc = 0;
var planInvestment = 0;
function plan(){
    fngList.forEach(function (item) {
        var price = btcList[item.date];
        if(item.value < 20){
            var i = 20;
            planBtc = planBtc + i/price;
            planInvestment = planInvestment + i;
        }else if(item.value <=40){
            // var i = 10;
            // planBtc = planBtc + i/price;
            // planInvestment = planInvestment + i;
        }else if(item.value >=90){
            var i = 40;
            planBtc = planBtc - i/price;
            planInvestment = planInvestment - i;
        }
    });
}

fixed();
plan();

var f= Number.parseFloat(totalBtc/totalInvestment*40000).toFixed(2);
console.log("Total btc: %s invest: %s, ratio: %s",totalBtc, totalInvestment, f);
var f= Number.parseFloat(planBtc/planInvestment*40000).toFixed(2);
console.log("Plan btc: %s invest: %s, ratio: %s",planBtc, planInvestment, f);



//console.log(fngData);
// console.log(btcData);
//  console.log(fngList);
//console.log(btcList);



