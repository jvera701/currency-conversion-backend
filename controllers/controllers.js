import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.db");

const hello = (req, res, next) => {
  res.status(200).json({ ss: "hello world" });
};

const register = (req, res, next) => {
  try {
    const { email, password } = req.body;
    // check if user exists
    bcrypt.hash(password, 10, async function (error, hash) {
      if (error) {
        throw error;
      }

      db.run("INSERT INTO Users(email, password) VALUES (?, ?)", [email, hash]);
      res.status(200).json("User successfully created");
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const login = (req, res, next) => {
  try {
    const { email, password } = req.body;
    let query = `SELECT password FROM Users WHERE email = "${email}"`;
    db.all(query, function (err, rows) {
      if (err) {
        console.error(err);
      } else {
        if (rows.length === 0) {
          res
            .status(401)
            .json({ error: "Invalid credentials, please try again" });
        } else {
          const hashedPassword = rows[0].password;
          bcrypt.compare(password, hashedPassword, function (err2, result) {
            if (err2) {
              console.error(err2);
            } else {
              if (result) {
                res.status(200).json("User logged in");
              } else {
                res
                  .status(401)
                  .json({ error: "Invalid credentials, please try again" });
              }
            }
          });
        }
      }
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export { hello, login, register };
