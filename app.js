const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const hashTime = 60000 * 1; // 1 минута

async function getData () { //Парсинг дока sheet google
  const doc = new GoogleSpreadsheet('1sg4CQpCQw8_1zos2GGZdsZJJBLF5Bw-SAmb-YM34f4g'); // ID дока
  await doc.useServiceAccountAuth(require('./credentials.json')); // Ключи google
  await doc.loadInfo(); // Данные по листу (Неиспользуется)
  const sheet = doc.sheetsByIndex['0']; // 1 лист в доке
  await sheet.loadCells('A1:AT1'); // Загрузка из дока линии
  
  const cellsNames = ['A', 'C', 'E', 'G', 'I', 'K', 'M', 'S', 'U','W','Y','AA','AC','AE','AG','AI','AK','AM','AO','AQ','AS']; //Названия округов
  const cellsValues = ['B', 'D', 'F', 'H', 'J', 'L', 'N', 'T','V','X','Z','AB','AD','AF','AH','AJ','AL','AN','AP','AR','AT']; //Значения подписей
  let result = {}; // Объект с данными

  for (let i = 0; i < cellsNames.length; i++) {
    result[sheet.getCellByA1(cellsNames[i]+'1').value] = sheet.getCellByA1(cellsValues[i]+'1').value;
  }
  
  global.data = result; // Создание глоабльного объекта
  global.timeStamp = Date.now(); // Текущее время парсинга
  return result;
}

getData(); // Спарсить

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('dotenv').config({ path: 'env' });

app.use('/assets', express.static('assets'));

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
  res.render('main.html');
});

app.get('/data', async function (req, res) {
  if (typeof (timeStamp) != 'undefined' && typeof (data) != 'undefined') {
    if ((Date.now() - timeStamp) < hashTime) {
      res.json({ status: 'success', data: global.data });
    } else {
      let newData = await getData();
      res.json({ status: 'success', data: newData });
    }
  } else res.json({ status: 'error', code: 1, error: 'Данные не готовы' });
})

app.get('*', function (req, res) {
  res.status(404).send('Page Not Found');
});

app.listen(process.env.PORT, function () {
  console.log(`NPscore APP listening on port ${process.env.PORT}!`);
});

module.exports = app;