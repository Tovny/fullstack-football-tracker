const cheerio = require("cheerio");
const fetch = require("node-fetch");

const scrapeSerieANews = async () => {
  let news = new Array();

  try {
    for (let i = 1; i <= 20; i++) {
      const res = await fetch(
        `https://www.legaseriea.it/en/press/news?page=${i}`
      );
      const html = await res.text();

      if (res.status == 200 && html) {
        const $ = cheerio.load(html);
        let articles = $("article");

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
            "https://www.legaseriea.it" +
            $(article).find("a:nth-child(1)").attr("href");

          news.push(newsArticle);
        });
      }
    }

    let currentDate;
    let substractTime = 0;

    news.forEach((article) => {
      if (currentDate != article.date) {
        currentDate = article.date;
        substractTime = 0;
      } else {
        substractTime = substractTime + 1;
      }

      const hour = 20 - substractTime;
      const time = `${hour}:00`;

      article.time = time;
    });
  } catch (err) {
    console.log(err);
  }

  return news;
};

module.exports = scrapeSerieANews;
