const http = require("http");
const url = require("url");
const fs = require("fs");
//const fs = require("fs").promises;
const dataRecipes = require("./recipes.json");

const host = "localhost";
const port = 8080;
const recipes = JSON.stringify(dataRecipes);

const recipesListener = function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const parsedReq = url.parse(req.url, true).query;
  console.log("parsedReq", parsedReq);

  switch (req.url) {
    case "/recipes":
      res.end(recipes);
      break;
    case `/recipe?id=${parsedReq.id}`:
      let recipe = dataRecipes.recipes.find(
        (recipe) => recipe.id === parsedReq.id
      );
      console.log("recipe", recipe);
      res.end(JSON.stringify(recipe));
      break;
    case "/images/img1_1.png":
      const data = fs.readFileSync(__dirname + req.url);
      res.setHeader("Content-Type", "image/png");
      res.end(data);
      // fs.readFile(__dirname + req.url).then(contents => {
      //   res.setHeader("Content-Type", "image/png");
      //   res.end(contents);
      // })
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
