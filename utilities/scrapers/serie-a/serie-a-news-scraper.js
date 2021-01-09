const cheerio = require("cheerio");
const fetch = require("node-fetch");

const scrapeSerieANews = async () => {
  let news = new Array();

  try {
    for (let i = 1; i <= 10; i++) {
      const res = await fetch(
        `http://www.legaseriea.it/en/press/news?page=${i}`
      );
      const html = await res.text();

      const $ = cheerio.load(html);
      let articles = $("article");

      let currentDate;
      let substractTime = 0;

      articles.each((i, article) => {
        const newsArticle = new Object();

        const parseDate = () => {
          const dateData = $(article).find("time").attr("datetime");
          let [year, month, day] = dateData.split("-");
          month = month - 1;

          const date = new Date(year, month, day, 15);

          return date.toISOString().split("T")[0];
        };

        newsArticle.date = parseDate();
        newsArticle.league = $(article).find(".cat").text().trim();
        newsArticle.title = $(article).find("h2").text().trim();
        newsArticle.image = $(article).find("img").attr("src");
        newsArticle.url =
          "http://www.legaseriea.it" +
          $(article).find("a:nth-child(1)").attr("href");

        if (currentDate != newsArticle.date) {
          currentDate = newsArticle.date;
          substractTime = 0;
        } else {
          substractTime = substractTime + 1;
        }

        const hour = 18 - substractTime;
        const time = `${hour}:00`;

        newsArticle.time = time;

        news.push(newsArticle);
      });
    }
  } catch (err) {
    console.log(err);
  }

  return news;
};

module.exports = scrapeSerieANews;
