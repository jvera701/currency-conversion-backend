import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import configure from "../config/index.js";
import db from "../database/database.js";
import axios from "axios";

const API = axios.create({
  baseURL: configure.apiUrl,
  timeout: 5000,
  timeoutErrorMessage: "Timeout error",
});

const historicalConversion = async (req, res) => {
  try {
    const { date, times } = req.params;
    const { base } = req.query;
    const config = {
      params: {
        app_id: configure.exchangeId,
        base: base,
      },
    };

    let arr = [];
    const now = new Date(date);
    for (let i = 0; i < times; i++) {
      const month = now.getMonth() - i;
      const prev1 = i === 0 ? now : new Date(now.getFullYear(), month, 15);
      const dateString = prev1.toISOString().split("T")[0];
      const response = await API.get(`/historical/${dateString}.json`, config);
      const monthString = new Intl.DateTimeFormat("en-US", {
        month: "long",
      }).format(prev1);
      const obj = {
        [monthString]: response.data.rates,
      };
      arr.unshift(obj);
    }

    res.status(200).json(arr);
  } catch (e) {
    res.status(500).json({ error: "Error" });
  }
};

const convertCurrency = async (req, res) => {
  try {
    const { base } = req.query;
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
    const stmt = db.prepare("SELECT id, password FROM Users WHERE email = ?");
    stmt.get(email, function (err, rows) {
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
