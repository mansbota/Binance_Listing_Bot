const puppeteer     = require('puppeteer-core');
const uniswap       = require('./uniswap');
const metamask      = require('./metamask');
const binance       = require('./binance');
const patreon       = require('./patreon');
const config        = require('./config');
const LocalDateTime = require('@js-joda/core').LocalDateTime;

(async () => {

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: config.BROWSER_EXE,
        userDataDir: config.USER_DATA,
        args: [
            `--disable-extensions-except=${config.METAMASK_PATH}`,
            `--load-extension=${config.METAMASK_PATH}`,
            `--window-size=1280,720`
        ]
    });

    const metamaskPage = await metamask.getMetamask(browser);

    await metamask.loginMetamask(metamaskPage);

    console.log("Ethereum available: %f", await metamask.getEthereumAmount(metamaskPage));

    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 900});
    await page.setRequestInterception(true);

    page.on('request', (request) => {

        if (['image', 'font'].includes(request.resourceType())) {
            request.abort();
        }
        else {
            request.continue();
        }
    })

    while (true) {

        try {

            const [binanceResult, binanceSymbol] = await binance.evaluateNews(page, 2);

            if (binanceResult) {

                const ethAmount = await metamask.getEthereumAmount(metamaskPage);

                console.log("Attemptimg to buy %s at %s", binanceSymbol, LocalDateTime.now().toString());

                // postotak etha i vrijeme nakon prodaje mozda promjeniti
                await uniswap.buyAndSellCrypto(browser, page, binanceSymbol, ethAmount * 0.16, 3);
            }

            // const [patreonResult, patreonSymbol] = await patreon.evaluatePost(page);
            //
            // if (patreonResult) {
            //
            //    const ethAmount = await metamask.getEthereumAmount(metamaskPage);
            //
            //    console.log("Attemptimg to buy %s at %s", patreonSymbol, LocalDateTime.now().toString());
            //
            //    await uniswap.buyAndSellCrypto(browser, page, patreonSymbol, ethAmount * 0.9, 13);
            //
            //    await browser.close();
            //    return;
            // }
        }
        catch(ex) {

            console.log(ex);
            await browser.close();
            return;
        }
    }

})();
