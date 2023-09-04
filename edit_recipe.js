import { db, errorHandler } from "./utils.js";

export async function editRecipe(original, edited) {
  return new Promise((resolve, reject) => {
    let updatedFieldsRecipe = {};
    let ingredientsArr = [];
    let categoriesArr = [];

    if (
      edited.title.length === 0 ||
      edited.macros.length === 0 ||
      edited.text.length === 0 ||
      edited.ingredients.length === 0 ||
      edited.categories.length === 0
    ) {
      reject();
    }

    if (original.title !== edited.title) {
      updatedFieldsRecipe["title"] = edited.title;
    }

    if (original.description !== edited.description) {
      updatedFieldsRecipe["description"] = edited.description;
    }

    if (original.macros !== edited.macros) {
      updatedFieldsRecipe["macros"] = edited.macros;
    }

    if (original.text !== edited.text) {
      updatedFieldsRecipe["text"] = edited.text;
    }

    ingredientsArr = edited.ingredients;

    categoriesArr = edited.categories;

    console.log("updatedFieldsRecipe", updatedFieldsRecipe);

    let query = "";
    let values = [];
    let queries = [];
    if (!Object.keys(updatedFieldsRecipe).length) {
      reject();
      return;
    }

    for (let column in updatedFieldsRecipe) {
      query = "UPDATE recipes SET ";

      queries.push(column + " = ?");

      values.push(updatedFieldsRecipe[column]);
    }

    query += queries.join(", ") + " WHERE id = " + edited.id;

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

    resolve(data);
  })
    .then((data) => {
      console.log("data", data);
      db.run(
        "DELETE FROM recipeCat WHERE recipe_id = ?",
        [data.id],
        errorHandler
      );

      db.run(
        "DELETE FROM recipeIng WHERE recipe_id = ?",
        [data.id],
        errorHandler
      );

      db.run(data.query, data.values, errorHandler);

      data.categories.forEach((category) => {
        db.get(
          "SELECT rowid, * FROM categories WHERE name = ?",
          [category],
          (err, result) => {
            if (err) {
              console.log(err);
              return;
            }

            db.run(
              "INSERT INTO recipeCat(recipe_id, category_id) VALUES (?, ?)",
              [data.id, result.rowid],
              errorHandler
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
              console.log(err);
              return;
            }

            db.run(
              "INSERT INTO recipeIng(recipe_id, ingredient_id) VALUES (?, ?)",
              [data.id, result.rowid],
              errorHandler
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
