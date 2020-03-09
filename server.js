// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const Cookies = require("cookie-parser");
const favicon = require("express-favicon");
const fileUpload = require("express-fileupload");
const Jimp = require("jimp");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(bodyParser.json());

let rawdata = fs.readFileSync('hconfig.json');
let parseddata = JSON.parse(rawdata);
console.log(parseddata);
const allowRead = parseddata.allowRead;
const allowWrite = parseddata.allowWrite;
const allowReset = parseddata.allowReset;

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(favicon(`${__dirname}/public/favicon.ico`));
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
      "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password Text, joined TEXT, status TEXT, like TEXT, bad TEXT, pic TEXT)"
    );
    db.run(
      "CREATE TABLE Posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, post Text, by TEXT, date TEXT, tag TEXT, votes INTEGER, comments TEXT)"
    );
    db.run(
      "CREATE TABLE Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT expires TEXT)"
    );
    console.log("it is done");
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/conf.json", (req, res) => {
  res.sendFile(`${__dirname}/hconfig.json`);
});

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/test", (req, res) => {
  res.sendFile(`${__dirname}/views/test.html`);
});

app.get("/signup", (req, res) => {
  res.sendFile(`${__dirname}/views/signup.html`);
});

app.get("/login", (req, res) => {
  res.sendFile(`${__dirname}/views/login.html`);
});

app.get("/edit", (req, res) => {
  res.sendFile(`${__dirname}/views/edit.html`);
});

app.get("/t/card", (req, res) => {
  res.sendFile(`${__dirname}/templates/card.html`);
});

app.get("/t/comment", (req, res) => {
  res.sendFile(`${__dirname}/templates/comment.html`);
});

app.get("/user", (req, res) => {
  var data = req.cookies;
  if (data.user&&allowRead) {
    db.get(
      "SELECT status, joined, like, bad FROM Users WHERE username=?",
      [data.user],
      (err, row) => {
        if (!err) {
          if (row) {
            data.status = row.status;
            data.like = row.like;
            data.bad = row.bad;
          }
          if (data.like == null) {
            data.like = "[]";
          }
          if (data.bad == null) {
            data.bad = "[]";
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
  res.sendFile(`${__dirname}/views/new.html`);
});

app.get("/get/null", (req, res) => {
  res.sendFile(`${__dirname}/assets/null.png`);
});

app.get("/@:user", (req, res) => {
  res.sendFile(`${__dirname}/views/user.html`);
});

app.get("/~:sub", (req, res) => {
  res.sendFile(`${__dirname}/views/sub.html`);
});

app.get("/-:post", (req, res) => {
  res.sendFile(`${__dirname}/views/post.html`);
});

app.get("/assets/meme.png", (req, res) => {
  res.sendFile(`${__dirname}/assets/meme.png`);
});

app.get("/get/user/:user", (req, res) => {
  var data = {};
  data.user = req.params.user;
  if(!allowRead){
  db.get(
    "SELECT status, joined FROM Users WHERE username=?",
    [data.user],
    (err, row) => {
      if (!err) {
        if (row) {
          data.status = row.status;
          data.joined = row.joined;
        }
        res.send(data);
      }
    }
  );}
});

app.get("/get/userpic/:user", (req, res) => {
  const user = req.params.user;
  db.get("SELECT * FROM Users WHERE username=?", [user], (err, row) => {
    if (!err && row &&allowRead) {
      if (row.pic) {
        res.sendFile(`${__dirname}/assets/users/${user}.${row.pic}`);
      } else {
        res.sendFile(`${__dirname}/assets/null.png`);
      }
    } else {
      res.sendFile(`${__dirname}/assets/null.png`);
    }
  });
});

app.get("/get/users/", (req, res) => {
  db.all("SELECT username, status, joined FROM Users", [], (err, row) => {
    if (!err) {
      if (row&&allowRead) {
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
      if (!err) {
        if (row&&allowRead) {
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
      if (!err&&allowRead) {
        res.send(row);
      }
    }
  );
});
app.get("/get/post/:id", (req, res) => {
  db.get("SELECT * FROM Posts WHERE id=?", [req.params.id], (err, row) => {
    if (!err&&allowRead) {
      res.send(row);
    }
  });
});

app.post("/post/submitPost", (req, res) => {
  console.log(`Submit new post ${req.body.title}`);
  if (allowWrite) {
    if (!req.cookies.posted) {
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
              res
                .cookie("posted", true, { maxAge: 60000 })
                .send({ message: "success", error: false });
            }
          }
        );
      } else {
        res.send({ message: "No user!", error: true });
      }
    } else {
      res.send({ message: "Too many posts!", error: true });
    }
  }
});

app.post("/post/comment", (req, res) => {
  var data = {
    comment: req.body.comment,
    id: req.body.id,
    by: req.cookies.user,
    date: new Date()
  };
  if (req.cookies.user && allowWrite) {
    db.get("SELECT (comments) FROM Posts WHERE id=?", [data.id], (err, row) => {
      if (!err) {
        console.log(row);
        if (row.comments == null) {
          console.log("first");
          db.run("UPDATE Posts SET comments=? WHERE id=?", [
            "[" + JSON.stringify(data) + "]",
            data.id
          ]);
        } else {
          var com = JSON.parse(row.comments);
          com.push(data);
          console.log(com);
          db.run("UPDATE Posts SET comments=? WHERE id=?", [
            JSON.stringify(com),
            data.id
          ]);
          console.log(data);
        }
      } else {
        console.log(err);
      }
    });
  }
  res.send("hi");
});

app.post("/post/vote/:wat", (req, res) => {
  var which = req.params.wat;
  var id = req.body.id;
  var user = req.cookies.user;
  var select;
  if (which == "up") {
    select = 1;
  } else {
    select = -1;
  }
  if (req.cookies.user && allowWrite) {
    db.get("SELECT * FROM Posts WHERE id=?", [id], (err, row) => {
      if (!err) {
        if (which == "up") {
          var opt = "like";
          var add = "+1";
        } else {
          var opt = "bad";
          var add = "-1";
        }
        db.get("SELECT like FROM Users", (err, like) => {
          db.get("SELECT bad FROM Users", (err, bad) => {
            if (!err) {
              var out;
              if (opt == "like") {
                out = JSON.parse(like.like);
              } else {
                out = JSON.parse(bad.bad);
              }
              if (out == null) {
                let tmp = [];
                tmp.push(id);
                tmp = JSON.stringify(tmp);
                db.run(
                  `UPDATE Users SET ${opt}=? WHERE username=?`,
                  [tmp, user],
                  err => {
                    if (err) {
                      res.send({ error: true });
                    }
                  }
                );
                db.run(
                  `UPDATE Posts SET votes=0${add} WHERE id=?`,
                  [id],
                  err => {
                    if (err) {
                      res.send({ error: true });
                    }
                  }
                );
              } else {
                var tmp = out;
                if (out.indexOf(id) == -1) {
                  tmp.push(id);
                  db.run(
                    `UPDATE Posts SET votes=votes${add} WHERE id=?`,
                    [id],
                    err => {
                      if (err) {
                        res.send({ error: true });
                      }
                    }
                  );
                } else {
                  select = 0;
                  tmp.splice(tmp.indexOf(id), 1);
                  if (add == "+1") {
                    add = "-1";
                  } else {
                    add = "+1";
                  }
                  db.run(
                    `UPDATE Posts SET votes=votes${add} WHERE id=?`,
                    [id],
                    err => {
                      if (err) {
                        res.send({ error: true });
                      }
                    }
                  );
                }
                tmp = JSON.stringify(tmp);
                db.run(
                  `UPDATE Users SET ${opt}=? WHERE username=?`,
                  [tmp, user],
                  err => {
                    if (err) {
                      res.send({ error: true });
                    }
                  }
                );
              }
              if (opt == "like") {
                if (bad.bad != null) {
                  var tmp = JSON.parse(bad.bad);
                  if (tmp.indexOf(id) != -1) {
                    db.run(
                      `UPDATE Users SET bad=? WHERE username=?`,
                      [tmp.splice(tmp, 1), user],
                      err => {
                        if (err) {
                          res.send({ error: true });
                        }
                      }
                    );
                  }
                }
              } else {
                if (like.like != null) {
                  var tmp = JSON.parse(like.like);
                  if (tmp.indexOf(id) != -1) {
                    db.run(
                      `UPDATE Users SET like=? WHERE username=?`,
                      [tmp.splice(tmp, 1), user],
                      err => {
                        if (err) {
                          res.send({ error: true });
                        }
                      }
                    );
                  }
                }
              }
              db.get("SELECT votes FROM Posts WHERE id=?", [id], (err, row) => {
                if (!err) {
                  res.send({ error: false, votes: row.votes, select: select });
                } else {
                  res.send({ error: true });
                }
              });
            } else {
              res.send({ error: true });
            }
          });
        });
      } else {
        res.send({ error: true });
      }
    });
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
                  .cookie("user", user, { maxAge: 3600000 })
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
      if (row&&allowRead) {
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
                  .cookie("user", user, { maxAge: 3600000 })
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

app.post("/edit/photo", (req, res) => {
  if (allowWrite) {
    const user = req.cookies.user;

    if (user) {
      if (!req.files || Object.keys(req.files).length === 0) {
        console.log("error");
        console.log(req.files);
        return res.status(400).send("No files were uploaded.");
      }
      db.get(
        "SELECT pic FROM Users WHERE username=?",
        [user],
        (err, oldrow) => {
          if (oldrow.pic != null) {
            fs.unlinkSync(`assets/users/${user}.${oldrow.pic}`);
          }

          var pic = req.files.pic;
          var type = pic.mimetype.split("/")[1];

          pic.mv(`assets/users/${user}.${type}`, function(err) {
            if (err) return res.status(500).send(err);
            db.run(
              "UPDATE Users SET pic=? WHERE username=?",
              [type, user],
              err => {
                if (!err) {
                  res.send("File uploaded!");
                } else {
                  res.send(err);
                }
              }
            );
            /*Jimp.read(`assets/users/${user}.${type}`, (err, pic) => {
              if (err) throw err;
              pic.cover(128, 128).write(`assets/users/${user}.${type}`);
            });*/
          });
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
        "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password Text, joined TEXT, status TEXT, like TEXT, bad TEXT, pic TEXT)"
      );
      db.run(
        "CREATE TABLE Posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, post Text, by TEXT, date TEXT, tag TEXT, votes INTEGER, comments TEXT)"
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
  res.status(404).sendFile(`${__dirname}/views/404.html`);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});