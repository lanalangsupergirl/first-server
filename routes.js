const http = require("http");
const url = require("url");
const fs = require("fs");
// const { parse } = require("querystring");

let dataRecipes = require("./recipes.json");

const host = "localhost";
const port = 8080;
let recipes = JSON.stringify(dataRecipes);

const recipesListener = function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  const parsedReq = url.parse(req.url, true).query;

  let img = req.url.split("/").pop();

  switch (req.url) {
    case "/recipes":
      if (req.method === "POST") {
        const data = fs.readFileSync("recipes.json");
        let json = JSON.parse(data);
        console.log("data recieps length", json.recipes.length);

        let lastRecipeId = json.recipes
          .map((recipe) => recipe.id)
          .sort((a, b) => a - b)[json.recipes.length - 1];
        console.log("last", lastRecipeId);

        let idIncrement = parseInt(lastRecipeId) + 1;
        console.log("increm", idIncrement);

        let body = "";
        let response = {};
        req.on("data", (chunk) => {
          body += chunk;
          response = JSON.parse(body);

          response.id = idIncrement + "";
          console.log("resp", response);

          json.recipes.push(response);
          fs.writeFileSync("recipes.json", JSON.stringify(json));
        });
      }
      req.on("end", () => {
        recipes = fs.readFileSync("recipes.json");
        res.end(recipes);
      });

      res.end(recipes);
      break;
    case `/recipe?id=${parsedReq.id}`:
      let recipe = dataRecipes.recipes.find(
        (recipe) => recipe.id === parsedReq.id
      );
      console.log("recipe", recipe);
      res.end(JSON.stringify(recipe));
      break;
    case `/images/${img}`:
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
