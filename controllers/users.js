const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const NotFoundError = require("../errors/not-found-err");
const UnauthorizedError = require("../errors/unauthorized-err");

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
        throw new UnauthorizedError("Ошибка авторизации");
      }

      // отправим токен, браузер сохранит его в куках
      res
        .status(200)
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
        // вот это я затроил конечно...
        next(
          new BadRequestError(
            `Переданы некорректные данные при создании пользователя. ${err.message}`
          )
        );
      }

      if (err.name === "MongoServerError" && err.code === 11000) {
        next(new ConflictError("Данный email уже зарегистрирован."));
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
        throw new NotFoundError("Пользователь по указанному _id не найден.");
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(
          new BadRequestError(
            "Переданы некорректные данные для поиска пользователя."
          )
        );
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
        throw new NotFoundError("Пользователь с указанным _id не найден.");
      }
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            `Переданы некорректные данные при обновлении профиля. ${err.message}`
          )
        );
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
    }
  )
    .then((avatar) => {
      if (!avatar) {
        throw new NotFoundError("Пользователь с указанным _id не найден.");
      }
      res.send({ avatar });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            `Переданы некорректные данные при обновлении аватара. ${err.message}`
          )
        );
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
