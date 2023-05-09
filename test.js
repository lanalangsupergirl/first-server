import * as http from "http";
import url from "node:url";
import { fileURLToPath } from "url";
import * as fs from "fs";
import { getRecipes } from "./get_recipes.js";
import { dirname } from "path";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const host = "localhost";
const port = 8080;
let recipes = await getRecipes();

let db = new sqlite3.Database("./recipes.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    process.stderr.write(err);
    return;
  }
});

db.serialize();

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

        new Promise((resolve, reject) => {
          // console.log("recipe", recipe);

          db.run(
            "INSERT INTO recipes(title, description, macros, text) VALUES (?, ?, ?, ?)",
            [recipe.title, recipe.description, recipe.macros, recipe.text],
            (err) => {
              if (err) {
                process.stderr.write(err);
                return;
              }
            }
          );

          db.get("SELECT last_insert_rowid() as last_id", [], (err, result) => {
            // console.log("result", result);
            if (err) {
              reject(err);
              return;
            }
            resolve(result.last_id);
          });
        })
          .then((id) => {
            // console.log("id", id);
            db.run(
              "INSERT INTO images(recipe_id, path) VALUES(?, ?)",
              [id, "/images/no_foto.png"],
              (err) => {
                if (err) {
                  process.stderr.write(err);
                  return;
                }
              }
            );

            recipe.categories.forEach((category) => {
              db.get(
                "SELECT rowid, * FROM categories WHERE name = ?",
                [category],
                (err, result) => {
                  if (err) {
                    process.stderr.write(err);
                    return;
                  }

                  db.run(
                    "INSERT INTO recipeCat(recipe_id, category_id) VALUES (?, ?)",
                    [id, result.rowid],
                    (err) => {
                      if (err) {
                        process.stderr.write(err);
                        return;
                      }
                    }
                  );
                }
              );
            });

            recipe.ingredients.forEach((ingredient) => {
              db.get(
                "SELECT rowid, * FROM ingredients WHERE name = ?",
                [ingredient],
                (err, result) => {
                  if (err) {
                    process.stderr.write(err);
                    return;
                  }

                  db.run(
                    "INSERT INTO recipeIng(recipe_id, ingredient_id) VALUES (?, ?)",
                    [id, result.rowid],
                    (err) => {
                      if (err) {
                        process.stderr.write(err);
                        return;
                      }
                    }
                  );
                }
              );
            });
          })
          .then(() => {
            recipe.path = "/images/no_foto.png";
            recipes.push(recipe);
          })
          .catch((err) => {
            if (err) {
              process.stderr.write(err);
              return;
            }
          });
      }

      if (req.method === "PATCH") {
        const buffers = [];

        for await (const chunk of req) {
          buffers.push(chunk);
        }

        let editedRecipe = JSON.parse(Buffer.concat(buffers).toString());

        let originalRecipe = recipes.filter((recipe) => {
          return recipe.id === editedRecipe.id;
        });

        console.log("edited", editedRecipe);
        console.log("original", originalRecipe);

        let updatedFieldsRecipe = {};
        // let updatedFieldsCategories = {};
        // let updatedFieldsIngredients = {};

        originalRecipe.forEach((recipe) => {
          if (recipe.title !== editedRecipe.title) {
            updatedFieldsRecipe["title"] = editedRecipe.title;
          }

          if (recipe.description !== editedRecipe.description) {
            updatedFieldsRecipe["description"] = editedRecipe.description;
          }

          if (recipe.macros !== editedRecipe.macros) {
            updatedFieldsRecipe["macros"] = editedRecipe.macros;
          }

          if (recipe.text !== editedRecipe.text) {
            updatedFieldsRecipe["text"] = editedRecipe.text;
          }
        });

        console.log("fields", updatedFieldsRecipe);

        let query = "UPDATE recipes SET";
        let values = [];

        if (Object.keys(updatedFieldsRecipe).length) {
          for (let column in updatedFieldsRecipe) {
            query += " " + column + "=" + "?" + " ";
            values.push(updatedFieldsRecipe[column]);
          }

          query += " WHERE id = " + editedRecipe.id;
        }

        console.log("query", query);
        console.log("values", values);

        new Promise((resolve, reject) => {

          db.run(query, values, (err) => {
            if (err) {
              reject(err)
              return;
            }
          });
        }).catch((err) => {
          if (err) {
            process.stderr.write(err);
            return;
          }
        });
      }

      res.end(JSON.stringify(recipes));
      break;

    case `/recipe?id=${id}`:
      let recipe = recipes?.find((recipe) => recipe.id == id);

      res.end(JSON.stringify(recipe));
      break;

    case `/images/${path}`:
      const data = fs.readFileSync(__dirname + req.url);

      res.setHeader("Content-Type", "image/png");
      res.end(data);
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
