// Массив доменов, с которых разрешены кросс-доменные запросы
const allowedCors = [
  "http://pakhomov.students.nomoredomains.rocks",
  "https://pakhomov.students.nomoredomains.rocks",
  "localhost:3000",
];

// eslint-disable-next-line consistent-return
function corsRequest(req, res, next) {
  const { origin } = req.headers; // Сохраняем источник запроса в переменную origin

  // проверяем, что источник запроса есть среди разрешённых
  if (allowedCors.includes(origin)) {
    // устанавливаем заголовок, который разрешает браузеру запросы с этого источника
    res.header("Access-Control-Allow-Origin", origin);
  }

  const { method } = req; // Сохраняем тип запроса (HTTP-метод) в соответствующую переменную
  // Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)
  const DEFAULT_ALLOWED_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE";
  const requestHeaders = req.headers["access-control-request-headers"];
  // Если это предварительный запрос, добавляем нужные заголовки
  if (method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
    res.header("Access-Control-Allow-Headers", requestHeaders);

    res.end();
  }

  next();
}

module.exports = { corsRequest };
