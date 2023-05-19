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
            if (err) {
              reject(err);
              return;
            }
            resolve(result.last_id);
          });
        })
          .then((id) => {
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
              console.log(ingredient);
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
          .then(async () => {
            recipes = await getRecipes();
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

        let originalRecipe = await recipes.filter((recipe) => {
          return recipe.id === editedRecipe.id;
        });

        new Promise((resolve, reject) => {
          let updatedFieldsRecipe = {};

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

          let ingredientsArr = [];
          editedRecipe.ingredients.forEach((ing) => {
            ingredientsArr.push(ing);
          });

          let categoriesArr = [];
          editedRecipe.categories.forEach((ing) => {
            categoriesArr.push(ing);
          });

          let query = "";
          let values = [];

          console.log("updatedFieldsRecipe", updatedFieldsRecipe);

          if (Object.keys(updatedFieldsRecipe).length) {
            query = "UPDATE recipes SET";

            for (let column in updatedFieldsRecipe) {
              if (updatedFieldsRecipe[column] !== "") {
                query += " " + column + "=" + "?" + ",";

                values.push(updatedFieldsRecipe[column]);

                query = query.substring(0, query.length - 1);
              }
            }

            query += " WHERE id = " + editedRecipe.id;
          } else {
            reject();
          }

          console.log("query", query);

          let data = {
            query: query,
            values: values,
            ingredients: ingredientsArr,
            categories: categoriesArr,
            id: editedRecipe.id,
          };

          if (
            query !== "" &&
            values !== [] &&
            ingredientsArr !== [] &&
            categoriesArr !== [] // некрасиво как-то
          ) {
            resolve(data);
          }
        })
          .then((data) => {
            console.log("data", data);
            db.run(
              "DELETE FROM recipeCat WHERE recipe_id = ?",
              [data.id],
              (err) => {
                if (err) {
                  process.stderr.write(err);
                  return;
                }
              }
            );

            db.run(
              "DELETE FROM recipeIng WHERE recipe_id = ?",
              [data.id],
              (err) => {
                if (err) {
                  process.stderr.write(err);
                  return;
                }
              }
            );

            db.run(data.query, data.values, (err) => {
              if (err) {
                process.stderr.write(err);
                return;
              }
            });

            data.categories.forEach((category) => {
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
                    [data.id, result.rowid],
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

            data.ingredients.forEach((ingredient) => {
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
                    [data.id, result.rowid],
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
          .catch((err) => {
            if (err) {
              process.stderr.write(err);
              return;
            }
          });
      }

      recipes = await getRecipes();
      res.end(JSON.stringify(await recipes));
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
