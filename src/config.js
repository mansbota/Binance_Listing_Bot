const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../config.env' });

module.exports = {
    METAMASK_PASSWORD: process.env.METAMASK_PASSWORD,
    METAMASK_PATH: process.env.METAMASK_PATH,
    BROWSER_EXE: process.env.BROWSER_EXE,
    USER_DATA: process.env.USER_DATA
};
