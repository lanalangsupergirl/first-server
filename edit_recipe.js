import sqlite3 from "sqlite3";
import { openDb } from "./utils.js";

let db = openDb(sqlite3, "./recipes.db");

export async function editRecipe(original, edited) {
  new Promise((resolve, reject) => {
    let updatedFieldsRecipe = {};
    let ingredientsArr = [];
    let categoriesArr = [];

    original.forEach((recipe) => {
      if (
        edited.title === "" ||
        edited.macros === "" ||
        edited.text === "" ||
        recipe.ingredients === [] ||
        recipe.categories === []
      ) {
        reject();
      }

      if (recipe.title !== edited.title) {
        updatedFieldsRecipe["title"] = edited.title;
      }

      if (recipe.description !== edited.description) {
        updatedFieldsRecipe["description"] = edited.description;
      }

      if (recipe.macros !== edited.macros) {
        updatedFieldsRecipe["macros"] = edited.macros;
      }

      if (recipe.text !== edited.text) {
        updatedFieldsRecipe["text"] = edited.text;
      }

      ingredientsArr = recipe.ingredients;

      categoriesArr = recipe.categories;
    });

    console.log("updatedFieldsRecipe", updatedFieldsRecipe);

    let query = "";
    let values = [];

    if (!Object.keys(updatedFieldsRecipe).length) {
      reject();
    } else {
      query = "UPDATE recipes SET ";
      let queries = [];

      for (let column in updatedFieldsRecipe) {
        queries.push(column + " = ?");

        values.push(updatedFieldsRecipe[column]);
      }

      query += queries.join(", ") + " WHERE id = " + edited.id;
    }

    // if (Object.keys(updatedFieldsRecipe).length) {
    //   query = "UPDATE recipes SET";

    //   for (let column in updatedFieldsRecipe) {
    //     if (updatedFieldsRecipe[column] !== "") {
    //       query += " " + column + "= ?,";

    //       values.push(updatedFieldsRecipe[column]);

    //       query = query.substring(0, query.length - 1);
    //     }
    //   }

    //   query += " WHERE id = " + edited.id;
    // } else {
    //   reject();
    // }

    console.log("query", query);

    let data = {
      query: query,
      values: values,
      ingredients: ingredientsArr,
      categories: categoriesArr,
      id: edited.id,
    };

    if (query !== "") {
      resolve(data);
    }
  })
    .then((data) => {
      console.log("data", data);
        db.run("DELETE FROM recipeCat WHERE recipe_id = ?", [data.id], (err) => {
          if (err) {
            process.stderr.write(err);
            return;
          }
        });

        db.run("DELETE FROM recipeIng WHERE recipe_id = ?", [data.id], (err) => {
          if (err) {
            process.stderr.write(err);
            return;
          }
        });

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
        console.log(err);
        return;
      }
    });
}
