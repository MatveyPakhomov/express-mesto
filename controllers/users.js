const User = require("../models/user");

function createUser(req, res) {
  const { name, about, avatar } = req.body;

  return User.create({ name, about, avatar })
    .then((user) => res.status(200).send({ data: user }))
    .catch(() =>
      res.status(400).send({
        message: "Переданы некорректные данные при создании пользователя",
      })
    );
}

function getUsers(req, res) {
  return User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
}

function getUserById(req, res) {
  return User.findById(req.params.id)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(() =>
      res
        .status(404)
        .send({ message: "Пользователь по указанному _id не найден" })
    );
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
      upsert: false, // если пользователь не найден, он будет создан
    }
  )
    .then((user) => res.send({ data: user }))
    .catch(() =>
      res.send({
        message: "Переданы некорректные данные при обновлении профиля",
      })
    );
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
    .then((avatar) => res.send({ data: avatar }))
    .catch(() =>
      res.send({
        message: "Переданы некорректные данные при обновлении профиля",
      })
    );
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
};
