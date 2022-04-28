const express = require("express");
const app = express();
const port = 3000;
const inventory = require("./inventory.json");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

app.use(
  cors({ origin: ["http://localhost:8080", "http://192.168.0.55:8080"] })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello World!"));
app.get("/home", (req, res) => {
  res.send(inventory.articles);
});
app.get("/article/:id", (req, res) => {
  const article = inventory.articles.find(
    (a) => a.id.toString() === req.params.id
  );
  if (!article) return res.status(404).json({ message: "Not found" });
  res.status(200).json(article);
});

app.patch("/edit/:id", function (req, res) {
  const article = inventory.articles.find(
    (a) => a.id.toString() === req.params.id
  );
  if (!article) return res.status(404).json({ message: "Not Found" });
  article.title = req.body.title;
  article.price = req.body.price;
  article.currency = req.body.currency;
  article.brand = req.body.brand;
  article.description = req.body.description;
  inventory.articles.forEach((element, index) => {
    if (element.id === article.id) {
      inventory.articles[index] = article;
    }
  });
  fs.writeFile(
    "inventory.json",
    JSON.stringify({ articles: inventory.articles }),
    function (err) {
      console.log(err);
    }
  );
  res.send({ message: "Ok" });
});

app.post("/add-product", function (req, res) {
  var article = req.body;
  article.id = inventory.articles.length + 1;
  if (
    !article.title ||
    !article.description ||
    !article.price ||
    !article.currency ||
    !article.brand
  ) {
    res.send({ code: "101", message: "Missing fields" });
    return;
  }
  inventory.articles.push(article);
  fs.writeFile(
    "inventory.json",
    JSON.stringify({ articles: inventory.articles }),
    function (err) {
      console.log(err);
    }
  );
  return res.send({ message: "Ok" });
});

app.delete("/delete/:id", function (req, res) {
  let newInventory = inventory.articles.filter(
    (item) => item.id.toString() !== req.params.id.toString()
  );
  fs.writeFile(
    "inventory.json",
    JSON.stringify({ articles: newInventory }),
    function (err) {
      console.log(err);
    }
  );
  res.send({ message: "Ok" });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
