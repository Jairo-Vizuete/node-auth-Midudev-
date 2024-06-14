import express from "express";
import { PORT, SECRET_KEY } from "./config.js";
import { UserRepository } from "./user-repository.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const token = req.cookies.access_token;
  let data = null;

  req.session = { user: null };

  try {
    data = jwt.verify(token, SECRET_KEY);
    req.session.user = data;
  } catch (error) {
    req.session.user = null;
  }

  next();
});

app.get("/", (req, res) => {
  const { user } = req.session;
  res.render("index", user);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserRepository.login({ username, password });
    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res
      .cookie("access_token", token, {
        httpOnly: true, // The cookie is only allowed on the server
        secure: process.env.NODE_ENV === "production", // It's only allowed in https
        sameSite: "strict", // It's only allowed in the same domain
        maxAge: 1000 * 60 * 60, // Life cycle
      })
      .send({ user, token });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const id = await UserRepository.create({ username, password });
    res.send({ id });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("access_token").json({ message: "logout successful" }); // here we can redirect
});

app.get("/protected", (req, res) => {
  const { user } = req.session;

  if (!user) return res.status(401).send("access not authorized");

  res.render("protected", user);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
