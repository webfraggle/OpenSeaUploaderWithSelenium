//test.js
const fs = require('fs');
let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);
console.log(config);


const imagePath = config.imagePath;
const namePrefix = config.namePrefix;
const nameSuffix = config.nameSuffix;
const sellPrice = config.sellPrice;
const uploadCount = config.uploadCount;
const metaMaskPWD = config.metaMaskPWD;

console.log(imagePath,namePrefix,nameSuffix, sellPrice, uploadCount, metaMaskPWD)