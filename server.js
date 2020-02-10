// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const Cookies = require("cookie-parser");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const allowWrite = true;
const allowReset = true;

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(Cookies());

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    db.run("DROP TABLE Users");
    db.run(
      "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password Text, status TEXT)"
    );
    console.log("it is done");
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/signup", (req, res) => {
  res.sendFile(`${__dirname}/views/signup.html`);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/login", (req, res) => {
  res.sendFile(`${__dirname}/views/login.html`);
});

app.get("/edit", (req, res) => {
  res.sendFile(`${__dirname}/views/edit.html`);
});

app.get("/user", (req, res) => {
  var data = req.cookies;
  db.get(
    "SELECT status FROM Users WHERE username=?",
    [data.user],
    (err, row) => {
      if (!err) {
        if (row) {
          data.status = row.status;
        }
        res.send(data);
      }
    }
  );
});

app.get("/logout", (req, res) => {
  res.clearCookie("user").send({ message: "success" });
});

app.get('/u/:user', (req, res) => {
    res.sendFile(`${__dirname}/views/user.html`);
});

app.get("/get/:user", (req, res) => {
  var data = {};
  data.user = req.params.user;
  db.get(
    "SELECT status FROM Users WHERE username=?",
    [data.user],
    (err, row) => {
      if (!err) {
        if (row) {
          data.status = row.status;
        }
        res.send(data);
      }
    }
  );
});

app.post("/user/addUser", (req, res) => {
  console.log(`add to new user ${req.body}`);
  if (allowWrite) {
    const user = cleanseString(req.body.username);
    const pass = req.body.password;
    console.log("Add user: " + user + "@" + pass);
    db.get(
      `SELECT username FROM Users WHERE username=?`,
      [user],
      (error, row) => {
        console.log(row);
        if (!row) {
          db.run(
            `INSERT INTO Users (username, password) VALUES (?,?)`,
            [user, pass],
            error => {
              if (error) {
                console.log("error!");
                res.send({
                  message: "Something happened, please try again",
                  error: true
                });
              } else {
                console.log("success");
                res
                  .cookie("user", user, { maxAge: 600000 })
                  .send({ message: "success", error: false });
              }
            }
          );
        } else {
          console.log("User already exists!");
          res.send({ message: "User already exists!", error: true });
        }
      }
    );
  }
});

app.post("/user/login", (req, res) => {
  const user = cleanseString(req.body.username);
  const pass = cleanseString(req.body.password);
  console.log("Login user: " + user + "@" + pass);
  db.get(
    `SELECT username FROM Users WHERE username=?`,
    [user],
    (error, row) => {
      if (row) {
        db.get(
          `SELECT password FROM Users WHERE username=?`,
          [user],
          (err, row) => {
            if (err) {
              console.log("error!");
              res.send({
                message: "Something happened, please try again",
                error: true
              });
            } else {
              if (row.password == pass) {
                console.log("success");
                res
                  .cookie("user", user, { maxAge: 600000 })
                  .send({ message: "success", error: false });
              } else {
                console.log("incorrect password");
                res.send({ message: "Incorrect password", error: true });
              }
            }
          }
        );
      } else {
        console.log("user does not exist");
        res.send({ message: "User does not exist", error: true });
      }
    }
  );
});

app.post("/user/deleteUser", (req, res) => {
  if (allowWrite) {
    const user = req.cookies.user;
    console.log("Delete user: " + user);
    if (user) {
      db.get(
        `SELECT username FROM Users WHERE username=?`,
        [user],
        (error, row) => {
          if (row) {
            db.run(`DELETE FROM Users WHERE username=?`, [user], err => {
              if (err) {
                console.log("error!");
                res.send({
                  message: "Something happened, please try again",
                  error: true
                });
              } else {
                console.log("success");
                res.send({ message: "success", error: false });
              }
            });
          } else {
            console.log("user does not exist");
            res.send({ message: "User does not exist", error: true });
          }
        }
      );
    } else {
      console.log("no signed in user");
      res.send({ message: "No signed in user", error: true });
    }
  }
});

app.post("/user/updatePass", (req, res) => {
  if (allowWrite) {
    const user = req.cookies.user;
    const oldpass = req.body.oldpass;
    const newpass = req.body.newpass;
    console.log("Update user password: " + user + " to " + newpass);
    if (user) {
      db.get(
        `SELECT username FROM Users WHERE username=?`,
        [user],
        (error, row) => {
          if (row) {
            db.get(
              `SELECT password FROM Users WHERE username=?`,
              [user],
              (error, row) => {
                if (row.password == oldpass) {
                  db.run(
                    `UPDATE Users SET password=? WHERE username=?`,
                    [newpass, user],
                    err => {
                      if (err) {
                        console.log("error!");
                        res.send({
                          message: "Something happened, please try again",
                          error: true
                        });
                      } else {
                        console.log("success");
                        res.send({ message: "success", error: false });
                      }
                    }
                  );
                } else {
                  res.send({
                    message: "Incorrect password",
                    error: true
                  });
                }
              }
            );
          } else {
            console.log("user does not exist");
            res.send({ message: "User does not exist", error: true });
          }
        }
      );
    } else {
      console.log("no signed in user");
      res.send({ message: "No signed in user", error: true });
    }
  }
});

app.post("/user/updateStatus", (req, res) => {
  if (allowWrite) {
    const user = req.cookies.user;
    // const status = cleanseString(req.body.status);
    const status = req.body.status;
    console.log("Update user status: " + user + " to " + status);
    if (user) {
      db.get(
        `SELECT username FROM Users WHERE username=?`,
        [user],
        (error, row) => {
          if (row) {
            db.run(
              `UPDATE Users SET status=? WHERE username=?`,
              [status, user],
              err => {
                if (err) {
                  console.log("error!");
                  res.send({
                    message: "Something happened, please try again",
                    error: true
                  });
                } else {
                  console.log("success");
                  res.send({ message: "success", error: false });
                }
              }
            );
          } else {
            console.log("user does not exist");
            res.send({ message: "User does not exist", error: true });
          }
        }
      );
    } else {
      console.log("no signed in user");
      res.send({ message: "No signed in user", error: true });
    }
  }
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string
      .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
