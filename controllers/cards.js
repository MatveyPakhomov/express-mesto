const Card = require("../models/card");

function getCards(req, res) {
  return Card.find({})
    .populate(["owner", "likes"])
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка." }));
}

function createCard(req, res) {
  const ownerId = req.user._id;
  const { name, link } = req.body;

  return Card.create({ name, link, owner: ownerId })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({
          message: `Переданы некорректные данные при создании карточки. ${err.message}`,
        });

        return;
      }
      res.status(500).send({ message: "Произошла ошибка." });
    });
}

function deleteCard(req, res) {
  return Card.findByIdAndRemove(req.params.cardId)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: "Карточка с указанным _id не найдена." });

        return;
      }
      res.send({ message: "Карточка удалена." });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные для удаления карточки.",
        });

        return;
      }
      res.status(500).send({ message: "Произошла ошибка." });
    });
}

function likeCard(req, res) {
  const ownerId = req.user._id;

  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: ownerId } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .then((like) => {
      if (!like) {
        res
          .status(404)
          .send({ message: "Передан несуществующий _id карточки." });

        return;
      }
      res.send({ data: like });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные для постановки лайка.",
        });

        return;
      }
      res.status(500).send({ message: "Произошла ошибка." });
    });
}

function dislikeCard(req, res) {
  const ownerId = req.user._id;

  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: ownerId } }, // убрать _id из массива
    { new: true }
  )
    .then((like) => {
      if (!like) {
        res
          .status(404)
          .send({ message: "Передан несуществующий _id карточки." });

        return;
      }
      res.send({ data: like });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные для снятии лайка.",
        });

        return;
      }
      res.status(500).send({ message: "Произошла ошибка." });
    });
}

module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };
