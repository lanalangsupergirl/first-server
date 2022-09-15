const http = require("http");
const dataRecipes = require("./recipes.json");

const host = "localhost";
const port = 8080;
const recipes = JSON.stringify(dataRecipes);

const recipesListener = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/recipes") {
    res.end(recipes);
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Resource not found" }));
  }
};

const server = http.createServer(recipesListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
