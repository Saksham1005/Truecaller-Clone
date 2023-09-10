const express = require("express");
const { sequelize } = require("./models");
require("dotenv").config();

const port = process.env.PORT;

const app = express();

const app_routes = require("./routes");

app.use(express.json());
app.use(app_routes);

app.listen({ port }, async () => {
  console.log("Server running on port " + port);
  await sequelize.authenticate();
  console.log("Database Connected Successfully!");
});
