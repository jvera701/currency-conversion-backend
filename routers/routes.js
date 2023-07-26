import express from "express";
import { hello, login, register } from "../controllers/controllers.js";
import auth from "../middleware/middleware.js";
const app = express.Router();

app.get("/", hello);
app.post("/login", login);
app.post("/register", register);

export default app;
