import express from "express";
import cors from "cors";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import * as fs from "fs";
import { getRecipes } from "./get_recipes.js";
import { addRecipe } from "./add_recipe.js";
import { editRecipe } from "./edit_recipe.js";
import { addUser } from "./add_user.js";
import { LogIn } from "./login.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.set("trust proxy", 1);
app.use(express.json()); //a built express middleware that convert request body to JSON.
app.use(express.urlencoded({ extended: true })); //a body parser for html post form.

let redisClient = createClient();
redisClient.connect().catch(console.error);

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "app:",
});

app.use(
  session({
    store: redisStore,
    secret: "sekret-bobra", //должен хрнаиться в переменной и быть скрыт
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'lax'
    },
  })
);

app.route("/recipes")
  .get(async function (req, res) {
    let recipes = await getRecipes();

    res.send(JSON.stringify(recipes));
  })
  .post(async function (req, res) {
    let recipe = req.body;

    await addRecipe(recipe);

    let recipes = await getRecipes();

    res.send(JSON.stringify(recipes));
  })
  .patch(async function (req, res) {
    let editedRecipe = req.body;

    let recipes = await getRecipes();

    let originalRecipe = recipes.filter((recipe) => {
      return recipe.id === editedRecipe.id;
    })[0];

    console.log("original", originalRecipe);

    await editRecipe(originalRecipe, editedRecipe);

    recipes = await getRecipes();

    res.send(JSON.stringify(recipes));
  });

app.get("/images/:path", function (req, res) {
  let path = req.params.path;

  const data = fs.readFileSync(__dirname + req.url);

  res.setHeader("Content-Type", "image/png");
  res.send(data);
});

app.get("/recipe/id=:id", async function (req, res) {
  let id = req.params.id;

  let recipes = await getRecipes();

  let recipe = recipes.find((recipe) => recipe.id == id);

  res.send(JSON.stringify(recipe));
});

app.post("/auth", async function (req, res) {
  let user = req.body;

  let isAvailable = await addUser(user);

  res.setHeader("Content-Type", "application/json");
  res.send(isAvailable);
});

app.post("/login", async function (req, res) {
  let user = req.body;

  let isLogIn = await LogIn(user);

  req.session.key = req.sessionID;
  req.session.save();

  console.log("sess", req.session);

  res.setHeader("Content-Type", "application/json");
  res.send(isLogIn);
});

app.use((req, res, next) => {
  if (!req.session.key) {
    const err = new Error("err");
    err.statusCode = 401;
    next(err);
  }
  next();
});

app.use((req, res, next) => {
  res.status(404).send(JSON.stringify({ error: "Resource not found" }));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
