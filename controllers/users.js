const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

function login(req, res, next) {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна! пользователь в переменной user
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === "production" ? JWT_SECRET : "some-secret-key",
        {
          expiresIn: "7d",
        }
      );

      if (!token) {
        res.status(401).send({ message: "Ошибка авторизации" });

        return;
      }

      // отправим токен, браузер сохранит его в куках
      res
        .status(201)
        .cookie("jwt", token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ token })
        .end();
    })
    .catch(next);
}

function createUser(req, res, next) {
  const { name, about, avatar, email } = req.body;

  return bcrypt
    .hash(req.body.password, 10)
    .then((hash) =>
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
    )
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({
          message: `Переданы некорректные данные при создании пользователя. ${err.message}`,
        });

        return;
      }

      if (err.name === "MongoServerError" && err.code === 11000) {
        res.status(409).send({
          message: "Данный email уже зарегистрирован.",
        });

        return;
      }
      next(err);
    });
}

function getUsers(req, res, next) {
  return User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(next);
}

function getUserById(req, res, next) {
  return User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });

        return;
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные для поиска пользователя.",
        });

        return;
      }
      next(err);
    });
}

function getProfile(req, res, next) {
  return User.findById(req.user._id)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(next);
}

function updateProfile(req, res, next) {
  const { name, about } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    }
  )
    .then((user) => {
      if (!user) {
        res
          .status(404)
          .send({ message: "Пользователь с указанным _id не найден." });

        return;
      }
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({
          message: `Переданы некорректные данные при обновлении профиля. ${err.message}`,
        });

        return;
      }
      next(err);
    });
}

function updateAvatar(req, res, next) {
  const { avatar } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
      upsert: false, // если пользователь не найден, он будет создан
    }
  )
    .then((avatar) => {
      if (!avatar) {
        res
          .status(404)
          .send({ message: "Пользователь с указанным _id не найден." });

        return;
      }
      res.send({ avatar });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({
          message: `Переданы некорректные данные при обновлении аватара. ${err.message}`,
        });

        return;
      }
      next(err);
    });
}

module.exports = {
  login,
  createUser,
  getUsers,
  getProfile,
  getUserById,
  updateProfile,
  updateAvatar,
};
