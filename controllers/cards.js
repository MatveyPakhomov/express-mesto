const Card = require("../models/card");

function getCards(req, res, next) {
  return Card.find({})
    .populate(["owner", "likes"])
    .then((cards) => res.send({ cards }))
    .catch(next);
}

function createCard(req, res, next) {
  const ownerId = req.user._id;
  const { name, link } = req.body;

  return Card.create({ name, link, owner: { _id: ownerId } })
    .then((card) => res.send({ card }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({
          message: `Переданы некорректные данные при создании карточки. ${err.message}`,
        });

        return;
      }
      next(err);
    });
}

function deleteCard(req, res, next) {
  const userId = req.user._id;

  return Card.findById(req.params.cardId)
    .populate(["owner"])
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: "Карточка с указанным _id не найдена." });

        return;
      }

      // остаить так, или внести в .eslintrc?
      // или привести типы к единому и использовать строгое сравнение?

      // eslint-disable-next-line eqeqeq
      if (data.owner._id != userId) {
        res.status(403).send({
          message:
            "Невовзможно удалить карточку созданную другим пользователем",
        });

        return;
      }

      Card.findByIdAndRemove(req.params.cardId).then(() =>
        res.send({ message: "Карточка удалена." })
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные для удаления карточки.",
          err,
        });

        return;
      }
      next(err);
    });
}

function likeCard(req, res, next) {
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
      next(err);
    });
}

function dislikeCard(req, res, next) {
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
      next(err);
    });
}

module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };
