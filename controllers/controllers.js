import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import configure from "../config/index.js";
import db from "../database/database.js";
import axios from "axios";

const API = axios.create({
  baseURL: "https://openexchangerates.org/api/",
  timeout: 5000,
  timeoutErrorMessage: "Timeout error",
});

const historicalConversion = async (req, res) => {
  try {
    const { date } = req.params;
    const { symbol, base } = req.body;
    const config = {
      params: {
        app_id: configure.exchangeId,
        symbols: symbol,
        base: base,
      },
    };
    const response = await API.get(`/historical/${date}.json`, config);
    res.status(200).json({ rates: response.data.rates });
  } catch (e) {
    res.status(500).json({ error: "Error" });
  }
};

const convertCurrency = async (req, res) => {
  try {
    const { base } = req.body;
    const config = {
      params: {
        app_id: configure.exchangeId,
        base: base,
      },
    };
    const response = await API.get("/latest.json", config);
    res.status(200).json({ rates: response.data.rates });
  } catch (e) {
    res.status(500).json({ error: "Error" });
  }
};

const currentCurrencies = async (_, res) => {
  try {
    const response = await API.get("/currencies.json");
    res.status(200).json(response.data);
  } catch (e) {
    res.status(500).json({ error: "Error" });
  }
};

const login = (req, res, next) => {
  try {
    const { email, password } = req.body;
    let query = `SELECT id, password FROM Users WHERE email = "${email}"`;
    db.get(query, function (err, rows) {
      if (err) {
        throw err;
      }
      if (!rows) {
        res
          .status(401)
          .json({ error: "Invalid credentials, please try again" });
        return;
      }

      const id = rows.id;
      const hashedPassword = rows.password;
      bcrypt.compare(password, hashedPassword, function (err2, result) {
        if (err2) {
          throw err2;
        }
        if (result) {
          const token = jwt.sign({ id: id }, configure.jwtKey);
          res.status(200).json({ token });
        } else {
          res
            .status(401)
            .json({ error: "Invalid credentials, please try again" });
        }
      });
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export { login, currentCurrencies, convertCurrency, historicalConversion };
