const Card = require("../models/card");

function getCards(req, res) {
  return Card.find({})
    .populate(["owner", "likes"])
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
}

function createCard(req, res) {
  const ownerId = req.user._id;
  const { name, link } = req.body;

  return Card.create({ name, link, owner: ownerId })
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(400).send({ message: "Переданы некорректные данные при создании карточки" }));
}

function deleteCard(req, res) {
  return Card.findByIdAndRemove(req.params.cardId)
    .then(() => res.send({ message: "Карточка удалена" }))
    .catch(() => res.status(404).send({ message: "Карточка с указанным _id не найдена" }));
}

function likeCard(req, res) {
  const ownerId = req.user._id;

  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: ownerId } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .then((like) => res.send({ data: like }))
    .catch(() => res.status(400).send({ message: "Переданы некорректные данные для постановки лайка" }));
}

function dislikeCard(req, res) {
  const ownerId = req.user._id;

  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: ownerId } }, // убрать _id из массива
    { new: true }
  )
    .then((like) => res.send({ data: like }))
    .catch(() => res.status(400).send({ message: "Переданы некорректные данные для снятии лайка" }));
}

module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };
