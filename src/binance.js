const utils = require('./utils');
const LocalDateTime = require('@js-joda/core').LocalDateTime;
const NEWS_PAGE_URL = 'https://www.binance.com/en/support/announcement/c-48';

const binance = {

    evaluateNews: async (page, timeOffsetMinutes) => {

        const newsSelector = 'div > div > div > a[data-bn-type]';
    
        await page.goto(NEWS_PAGE_URL);
    
        await page.waitForSelector(newsSelector);
    
        const newsString = await utils.getStringFromSelector(page, newsSelector);
    
        if (!newsString.startsWith("Binance Will List"))
            return [false, ""];
    
        let url = await page.$eval(newsSelector, anchor => anchor.getAttribute('href'));
    
        url = 'https://www.binance.com' + url;
    
        await page.goto(url);

        if (LocalDateTime.now().isAfter((await binance.getLocalDateTimeOfNews(page)).plusMinutes(timeOffsetMinutes)))
            return [false, ""];
    
        return [true, await binance.getSymbol(newsString)];
    },
    
    getLocalDateTimeOfNews: async (page) => {
    
        const timeSelector = 'div > div[data-bn-type]:nth-child(2)';
    
        await page.waitForSelector(timeSelector);
    
        let timeString = await utils.getStringFromSelector(page, timeSelector);
    
        return LocalDateTime.parse(timeString.replace(' ', 'T'));
    },
    
    getSymbol: async (string) => {

        return string.substring(string.lastIndexOf("(") + 1, string.lastIndexOf(")"));
    }
}

module.exports = binance;
