const jwt = require("jsonwebtoken");

function handleAuthError(res) {
  res.status(403).send({ message: "Необходимо авторизоваться." });
}

function auth(req, res, next) {
  const token = req.cookies.jwt;
  const { NODE_ENV, JWT_SECRET } = process.env;

  if (!token) {
    return handleAuthError(res);
  }

  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "some-secret-key"
    );
  } catch (err) {
    // отправим ошибку, если не получилось
    return handleAuthError(res);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
}

module.exports = { auth };
