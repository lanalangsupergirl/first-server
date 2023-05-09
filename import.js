// const fs = require("fs");
// const sqlite3 = require("sqlite3").verbose();
// let dataRecipes = require("./recipes.json");
// const crypto = require("crypto");

import * as fs from "fs";
import sqlite3 from "sqlite3";
import crypto from "crypto";
import dataRecipes from "./recipes.json" assert { type: "json" };
import { fileURLToPath } from "url";
import { dirname } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = new sqlite3.Database("./recipes.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    process.stderr.write(err);
    return;
  }
});

db.serialize();

const reset = new Promise((resolve, reject) => {
  const handler = (err) => {
    if (err) {
      reject(err);
      return;
    }
  };

  db.run("DROP TABLE IF EXISTS recipes", [], handler);
  db.run("DROP TABLE IF EXISTS ingredients", [], handler);

  db.run("DROP TABLE IF EXISTS categories", [], handler);

  db.run("DROP TABLE IF EXISTS images", [], handler);

  db.run("DROP TABLE IF EXISTS recipeCat", [], handler);

  db.run("DROP TABLE IF EXISTS recipeIng", [], handler);

  db.run(
    "CREATE TABLE recipes(id INTEGER PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, macros TEXT NOT NULL, text TEXT NOT NULL)",
    [],
    handler
  );

  db.run("CREATE TABLE ingredients(name TEXT NOT NULL)", [], handler);

  db.run("CREATE TABLE categories(name TEXT NOT NULL)", [], handler);

  db.run(
    "CREATE TABLE images(recipe_id INTEGER NOT NULL, path TEXT NOT NULL)",
    [],
    handler
  );

  db.run(
    "CREATE TABLE recipeIng(recipe_id INTEGER NOT NULL, ingredient_id INTEGER NOT NULL)",
    [],
    handler
  );

  db.run(
    "CREATE TABLE recipeCat(recipe_id INTEGER NOT NULL, category_id INTEGER NOT NULL)",
    [],
    handler
  );
});

let categories = new Promise((resolve, reject) => {
  let categoriesArr = [];

  dataRecipes.recipes.forEach((recipe) => {
    for (let i = 0; i < recipe.categories.length; i++) {
      let current = recipe.categories[i];

      if (categoriesArr.includes(current)) {
        continue;
      }
      categoriesArr.push(current);
    }
  });

  categoriesArr.forEach((i) => {
    db.run("INSERT INTO categories(name) VALUES (?)", [i], (err) => {
      if (err) {
        process.stderr.write(err);
        return;
      }
    });
  });

  new Promise((res, rej) => {
    db.all("SELECT rowid, name FROM categories", [], (err, rows) => {
      if (err) {
        rej(err);
        return;
      }

      res(rows);
    });
  })
    .then((values) => {
      let categories = {};

      values.forEach((v) => {
        categories[v.name] = v.rowid;
      });

      resolve(categories);
    })
    .catch((err) => {
      reject(err);
    });
});

const ingredients = new Promise((resolve, reject) => {
  let ingredientsArr = [];

  dataRecipes.recipes.forEach((recipe) => {
    for (let i = 0; i < recipe.ingredients.length; i++) {
      let current = recipe.ingredients[i];

      if (ingredientsArr.includes(current)) {
        continue;
      }
      ingredientsArr.push(current);
    }
  });

  ingredientsArr.forEach((i) => {
    db.run("INSERT INTO ingredients(name) VALUES (?)", [i], (err) => {
      if (err) {
        process.stderr.write(err);
        return;
      }
    });
  });

  new Promise((res, rej) => {
    db.all("SELECT rowid, name FROM ingredients", [], (err, rows) => {
      if (err) {
        rej(err);
        return;
      }

      res(rows);
    });
  })
    .then((values) => {
      let ingredients = {};

      values.forEach((v) => {
        ingredients[v.name] = v.rowid;
      });

      resolve(ingredients);
    })
    .catch((err) => {
      reject(err);
    });
});

const recipes = new Promise((resolve, reject) => {
  let promises = [];

  dataRecipes.recipes.forEach((recipe) => {
    let p = new Promise((recipeResolve, recipeReject) => {
      db.run(
        "INSERT INTO recipes(title,description,macros,text) VALUES (?,?,?,?)",
        [recipe.title, recipe.description, recipe.macros, recipe.text],
        (err) => {
          if (err) {
            recipeReject(err);
            return;
          }
        }
      );

      db.get("SELECT last_insert_rowid() as last_id", [], (err, result) => {
        if (err) {
          recipeReject(err);
          return;
        }

        recipeResolve({
          id: result.last_id,
          recipe: recipe,
        });
      });
    });

    promises.push(p);
  });

  Promise.all(promises)
    .then((values) => {
      let recipes = {};

      values.forEach((v) => {
        recipes[v.id] = v.recipe;
      });

      resolve(recipes);
    })
    .catch((err) => {
      reject(err);
    });
});

const finalize = Promise.all([categories, ingredients, recipes]).then(
  (values) => {
    const categories = values[0];
    const ingredients = values[1];
    const recipes = values[2];

    if (Object.keys(recipes).length === 0) {
      throw new Error();
    }

    if (Object.keys(categories).length === 0) {
      throw new Error();
    }

    if (Object.keys(ingredients).length === 0) {
      throw new Error();
    }

    for (let [id, recipe] of Object.entries(recipes)) {
      let path = getImagePath(recipe.images[0]);

      db.run(
        "INSERT INTO images(recipe_id, path) VALUES(?, ?)",
        [id, path],
        (err) => {
          if (err) {
            process.stderr.write(err);
            return;
          }
        }
      );

      recipe.categories.forEach((category) => {
        db.run(
          "INSERT INTO recipeCat(recipe_id, category_id) VALUES (?,?)",
          [id, categories[category]],
          (err) => {
            if (err) {
              process.stderr.write(err);
              return;
            }
          }
        );
      });

      recipe.ingredients.forEach((ingredient) => {
        db.run(
          "INSERT INTO recipeIng(recipe_id, ingredient_id) VALUES (?,?)",
          [id, ingredients[ingredient]],
          (err) => {
            if (err) {
              process.stderr.write(err);
              return;
            }
          }
        );
      });
    }
  }
);

reset
  .then(() => finalize)
  .then(() => {
    console.log("import completed");
  })
  .catch((err) => {
    process.stderr.write(err);
  })
  .finally(() => {
    db.close();
  });

function getImagePath(path) {
  let randomHex = crypto.randomBytes(10).toString("hex");
  let img = `/images/${randomHex}.png`;
  fs.copyFileSync(__dirname + path, __dirname + img);

  return img;
}
