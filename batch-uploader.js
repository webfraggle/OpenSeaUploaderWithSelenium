const { sign } = require('crypto');
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

const upload = async function(image, nr, eth)
{
    console.log('Trying to Upload: '+image);

    await driver.get('https://opensea.io/asset/create');
    var file = await driver.wait(until.elementLocated(By.id('media'),10000));
    
    // File
    await file.sendKeys(imagePath+image)
    
    // Title
    await driver.findElement(By.id("name")).sendKeys(namePrefix+nr+nameSuffix);
    do {
        await driver.findElement(By.id("collection")).sendKeys(Key.chord(Key.COMMAND, "a"), "PiPi Pixel Pizza");
        //var collectionDrop = await driver.wait(until.elementLocated(By.css("[id^='tippy-'] li"),10000));
        try {
            var collectionDrop = await driver.wait(until.elementLocated(By.css("[id^='tippy-'] li")), 20000, 'notfound', 1000);
        } catch (error) {
            console.error('Collection Drop Error!');
        }
        
    } while (collectionDrop == undefined)
    await collectionDrop.click();


    //await collectionDrop.findElement(By.css("li")).click();
    var chainInput = await driver.findElement(By.id("chain"));
    await chainInput.findElement(By.xpath("./..")).click();
    var chainDrop = await driver.wait(until.elementLocated(By.css("[id^='tippy-'] li"),10000));
    await chainDrop.click();
    //await chainDrop.wait(until.elementLocated(By.css("li"),10000)).click();
    //await chainDrop.findElement(By.css("li")).click();

    await driver.findElement(By.className("AssetForm--submit")).findElement(By.css("Button")).click();
    //var closeBtn = await driver.wait(until.elementLocated(By.css("i[aria-label='Close']"),10000));

    // trying to get the cause of the crash
    try {
        var closeBtn = await driver.wait(until.elementLocated(By.css("i[aria-label='Close']")), 30000, 'ERROR: Close NotFound', 1000);
    } catch (error) {
        console.error(error);
        let title = await driver.getTitle();
        console.log('closeBtn not found, Title: '+title);
        try {
            var Assetform = await driver.wait(until.elementLocated(By.className("AssetForm--submit")), 30000, 'ERROR: Assetform notfound', 1000);
            
        } catch (error) {
            console.log('Assetform not found', error);
        }
        console.log('Assetform: ',Assetform);
        if (Assetform != undefined) console.log('Assetform.getText: ',Assetform.getText());

        // check the error for Success or not
        // Upload Successfull, Sell not possible
        if (title.includes("Something Went Wrong"))
        {
            console.error('Something Went Wrong Page! Maybe Success! Renaming, but not selling');
            return true;
        }
        if (title.includes("Create NFTs"))
        {
            console.error('Still on Create Page! No Success! Not Renaming, try again');
            return false;
        }
        process.exit();
        return false;
    }

    
    // stop here for just uploading
    return true;
    await closeBtn.click();

    //driver.sleep(2*1000);
    var sellText = "";
    while (sellText != "Sell")
    {
        try {
            var sell = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Sell')]"),10000));
            sellText = await sell.getText();
            console.log(sellText);
        } catch {
            //console.log('sell not located')
        }
    }
    await sell.click();
    
    // Price
    // hier hängt oft die ganze Seite
    do {
        try {
            //var price = await driver.wait(until.elementLocated(By.name("price"),10000));
            var price = await driver.wait(until.elementLocated(By.name("price")), 30000, 'notfound', 1000);
        } catch (error) {
            console.log("ERROR! Price Page not loading");
            await driver.navigate().refresh();
        }

    } while (price == undefined)
    
    await price.sendKeys(eth);

    var sellText = "";
    while (sellText != "Complete listing")
    {
        try {
            var completeListing = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Complete listing')]"),10000));
            sellText = await completeListing.getText();
            console.log(sellText);
        } catch {
            console.log('completeListing not located')
        }
    }
    await completeListing.click();
    //mainWindow = await driver.getWindowHandle();
    //console.log(mainWindow);
    //await driver.sleep(2*1000);
    
    // hier hängt es mal
    // var sign = await driver.wait(until.elementLocated(By.xpath("//button[text()='Sign']"),10000));
    do {

        try {
            var signButton = await driver.wait(until.elementLocated(By.xpath("//button[text()='Sign']")), 30000, 'notfound', 1000);
            
        } catch (error) {
            
            console.log('ERROR');
            console.log(signButton);
            var signButton = 'notfound';
        }
        if (signButton == 'notfound')
        {
            let completeListing = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Complete listing')]"),10000));
            await completeListing.click();
        }
    } while (signButton == 'notfound')


    await signButton.click();
    //console.log(Date().toString());
    // Todo while bis mehr als 1 window
    //await driver.sleep(3*1000);
    console.log(Date().toString());
    do {
        var windows = await driver.getAllWindowHandles();
        //console.log(windows);
        //console.log(windows.length);
    } while (windows.length < 2)
    await driver.switchTo().window(windows[1]);
    var unterschreiben = await driver.wait(until.elementLocated(By.className("request-signature__footer__sign-button"),10000));
    var temp = await unterschreiben.getText();
    console.log(temp);
    await unterschreiben.click();

    do {
        var windows = await driver.getAllWindowHandles();
        //console.log(windows);
        //console.log(windows.length);
    } while (windows.length > 1)
    await driver.switchTo().window(windows[0]);
    // todo close

    return true;
}


// search next number
function getNextNumber()
{
    var files = fs.readdirSync(imagePath).filter(fn => fn.startsWith('#'));
    re = /#([0-9]+) [a-f0-9]+/gm
    highest = 0;
    files.forEach(function(fn){
        res = [...fn.matchAll(re)];
        nr = parseInt(res[0][1]);
        if (nr > highest) highest = nr
        //console.log(nr);
    });
    return highest + 1;
}

function getNextFile()
{
    var files = fs.readdirSync(imagePath).filter(fn => (!fn.startsWith('#') && !fn.startsWith('.')));
    if (files.length < 1){
        driver.quit();
        process.exit();
    } 
    return files[0];
}


(async() => {
    console.log('before login');
    success = false;
    success = await loginToOpensea();
    console.log('Sucess Login:' + success);
    for (let i = 0; i < uploadCount; i++) {
        nextNr = getNextNumber();
        nextFile = getNextFile();
        console.log('Next Nr: '+nextNr);
        console.log('Next File: '+nextFile);
    
        success = false;
        success = await upload(nextFile,nextNr,sellPrice);
        console.log('Sucess Upload:' + success);
        console.log('after Upload');
        if (success)
        {
            console.log('Renaming File: '+nextFile+ ' to '+imagePath+'#'+nextNr+' '+nextFile);
            fs.renameSync(imagePath+nextFile,imagePath+'#'+nextNr+' '+nextFile, function(err) {
                if ( err ) console.log('Rename ERROR: ' + err);
            });
        }
    }
  })();




