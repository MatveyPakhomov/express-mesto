require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { celebrate, Joi, errors } = require("celebrate");

const user = require("./routes/users");
const card = require("./routes/cards");
const { login, createUser } = require("./controllers/users");
const { auth } = require("./middlewares/auth");
const { isValidURL } = require("./utils/methods");
const NotFoundError = require("./errors/not-found-err");
const { requestLogger, errorLogger } = require("./middlewares/logger");
// const { corsRequest } = require("./middlewares/cors");

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect("mongodb://localhost:27017/mestodb");

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// app.use(corsRequest);

app.use(requestLogger); // подключаем логгер запросов

app.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  login
);

app.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().default("Жак-Ив Кусто").min(2).max(30),
      about: Joi.string().default("Исследователь").min(2).max(30),
      avatar: Joi.string().custom(isValidURL),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  createUser
);

app.use(
  "*",
  cors({
    origin: [
      "http://pakhomov.students.nomoredomains.rocks",
      "https://pakhomov.students.nomoredomains.rocks",
      "localhost:3000",
    ],
    methods: ["OPTIONS", "GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "origin", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/", auth, user);
app.use("/", auth, card);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());

app.use("*", (req, res, next) => {
  next(new NotFoundError("Страница не найдена"));
});

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    // проверяем статус и выставляем сообщение в зависимости от него
    message: err.statusCode === 500 ? "На сервере произошла ошибка" : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
