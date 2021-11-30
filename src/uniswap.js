const utils = require('./utils');
const UNISWAP_URL = 'https://app.uniswap.org/#/swap';
const LocalDateTime = require('@js-joda/core').LocalDateTime;

const uniswap = {

    buyCrypto: async (browser, page, cryptoSymbol, ethAmount) =>  {

        await page.goto(UNISWAP_URL);
        await page.waitForSelector('div[id="swap-currency-input"] > div > div:nth-child(2) > input');
        await page.type('div[id="swap-currency-input"] > div > div:nth-child(2) > input', ethAmount.toString());
    
        await uniswap.enterCryptoSymbol(page, cryptoSymbol);
        
        if (await uniswap.checkQueryResults(page, cryptoSymbol)) {
            
            if (await uniswap.swap(browser, page)) {
    
                console.log("Success: bought %s ethereum worth of %s at %s", ethAmount.toString(), cryptoSymbol,
                    LocalDateTime.now().toString());
                return true;
            }
        }
    
        console.log("Error buying crypto");

        return false;
    },
    
    sellCrypto: async (browser, page, cryptoSymbol) => {
    
        await page.goto(UNISWAP_URL);
        await page.waitForSelector('div[id="swap-page"] > div > div:nth-child(2) > div > div');
        await page.click('div[id="swap-page"] > div > div:nth-child(2) > div > div');
    
        await uniswap.enterCryptoSymbol(page, cryptoSymbol);
        
        if (await uniswap.checkQueryResults(page, cryptoSymbol)) {
    
            await page.waitForSelector('div[id="swap-currency-input"] > div > div:nth-child(2) > button');
            await page.click('div[id="swap-currency-input"] > div > div:nth-child(2) > button');
    
            if (await uniswap.swap(browser, page)) {
    
                console.log("Success: sold %s at %s", cryptoSymbol, LocalDateTime.now().toString());
                return true;
            }
        }
        
        console.log("Error selling crypto");

        return false;
    },
    
    buyAndSellCrypto: async (browser, page, cryptoSymbol, ethAmount, sellAfterMinutes) => {
    
        if (await uniswap.buyCrypto(browser, page, cryptoSymbol, ethAmount)) {

            console.log("Waiting %d minutes to sell...", sellAfterMinutes);

            await page.waitForXPath("//button[contains(., 'Close')]")
            const [button] = await page.$x("//button[contains(., 'Close')]");
            await button.click();

            await page.waitForTimeout(60000);

            // Swap places
            await page.waitForSelector('div[id="swap-page"] > div > div:nth-child(2) > div > div');
            await page.click('div[id="swap-page"] > div > div:nth-child(2) > div > div');

            // Press max
            await page.waitForSelector('div[id="swap-currency-input"] > div > div:nth-child(2) > button');
            await page.click('div[id="swap-currency-input"] > div > div:nth-child(2) > button');

            await page.waitForTimeout(2000);

            const [approveBtn] = await page.$x(`//button[contains(., 'Approve ${cryptoSymbol}')]`);

            if (approveBtn) {

                await approveBtn.click();
                await uniswap.metamaskConfirm(browser);
                await page.waitForTimeout(60000);
            }

            await page.waitForTimeout(sellAfterMinutes * 60000 - (approveBtn ? 122000 : 62000));

            await uniswap.swap(browser, page);
            console.log("Success: sold %s at %s", cryptoSymbol, LocalDateTime.now().toString());

            return true;
        }
    
        return false;
    },
    
    enterCryptoSymbol: async (page, cryptoSymbol) => {
    
        //click on select crypto button
        await page.waitForSelector('#swap-currency-output .open-currency-select-button');
        await page.click('#swap-currency-output .open-currency-select-button');

        //type crypto name
        await page.waitForSelector('input[id="token-search-input"]');
        await page.type('input[id="token-search-input"]', cryptoSymbol);
    },
    
    checkQueryResults: async (page, cryptoSymbol) => {
    
        const firstResultSelector = 'div[role="dialog"] > div > div:nth-child(3) > div > div > div > div';
        const firstResultSymbolSelector = firstResultSelector + " > div > div";
    
        try {
    
            //wait a second for results to load then look at first result
            await page.waitForTimeout(1500);
            await page.waitForSelector(firstResultSymbolSelector, { timeout: 5000 });
        }
        catch(error) {
    
            console.log("Error: no results for symbol");
            return false;
        }
    
        const firstResultSymbol = await utils.getStringFromSelector(page, firstResultSymbolSelector);
    
        if (firstResultSymbol.toLowerCase() !== cryptoSymbol.toLowerCase()) {
    
            console.log("Error: no exact result for symbol");
            return false;
        }
    
        await page.click(firstResultSelector);

        return true;
    },
    
    swap: async (browser, page) => {
        
        await page.evaluate('window.scrollBy(100, document.body.scrollHeight)');

        //click swap button
        await page.waitForSelector('button[id="swap-button"]');
        await page.click('button[id="swap-button"]');

        //click confirm swap button
        await page.waitForSelector('button[id="confirm-swap-or-send"');
        await page.click('button[id="confirm-swap-or-send"');
    
        await uniswap.metamaskConfirm(browser);
    },

    metamaskConfirm: async (browser) => {

        //get metamask notification popup
        const notification = await utils.getCreatedPage(browser);

        //click edit to set fast transaction
        await notification.waitForSelector('div[class="confirm-detail-row__header-text confirm-detail-row__header-text--edit"]');
        await notification.click('div[class="confirm-detail-row__header-text confirm-detail-row__header-text--edit"]');

        //click on fast transaction
        await notification.waitForSelector('div[class="gas-price-button-group--alt"] > button:nth-child(3)');
        await notification.click('div[class="gas-price-button-group--alt"] > button:nth-child(3)');

        //click save
        await notification.waitForSelector('button[class="button btn-secondary page-container__footer-button"]');
        await notification.click('button[class="button btn-secondary page-container__footer-button"]');

        await notification.waitForTimeout(1500);

        // click accept
        await notification.waitForSelector('button[class="button btn-primary page-container__footer-button"]');
        await notification.click('button[class="button btn-primary page-container__footer-button"]');
    }
}

module.exports = uniswap;
