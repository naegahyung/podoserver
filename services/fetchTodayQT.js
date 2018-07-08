const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');
const async = require('async');

module.exports = (date) => { 
  const living = `http://qt.swim.org/user_utf/living/user_print_web.php?edit_all=${date}` //en
  const life = `http://qt.swim.org/user_utf/life/user_print_web.php?edit_all=${date}` //kr

  return new Promise(async resolve => {
    async.parallel({
      living: function(callback) {
        scrapeLiving(living, result => {
          callback(null, result);
        })
      },
      life: function(callback) {
        scrapeLife(life, result => {
          callback(null, result);
        })
      }
    }, function(err, results) {
      resolve(results);
    });
  });
};

const scrapeLife = async (address, cb) => {
  const lifeHtml = await axios.get(address);
  let $ = cheerio.load(lifeHtml.data);
  let text = [];
  const todaysQT = $('table tr:nth-child(3) table table table tr:nth-child(2) td');
  let verses = $(todaysQT).find('strong').slice(1, 2).text();
  $(todaysQT).find('div div').each((i, ele) => {
    let element = $(ele).text().replace(/ \n/g, '');
    if (element) {
      let verseNumber = element.substr(0, element.indexOf(' '));
      text.push(element.replace(verseNumber, `${verseNumber}. `));
    }
  });
  text = text.slice(1);
  verses = verses.slice(1);
  cb({ text, verses });
};

const scrapeLiving = async (address, cb) => {
  const lifeHtml = await axios.get(address);
  let $ = cheerio.load(lifeHtml.data);
  let text = [];
  const todaysQT = $('table tr:nth-child(3) table table table tr:nth-child(2) td');
  let verses = $(todaysQT).find('strong').text();
  $(todaysQT).find('div div').each((i, ele) => {
    text.push($(ele).text().replace(/\n/g, '').trim().slice(0, -1));
  });

  text = text.slice(0, -1);
  text = _.compact(text);
  
  cb({ text, verses });
}