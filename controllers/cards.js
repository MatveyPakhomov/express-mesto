const Card = require("../models/card");
const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const ForbiddenError = require("../errors/forbidden-err");

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
        next(
          new BadRequestError(
            `Переданы некорректные данные при создании карточки. ${err.message}`
          )
        );
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
        throw new NotFoundError("Карточка с указанным _id не найдена.");
      }

      const ownerId = data.owner._id.toString();

      if (ownerId !== userId) {
        throw new ForbiddenError(
          "Невовзможно удалить карточку созданную другим пользователем"
        );
      }

      Card.findByIdAndRemove(req.params.cardId).then(() =>
        res.send({ message: "Карточка удалена." })
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(
          new BadRequestError(
            "Переданы некорректные данные для удаления карточки."
          )
        );
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
        throw new NotFoundError("Передан несуществующий _id карточки.");
      }
      res.send({ data: like });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(
          new BadRequestError(
            "Переданы некорректные данные для постановки лайка."
          )
        );
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
        throw new NotFoundError("Передан несуществующий _id карточки.");
      }
      res.send({ data: like });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(
          new BadRequestError("Переданы некорректные данные для снятии лайка.")
        );
      }
      next(err);
    });
}

module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };
