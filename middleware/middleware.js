import jwt from "jsonwebtoken";
import db from "../database/database.js";
import configure from "../config/index.js";

const auth = async (req, res, next) => {
  try {
    const token = req.get("Authorization");
    const data = jwt.verify(token, configure.jwtKey);
    const id = data.id;
    let query = `SELECT * FROM Users WHERE id = ${id}`;
    db.all(query, function (err, rows) {
      if (err) {
        throw err;
      }
      if (rows.length === 1) {
        next();
      } else {
        res.status(401).json({ error: "User not found" });
        return;
      }
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      res.status(401).json({ error: "User not found" });
      return;
    }
    next(err);
  }
};

export default auth;
