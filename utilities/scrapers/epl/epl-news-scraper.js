const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const delay = require("../puppeteer-utilities/async-delay");
const scrollDownFor = require("../puppeteer-utilities/scroll-down-for");

const scrapeEPLNewsLinks = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.premierleague.com/news");

    await scrollDownFor(page, 10);

    const data = await page.content();

    const articles = new Array();

    if (data) {
      const $ = cheerio.load(data);

      $(".featuredArticle .col-9-m a").each((i, art) => {
        const article = new Object();
        let href = $(art).attr("href");

        if (href.includes("premierleague.com/")) href = href.split(".com/")[1];

        let link = "https://www.premierleague.com/" + href;

        if (link.includes(".com//")) link = link.replace(".com//", ".com/");

        const image = $(art).find("img").attr("src");
        article.image = image;

        if (!link.includes("/match/")) {
          article.url = link;

          articles.push(article);
        }
      });
    }
    await browser.close();

    return articles;
  } catch (err) {
    console.log(err);
  }
};

const scrapeEPLArticles = async (articles) => {
  try {
    const completeArticles = new Array();

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    for (let article of articles) {
      const link = article.url;

      await page.goto(link);

      await delay(2000);

      const data = await page.content();

      if (data) {
        const $ = cheerio.load(data);

        article.league = "English Premier League";

        const title = $(".articleHeader h1").text();
        article.title = title;

        const description = $(".standardArticle .subHeader").text();
        if (description) article.description = description;

        $(".articleHeader newsTag").remove();
        $(".articleHeader articleAuth").remove();

        const dateString = $(".articleHeader h5").text();

        const articleDate = new Date(dateString.trim() + " 15:00");

        if (articleDate.toString() != "Invalid Date") {
          article.date = articleDate.toISOString().split("T")[0];
          completeArticles.push(article);
        }
      }
    }
    page.close();
    await browser.close();

    let currentDate;
    let substractTime = 0;

    completeArticles.forEach((article) => {
      const date = article.date;

      if (currentDate != date) {
        currentDate = date;
        substractTime = 0;
      } else {
        substractTime = substractTime + 1;
      }

      const hour = 20 - substractTime;
      const time = `${hour}:15`;

      article.time = time;
    });

    return completeArticles;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { scrapeEPLNewsLinks, scrapeEPLArticles };
