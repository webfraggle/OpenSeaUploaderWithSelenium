// Just login, because every 24h Metamask has to be resigned
// Resign manually
const fs = require('fs');
const {Builder, By, Key, until} = require('selenium-webdriver');

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

const imagePath = config.imagePath;
const namePrefix = config.namePrefix;
const nameSuffix = config.nameSuffix;
const sellPrice = config.sellPrice;
const uploadCount = config.uploadCount;
const metaMaskPWD = config.metaMaskPWD;
const userDataDir = config.userDataDir;

let chrome = require("selenium-webdriver/chrome");
let options = new chrome.Options();
options.addArguments("--user-data-dir="+userDataDir)
let driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();


const loginToOpensea = async function()
{
    // Start Metamask Login
    await driver.get('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/popup.html');
    title = await driver.getTitle();
    console.log(title);
    let pwd = await driver.wait(until.elementLocated(By.id('password'),10000));
    await pwd.sendKeys(metaMaskPWD, Key.ENTER);
    let account = await driver.wait(until.elementLocated(By.className('selected-account__name'),20000)).getText();
    console.log(account);
    // End Metamask
    // Start opensea connection to metamaskt
    // done by going to account
    await driver.get('https://opensea.io/asset/create');

    // var sell = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Create')]"),10000));
    // temp = await sell.getText();
    // console.log(temp);

    await driver.wait(until.elementLocated(By.css("a[href='/account']"),10000)).click();
    // end connecting metamask
    return true;
}


loginToOpensea();



