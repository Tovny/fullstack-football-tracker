const delay = require("./async-delay");

const scrollToBottom = async (page) => {
  await delay(2500);
  let currentHeight = await page.evaluate("document.body.scrollHeight");
  await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
  let totalHeight = await page.evaluate("document.body.scrollHeight");

  if (currentHeight < totalHeight) {
    await scrollToBottom(page);
  } else {
    await delay(2500);
  }
};

module.exports = scrollToBottom;
