const { sign } = require('crypto');
const fs = require('fs');
const {Builder, By, Key, until} = require('selenium-webdriver');

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

const userDataDir = config.userDataDir;


let chrome = require("selenium-webdriver/chrome");
let options = new chrome.Options();
options.addArguments("--user-data-dir="+userDataDir)
let driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();


 

const checkResult = async function(nr)
{
    //console.log('Trying to check : '+nr);
    try {
        var searchInput = await driver.wait(until.elementLocated(By.css("[placeholder='Search']")), 20000, 'File Input notfound', 1000);
    } catch (error) {
        console.error('ERROR: Searchinput not found');
        return false;
    }
    await searchInput.sendKeys(Key.chord(Key.COMMAND, "a"),"#"+nr, Key.ENTER);
    // get count
    do {
        try {
            var searchResult = await driver.wait(until.elementLocated(By.css(".AssetSearchView--results-count > p")), 20000, 'File Input notfound', 1000);
        } catch (error) {
            console.error('ERROR: Searchresult not found');
            return false;
        }
        //console.log(searchResult);
        var txt = await searchResult.getText();
        //console.log("|"+txt+"|");
    } while (txt.startsWith("Loading"))
    res = '#'+nr+": "+txt;
    if (nr > 1 && nr < 10) res += ' '+txt.startsWith("1.111");
    if (nr == 10) res += ' '+txt.startsWith("112");
    if (nr > 10 && nr < 100) res += ' '+txt.startsWith("111");
    if (nr == 100) res += ' '+txt.startsWith("12");
    if (nr > 100 && nr < 1000) res += ' '+txt.startsWith("11");
    if (nr == 1000) res += ' '+txt.startsWith("2");
    if (nr > 1000) res += ' '+txt.startsWith("1");
    console.log('Result', res);
    fs.appendFileSync('./checks.txt',res+'\n');
};



(async() => {
    console.log('Start', checkResult);
    await driver.get('https://opensea.io/collection/pipi-pixel-pizza');
    console.log('After loading create page');
    for (let i = 1; i < 1000; i++) {
        await checkResult(i);
    }
  })();




