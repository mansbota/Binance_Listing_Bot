const utils = require('./utils');
const config = require('./config');

const metamask = {

    getMetamask: async (browser) => {
        return await utils.getCreatedPage(browser);
    },
    
    loginMetamask: async (page) => {
    
        const inputSelector = 'input[id=password]';
    
        await page.waitForSelector(inputSelector);
    
        await page.type(inputSelector, config.METAMASK_PASSWORD);
    
        await page.click('button[type=submit]');
    },
    
    getEthereumAmount: async (page) => {
    
        const ethSelector = 'span[class="currency-display-component__text"]';
    
        await page.waitForSelector(ethSelector);
    
        return parseFloat(await utils.getStringFromSelector(page, ethSelector));
    }
}

module.exports = metamask;
