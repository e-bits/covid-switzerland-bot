const csvParser = require("csv-parse");
const got = require("got");
const dateFormat = require("dateformat");


async function download(canton) {
  const URL_SZ =
  `https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_kanton_total_csv/COVID19_Fallzahlen_Kanton_${canton}_total.csv`;
  try {
    const response = await got(URL_SZ);
    const csvPromise = new Promise((resolve, reject) => {
      csvParser(response.body, { columns: true }, function(err, rows) {
        resolve(rows) ;
      });
    });
    return csvPromise;
    } catch (error) {
    console.log(error);
  }
}

function calculate(data) {
  let lastScrapeDate = new Date(data[data.length - 1].date.toString() + " " + data[data.length - 1].time.toString());
  let secondLastScrapeDate = new Date(data[data.length - 2].date.toString() + " " + data[data.length - 2].time.toString());

  let cases = {
    ncumul_conf:      data[data.length - 1].ncumul_conf - data[data.length - 2].ncumul_conf,
    ncumul_released:  data[data.length - 1].ncumul_released - data[data.length - 2].ncumul_released,
    ncumul_deceased:  data[data.length - 1].ncumul_deceased - data[data.length - 2].ncumul_deceased,
    scrape_date:      lastScrapeDate,
    day_diff:         Math.ceil(Math.abs(secondLastScrapeDate - lastScrapeDate) / (1000 * 60 * 60 * 24))
  }

  return cases;
}

module.exports.formatAsMarkdown = async function(canton) {
  let data = await download(canton);
  let cases = calculate(data);
  let markdownMessage = `\`Canton:    ${canton}\n`;
      markdownMessage +=  `Updated:   ${dateFormat(cases.scrape_date, "ddd dS mmm yy HH:MM")}\n\n`
      markdownMessage +=  `Newly reported within ${cases.day_diff} day(s)\n`
      markdownMessage +=  `Confirmed: ${cases.ncumul_conf}\n`
      markdownMessage +=  `Released:  ${cases.ncumul_released}\n`
      markdownMessage +=  `Deceased:  ${cases.ncumul_deceased}\``;
  return markdownMessage;
};