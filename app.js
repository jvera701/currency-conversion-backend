import express from "express";
import cors from "cors";
import "dotenv/config";
import configure from "./config/index.js";
import routes from "./routers/routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.listen(configure.port, () => {
  console.log(`Example app listening on port ${configure.port}`);
});
