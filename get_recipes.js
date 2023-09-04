import { db } from "./utils.js";

export function getRecipes() {
  return new Promise((resolve) => {

    let recipes = new Promise((resolve, reject) => {
      db.all("SELECT * FROM recipes", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });

    let ingredients = new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM recipeIng ri LEFT JOIN ingredients i on i.rowid = ri.ingredient_id",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });

    let categories = new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM recipeCat rc LEFT JOIN categories c on c.rowid = rc.category_id",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });

    let images = new Promise((resolve, reject) => {
      db.all("SELECT * FROM images", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });

    Promise.all([recipes, categories, ingredients, images])
      .then((values) => {
        const recipes = values[0];
        const categories = values[1];
        const ingredients = values[2];
        const images = values[3];

        if (Object.keys(recipes).length === 0) {
          throw new Error();
        }

        if (Object.keys(categories).length === 0) {
          throw new Error();
        }

        if (Object.keys(ingredients).length === 0) {
          throw new Error();
        }

        if (Object.keys(images).length === 0) {
          throw new Error();
        }

        recipes.forEach((recipe) => {
          for (let image of images) {
            if (recipe.id == image.recipe_id) {
              recipe.path = image.path;
            }
          }

          let categoriesArr = [];

          for (let category of categories) {
            if (recipe.id == category.recipe_id) {
              categoriesArr.push(category.name);
            }
          }

          recipe.categories = categoriesArr;

          let ingredientsArr = [];

          for (let ingredient of ingredients) {
            if (recipe.id === ingredient.recipe_id) {
              ingredientsArr.push(ingredient.name);
            }
          }

          recipe.ingredients = ingredientsArr;
        });

        resolve(recipes);

      })
      .catch((err) => {
        console.log(err);
      });
  });
}
