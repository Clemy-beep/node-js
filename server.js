require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const jsonwebtoken = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const app = express();
const port = 3000;
const { urlencoded, json } = require("body-parser");
const prisma = new PrismaClient();
const upload = multer({ dest: "./uploads/" });
const auth = require("./middleware/auth");
const mail = require("./middleware/mailer");
const csv = require("csv-parser");
const fs = require("fs");

app.use(express.json());
app.use(
  cors({ origin: ["http://localhost:8080", "http://192.168.0.55:8080"] })
);
app.use(urlencoded({ extended: true }));
app.use(json());

app.get("/products", auth, async (req, res) => {
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

app.post("/signup", upload.single("profilePic"), async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const profilePic = req.file.filename;
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    return res.status(409).json({
      error: "Existing user",
      message: "This user is already registered",
    });
  }
  const token = jsonwebtoken.sign(
    {
      email,
    },
    process.env.TOKEN_KEY,
    {
      expiresIn: "2h",
    }
  );
  const response = await prisma.user.create({
    data: {
      email,
      password,
      firstName,
      lastName,
      profilePic,
      token,
    },
  });
  mail(email, "New Account", "You created an account on CatFood Store.");
  res.json({ response: response });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    return res.status(400).send("All input required");
  }
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (user && user.password === password) {
    try {
      const token = jsonwebtoken.sign(
        {
          email,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          token: token,
        },
      });
      mail(email, "New Connection", "You just logged in on CatFood Store.");
      res.status(200).json({ token: token });
    } catch (err) {
      console.log(err);
    }
  }
});

app.get("/user/:id/profilepic", auth, async (req, res) => {
  const profilePic = await prisma.user.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
    select: {
      profilePic: true,
    },
  });
  res.sendFile(
    `/home/stagiaire8/Documents/node-js/uploads/${profilePic.profilePic}`
  );
  console.log(profilePic);
});

app.post("/send-file", auth, upload.single("file"), async (req, res) => {
  const file = req.file;
  fs.createReadStream(`${file.path}`)
    .pipe(csv())
    .on("data", async (data) => {
      delete data.id;
      data.price = parseFloat(data.price);
      let d = await prisma.product.create({
        data: data,
      });
      console.log(d);
    })
    .on("end", () => console.log("CSV processed"));
});
app.listen(port, () =>
  console.log(`???? Server ready at: http://localhost:${port}!`)
);
