import express from "express";
import cors from "cors";
import * as fs from "fs";
import { getRecipes } from "./get_recipes.js";
import { addRecipe } from "./add_recipe.js";
import { editRecipe } from "./edit_recipe.js";
import { addUser } from "./add_user.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());

app.route("/recipes")
  .get(async function (req, res) {
    let recipes = await getRecipes();

    res.send(JSON.stringify(recipes));
  })
  .post(async function (req, res) {
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    let recipe = JSON.parse(Buffer.concat(buffers).toString());

    await addRecipe(recipe);

    let recipes = await getRecipes();

    res.send(JSON.stringify(recipes));
  })
  .patch(async function (req, res) {
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    let editedRecipe = JSON.parse(Buffer.concat(buffers).toString());

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
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  let user = JSON.parse(Buffer.concat(buffers).toString());

  let isAvailable = await addUser(user);

  res.setHeader("Content-Type", "application/json");
  res.send(isAvailable);
});

app.use((req, res, next) => {
  res.status(404).send(JSON.stringify({ error: "Resource not found" }));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
