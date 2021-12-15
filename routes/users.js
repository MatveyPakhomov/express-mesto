const User = require('../models/user');

router.post('/', (req, res) => {
  const { name, about } = req.body;

  // записываем данные в базу
  User.create({ name, about })
    // возвращаем записанные в базу данные пользователю
    .then(user => res.send({ data: user }))
    // если данные не записались, вернём ошибку
    .catch(err => res.status(500).send({ message: 'Произошла ошибка' }));
});