import pkg from "@prisma/client";

const { PrismaClient } = pkg;
import express from "express";
const app = express();
const port = 3000;
import cors from "cors";
import pkgg from "body-parser";
const { urlencoded, json } = pkgg;
const prisma = new PrismaClient();

app.use(express.json());
app.use(
  cors({ origin: ["http://localhost:8080", "http://192.168.0.55:8080"] })
);
app.use(urlencoded({ extended: true }));
app.use(json());

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.get("/article/:id", async (req, res) => {
  const prod = await prisma.product.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!prod) return res.status(400).json({ message: "Product not found" });
  res.json(prod);
});

app.post("/add-product", async (req, res) => {
  const { title, description, brand, price, currency } = req.body;
  const result = await prisma.product.create({
    data: {
      title,
      description,
      brand,
      currency,
      price,
    },
  });
  res.json(result);
});

app.delete("/delete/:id", async (req, res) => {
  const response = await prisma.product.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });
  res.json(response);
});

app.patch("/edit/:id", async (req, res) => {
  const { title, description, brand, currency, price } = req.body;
  const updateProduct = await prisma.product.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: {
      title: title,
      description: description,
      brand: brand,
      currency: currency,
      price: parseInt(price),
    },
  });
  res.json(updateProduct);
});
// app.patch("/edit/:id", function (req, res) {
//   const article = _articles.find((a) => a.id.toString() === req.params.id);
//   if (!article) return res.status(404).json({ message: "Not Found" });
//   article.title = req.body.title;
//   article.price = req.body.price;
//   article.currency = req.body.currency;
//   article.brand = req.body.brand;
//   article.description = req.body.description;
//   _articles.forEach((element, index) => {
//     if (element.id === article.id) {
//       _articles[index] = article;
//     }
//   });
//   writeFile(
//     "inventory.json",
//     JSON.stringify({ articles: _articles }),
//     function (err) {
//       console.log(err);
//     }
//   );
//   res.send({ message: "Ok" });
// });

app.listen(port, () =>
  console.log(`🚀 Server ready at: http://localhost:${port}!`)
);
