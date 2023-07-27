import express from "express";
import {
  login,
  currentCurrencies,
  convertCurrency,
  historicalConversion,
} from "../controllers/controllers.js";

import auth from "../middleware/middleware.js";
const app = express.Router();

app.get("/currencies", auth, currentCurrencies);
app.get("/latest/:base", auth, convertCurrency);
app.get("/historical/:date", auth, historicalConversion);
app.post("/login", login);

export default app;
