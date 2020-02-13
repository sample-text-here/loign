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
const allowReset = false;

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
    db.run("DROP TABLE IF EXISTS Users");
    db.run("DROP TABLE IF EXISTS Posts");
    db.run(
      "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password Text, joined TEXT, status TEXT)"
    );
    db.run(
      "CREATE TABLE Posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, post Text, by TEXT, date TEXT, tag TEXT, votes INTEGER, comments TEXT, upers TECT, downers TEXT)"
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

app.get("/card", (req, res) => {
  res.sendFile(`${__dirname}/templates/card.html`);
});

app.get("/user", (req, res) => {
  var data = req.cookies;
  if (data.user) {
    db.get(
      "SELECT status, joined FROM Users WHERE username=?",
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
  } else res.send({});
});

app.get("/logout", (req, res) => {
  res.clearCookie("user").send({ message: "success" });
});

app.get("/post", (req, res) => {
  res.sendFile(`${__dirname}/views/post.html`);
});

app.get("/@:user", (req, res) => {
  res.sendFile(`${__dirname}/views/user.html`);
});

app.get("/~:sub", (req, res) => {
  res.sendFile(`${__dirname}/views/sub.html`);
});

app.get("/get/users/:user", (req, res) => {
  var data = {};
  data.user = req.params.user;
  db.get(
    "SELECT status, joined FROM Users WHERE username=?",
    [data.user],
    (err, row) => {
      console.log(err + "\n" + row);
      if (!err) {
        if (row) {
          data.status = row.status;
          data.joined = row.joined;
        }
        res.send(data);
      }
    }
  );
});

app.get("/get/users/", (req, res) => {
  db.all("SELECT username, status, joined FROM Users", [], (err, row) => {
    if (!err) {
      if (row) {
        res.send(row);
      }
    }
  });
});

app.get("/get/posts/:sub", (req, res) => {
  var limit = req.query.limit;
  var offset = req.query.offset;
  var user = req.query.user;
  if (!limit) {
    limit = 10;
  }
  if (!offset) {
    offset = 0;
  }
  if (!user) {
    user = "%";
  }
  var data = {};
  data.sub = req.params.sub;
  db.all(
    "SELECT * FROM Posts WHERE (tag=? AND by LIKE ?) ORDER BY id DESC LIMIT ? OFFSET ?",
    [data.sub, user, limit, offset],
    (err, row) => {
      console.log(row);
      if (!err) {
        if (row) {
          res.send(row);
        }
      }
    }
  );
});

app.get("/get/posts/", (req, res) => {
  var limit = req.query.limit;
  var offset = req.query.offset;
  var user = req.query.user;
  if (!limit) {
    limit = 10;
  }
  if (!offset) {
    offset = 0;
  }
  if (!user) {
    user = "%";
  }
  db.all(
    "SELECT * FROM Posts WHERE (by LIKE ?) ORDER BY id DESC LIMIT ? OFFSET ?",
    [user, limit, offset],
    (err, row) => {
      if (!err) {
        res.send(row);
      }
    }
  );
});

app.post("/post/submitPost", (req, res) => {
  console.log(`Submit new post ${req.body.title}`);
  if (allowWrite) {
    const title = req.body.title;
    const post = req.body.post;
    const tag = req.body.tag;
    const date = new Date();
    const by = req.cookies.user;
    if (by) {
      db.run(
        `INSERT INTO Posts (title, post, by, date, tag) VALUES (?,?,?,?,?)`,
        [title, post, by, date, tag],
        err => {
          if (err) {
            console.log(err);
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
      res.send({ message: "No user!", error: true });
    }
  }
});

app.post("/user/addUser", (req, res) => {
  console.log(`add to new user ${req.body}`);
  if (allowWrite) {
    const user = cleanseString(req.body.username);
    const pass = req.body.password;
    const joined = new Date();
    console.log("Add user: " + user + "@" + pass);
    db.get(
      `SELECT username FROM Users WHERE username=?`,
      [user],
      (error, row) => {
        console.log(row);
        if (!row) {
          db.run(
            `INSERT INTO Users (username, password, joined) VALUES (?,?, ?)`,
            [user, pass, joined],
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

app.get("/reset", (req, res) => {
  if (allowReset) {
    db.serialize(() => {
      db.run("DROP TABLE IF EXISTS Users");
      db.run("DROP TABLE IF EXISTS Posts");
      db.run(
        "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password Text, joined TEXT, status TEXT)"
      );
      db.run(
        "CREATE TABLE Posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, post Text, by TEXT, date TEXT, tag TEXT, votes INTEGER, comments TEXT, upers TECT, downers TEXT)"
      );
      db.run(
        "CREATE TABLE Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT expires TEXT)"
      );

      console.log("RESET!");
    });
  }
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

app.use(function(req, res) {
  res.status(404).send("404!");
});

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
