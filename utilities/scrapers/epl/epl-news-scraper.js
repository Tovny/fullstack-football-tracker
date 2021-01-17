const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const delay = require("../puppeteer-utilities/async-delay");
const scrollDownFor = require("../puppeteer-utilities/scroll-down-for");

const scrapeEPLNews = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.premierleague.com/news");

    await scrollDownFor(page, 10);

    const data = await page.content();

    const articles = new Array();

    if (data) {
      const $ = cheerio.load(data);

      $(".thumbnail.thumbLong").each((i, art) => {
        let article = {};

        article.league = "English Premier League";
        article.title = $(art).find(".title").text();
        article.description = $(art).find(".text").text();

        const image = $(art).find(".thumbCrop-news-list img").attr("src");
        if (image) article.image = image.trim();

        let href = $(art).attr("href");

        if (href.includes("premierleague.com/")) href = href.split(".com/")[1];

        let link = "https://www.premierleague.com/" + href;
        link = link.replace(".com//", ".com/");
        article.url = link;

        if (!link.includes("/match/")) articles.push(article);
      });
    }
    await browser.close();

    return articles;
  } catch (err) {
    console.log(err);
  }
};

const scrapeEPLArticleDates = async (articles) => {
  try {
    const completeArticles = new Array();

    let currentDate;
    let substractTime = 0;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    for (let article of articles) {
      const link = article.url;

      await page.goto(link);

      await delay(2000);

      const data = await page.content();

      if (data) {
        const $ = cheerio.load(data);

        $(".articleHeader newsTag").remove();
        $(".articleHeader articleAuth").remove();

        const dateString = $(".articleHeader h5").text();

        const articleDate = new Date(dateString.trim() + " 15:00");

        if (articleDate.toString() != "Invalid Date") {
          const date = articleDate.toISOString().split("T")[0];
          if (currentDate != date) {
            currentDate = date;
            substractTime = 0;
          } else {
            substractTime = substractTime + 1;
          }

          const hour = 18 - substractTime;
          const time = `${hour}:00`;

          article.date = date;
          article.time = time;

          completeArticles.push(article);
        }
      }
    }
    await browser.close();

    return completeArticles;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { scrapeEPLNews, scrapeEPLArticleDates };
