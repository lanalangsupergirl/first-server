import * as http from "http";
import url from "node:url";
import { fileURLToPath } from "url";
import * as fs from "fs";
import { getRecipes } from "./get_recipes.js";
import { addRecipe } from "./add_recipe.js";
import { editRecipe } from "./edit_recipe.js";
import { addUser } from "./add_user.js";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const host = "localhost";
const port = 8080;

const recipesListener = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  let params = new URL(req.url, "http://localhost:8080/");
  let id = params.searchParams.get("id");

  let path = req.url.split("/").pop();

  switch (req.url) {
    case "/recipes":
      if (req.method === "POST") {
        const buffers = [];

        for await (const chunk of req) {
          buffers.push(chunk);
        }

        let recipe = JSON.parse(Buffer.concat(buffers).toString());

        await addRecipe(recipe);
      }

      if (req.method === "PATCH") {
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
      }

      let recipes = await getRecipes();
      res.end(JSON.stringify(recipes));
      break;

    case `/recipe?id=${id}`:
      recipes = await getRecipes();
      let recipe = recipes.find((recipe) => recipe.id == id);

      res.end(JSON.stringify(recipe));
      break;

    case `/images/${path}`:
      const data = fs.readFileSync(__dirname + req.url);

      res.setHeader("Content-Type", "image/png");
      res.end(data);
      break;

    case "/auth":
      let isAvailable = '';

      if (req.method === "POST") {
        const buffers = [];

        for await (const chunk of req) {
          buffers.push(chunk);
        }

        let user =  JSON.parse(Buffer.concat(buffers).toString());
        console.log('user', user);

        isAvailable = await addUser(user);
      }

      console.log("isAvail", isAvailable);

      res.setHeader("Content-Type", "application/json");
      res.end(isAvailable);

      break;

    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
  }
};

const server = http.createServer(recipesListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
