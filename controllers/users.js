const User = require("../models/user");

function createUser(req, res) {
  const { name, about, avatar } = req.body;

  return User.create({ name, about, avatar })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({
          message: `Переданы некорректные данные при создании пользователя. ${err.message}`,
        });

        return;
      }
      res.status(500).send({ message: "Произошла ошибка." });
    });
}

function getUsers(req, res) {
  return User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка." }));
}

function getUserById(req, res) {
  return User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
      res.status(200).send(user);
    })
    .catch(() => res.status(500).send({ message: "Произошла ошибка." }));
}

function updateProfile(req, res) {
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
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({
          message: `Переданы некорректные данные при обновлении профиля. ${err.message}`,
        });

        return;
      }
      res.status(500).send({ message: "Произошла ошибка." });
    });
}

function updateAvatar(req, res) {
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
      }
      res.send({ data: avatar });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({
          message: `Переданы некорректные данные при обновлении аватара. ${err.message}`,
        });

        return;
      }
      res.status(500).send({ message: "Произошла ошибка." });
    });
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
};
