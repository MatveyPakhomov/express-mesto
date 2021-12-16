const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const user = require("./routes/users");
const card = require("./routes/cards");

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect("mongodb://localhost:27017/mestodb");

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

app.use((req, res, next) => {
  req.user = {
    _id: "61ba73bc7a20ace6071a53ce",
  };

  next();
});

app.use(user);
app.use(card);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
