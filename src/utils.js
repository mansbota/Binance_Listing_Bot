const utils = {

    getStringFromSelector: async (page, selector) => {

        const element = await page.$(selector);
    
        const text = await element.evaluate(el => el.textContent);
    
        return text.toString();
    },

    _getProperty: async (element, property) => {
        
        return await (await element.getProperty(property)).jsonValue();
    },
    
    getCreatedPage: async (browser) => {
    
        const nav = new Promise(res => browser.on('targetcreated', res))
        await nav
    
        const pages = await browser.pages();
    
        return pages[pages.length - 1];
    }
}

module.exports = utils;