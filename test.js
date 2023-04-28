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

        let result = new Promise((resolve, reject) => {
          console.log("recipe", recipe);

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
            console.log("result", result);
            if (err) {
              reject(err);
              return;
            }
            resolve(result.last_id);
          });
        })
          .then((id) => {
            console.log("id", id);
            db.run(
              "INSERT INTO images(recipe_id, path) VALUES(?, ?)",
              [id, ''],
              (err) => {
                if (err) {
                  process.stderr.write(err);
                  return;
                }
              }
            );
          })
          .catch((err) => {
            if (err) {
              process.stderr.write(err);
              return;
            }
          });

        //    let body = "";
        //    let recipe = {};
        //   req.on("data", (chunk) => {
        //     body += chunk;
        //     recipe = JSON.parse(body);
        //     recipe.path = ["/images/no_foto.png"];

        //     let result = new Promise((resolve, reject) => {
        //       console.log("recipe", recipe);

        //       db.run(
        //         "INSERT INTO recipes(title, desctiption, macros, text) VALUES (?, ?, ?, ?)",
        //         [recipe.title, recipe.description, recipe.macros, recipe.text],
        //         (err) => {
        //           if (err) {
        //              process.stderr.write(err);
        //              return;
        //           }

        //         }
        //       );

        //       db.get(
        //         "SELECT last_insert_rowid() as last_id",
        //         [],
        //         (err, result) => {
        //           console.log("result", result);
        //           if (err) {
        //             reject(err);
        //             return;
        //           }
        //           resolve(result.last_id);
        //         }
        //       );
        //     })
        //       .then((id) => {
        //         db.run(
        //           "INSERT INTO images(recipe_id, path) VALUES(?, ?)",
        //           [id, recipe.path],
        //           (err) => {
        //             if (err) {
        //                process.stderr.write(err);
        //                return;
        //             }
        //           }
        //         );

        //         //  recipes.categories.forEach((category) => {

        //         //  })
        //       })
        //       .catch((err) => {
        //         if (err) {
        //           process.stderr.write(err);
        //           return;
        //         }
        //       });
        //   });
        // });
      }

      if (req.method === "PATCH") {
        let body = "";
        let response = {};

        req.on("data", (chunk) => {
          body += chunk;
          response = JSON.parse(body);
          console.log("resp", response);
          // json.recipes.forEach((recipe, index) => {
          //   if (recipe.id === response.id) {
          //     json.recipes[index] = response;
          //   }
          // });

          // json.recipes.push(response);
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
