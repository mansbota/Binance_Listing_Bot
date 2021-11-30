const utils = require('./utils');
const SHELDON_URL = 'https://www.patreon.com/sheldonevans/posts';

const patreon = {

    evaluatePost: async (page) => {

        await page.goto(SHELDON_URL);
        const firstPostSelector = 'div[data-tag="post-stream-container"] > ul > li:nth-child(1) > div[data-tag="post-card"]';
        
        const postTitleSelector = firstPostSelector + ' span[data-tag="post-title"] > a';
        await page.waitForSelector(postTitleSelector);

        let postTitle = await utils.getStringFromSelector(page, postTitleSelector);
        postTitle = postTitle.toLowerCase();

        if (!postTitle.includes("altcoin"))
            return [false, ""];

        const postParagraphSelector = firstPostSelector + ' div[data-tag="post-content-collapse"] p';
        await page.waitForSelector(postParagraphSelector);
        
        let paragraphs = await page.$$(postParagraphSelector);
        let textParagraphs = [];
        
        for (let i = 0; i < paragraphs.length; i++) {
            textParagraphs.push(await utils._getProperty(paragraphs[i], 'innerText'));
        }

        for (let i = 0; i < textParagraphs.length; i++) {

            const text = textParagraphs[i];
            const firstIndex = text.indexOf("(");

            if (firstIndex !== -1) {
                
                let symbol = text.substring(firstIndex + 1, text.indexOf(")"));
                symbol = symbol.replace(/\s/g, "");
                return [true, symbol];
            }
        }

        return [false, ""];
    }
}

module.exports = patreon;