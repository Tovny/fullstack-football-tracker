const delay = require("./async-delay");

const scrollDownFor = async (page, scrollNum) => {
  for (let i = 0; i <= scrollNum; i++) {
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    await delay(2500);
  }
};

module.exports = scrollDownFor;
