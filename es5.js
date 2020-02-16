"use strict";

// server.js
// where your node app starts

// init project
var express = require("express");
var bodyParser = require("body-parser");
var Cookies = require("cookie-parser");
var favicon = require("express-favicon");
var app = express();
var fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var allowWrite = true;
var allowReset = false;

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(Cookies());

// init sqlite db
var dbFile = "./.data/sqlite.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function () {
  if (!exists) {
    db.run("DROP TABLE IF EXISTS Users");
    db.run("DROP TABLE IF EXISTS Posts");
    db.run("CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password Text, joined TEXT, status TEXT, like TEXT, bad TEXT, profilepic BLOB)");
    db.run("CREATE TABLE Posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, post Text, by TEXT, date TEXT, tag TEXT, votes INTEGER, comments TEXT)");
    db.run("CREATE TABLE Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT expires TEXT)");
    console.log("it is done");
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/test", function (req, res) {
  db.run("ALTER TABLE Users ADD profilepic BLOB");
  res.sendFile(__dirname + "/views/test.html");
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/views/signup.html");
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/views/login.html");
});

app.get("/edit", function (req, res) {
  res.sendFile(__dirname + "/views/edit.html");
});

app.get("/t/card", function (req, res) {
  res.sendFile(__dirname + "/templates/card.html");
});

app.get("/t/comment", function (req, res) {
  res.sendFile(__dirname + "/templates/comment.html");
});

app.get("/user", function (req, res) {
  var data = req.cookies;
  if (data.user) {
    db.get("SELECT status, joined, like, bad FROM Users WHERE username=?", [data.user], function (err, row) {
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
    });
  } else res.send({});
});

app.get("/logout", function (req, res) {
  res.clearCookie("user").send({ message: "success" });
});

app.get("/post", function (req, res) {
  res.sendFile(__dirname + "/views/new.html");
});

app.get("/@:user", function (req, res) {
  res.sendFile(__dirname + "/views/user.html");
});

app.get("/~:sub", function (req, res) {
  res.sendFile(__dirname + "/views/sub.html");
});

app.get("/-:post", function (req, res) {
  res.sendFile(__dirname + "/views/post.html");
});

app.get("/get/users/:user", function (req, res) {
  var data = {};
  data.user = req.params.user;
  db.get("SELECT status, joined FROM Users WHERE username=?", [data.user], function (err, row) {
    if (!err) {
      if (row) {
        data.status = row.status;
        data.joined = row.joined;
      }
      res.send(data);
    }
  });
});

app.get("/get/users/", function (req, res) {
  db.all("SELECT username, status, joined FROM Users", [], function (err, row) {
    if (!err) {
      if (row) {
        res.send(row);
      }
    }
  });
});

app.get("/get/posts/:sub", function (req, res) {
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
  db.all("SELECT * FROM Posts WHERE (tag=? AND by LIKE ?) ORDER BY id DESC LIMIT ? OFFSET ?", [data.sub, user, limit, offset], function (err, row) {
    if (!err) {
      if (row) {
        res.send(row);
      }
    }
  });
});

app.get("/get/posts/", function (req, res) {
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
  db.all("SELECT * FROM Posts WHERE (by LIKE ?) ORDER BY id DESC LIMIT ? OFFSET ?", [user, limit, offset], function (err, row) {
    if (!err) {
      res.send(row);
    }
  });
});
app.get("/get/post/:id", function (req, res) {
  db.get("SELECT * FROM Posts WHERE id=?", [req.params.id], function (err, row) {
    if (!err) {
      res.send(row);
    }
  });
});

app.post("/post/submitPost", function (req, res) {
  console.log("Submit new post " + req.body.title);
  if (allowWrite) {
    if (!req.cookies.posted) {
      var title = req.body.title;
      var post = req.body.post;
      var tag = req.body.tag;
      var date = new Date();
      var by = req.cookies.user;
      if (by) {
        db.run("INSERT INTO Posts (title, post, by, date, tag) VALUES (?,?,?,?,?)", [title, post, by, date, tag], function (err) {
          if (err) {
            console.log(err);
            console.log("error!");
            res.send({
              message: "Something happened, please try again",
              error: true
            });
          } else {
            console.log("success");
            res.cookie("posted", true, { maxAge: 60000 }).send({ message: "success", error: false });
          }
        });
      } else {
        res.send({ message: "No user!", error: true });
      }
    } else {
      res.send({ message: "Too many posts!", error: true });
    }
  }
});

app.post("/post/comment", function (req, res) {
  var data = {
    comment: req.body.comment,
    id: req.body.id,
    by: req.cookies.user,
    date: new Date()
  };
  if (req.cookies.user && allowWrite) {
    db.get("SELECT (comments) FROM Posts WHERE id=?", [data.id], function (err, row) {
      if (!err) {
        console.log(row);
        if (row.comments == null) {
          console.log("first");
          db.run("UPDATE Posts SET comments=? WHERE id=?", ["[" + JSON.stringify(data) + "]", data.id]);
        } else {
          var com = JSON.parse(row.comments);
          com.push(data);
          console.log(com);
          db.run("UPDATE Posts SET comments=? WHERE id=?", [JSON.stringify(com), data.id]);
          console.log(data);
        }
      } else {
        console.log(err);
      }
    });
  }
  res.send("hi");
});

app.post("/post/vote/:wat", function (req, res) {
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
    db.get("SELECT * FROM Posts WHERE id=?", [id], function (err, row) {
      if (!err) {
        if (which == "up") {
          var opt = "like";
          var add = "+1";
        } else {
          var opt = "bad";
          var add = "-1";
        }
        db.get("SELECT like FROM Users", function (err, like) {
          db.get("SELECT bad FROM Users", function (err, bad) {
            if (!err) {
              var out;
              if (opt == "like") {
                out = JSON.parse(like.like);
              } else {
                out = JSON.parse(bad.bad);
              }
              if (out == null) {
                var _tmp = [];
                _tmp.push(id);
                _tmp = JSON.stringify(_tmp);
                db.run("UPDATE Users SET " + opt + "=? WHERE username=?", [_tmp, user], function (err) {
                  if (err) {
                    res.send({ error: true });
                  }
                });
                db.run("UPDATE Posts SET votes=0" + add + " WHERE id=?", [id], function (err) {
                  if (err) {
                    res.send({ error: true });
                  }
                });
              } else {
                var tmp = out;
                if (out.indexOf(id) == -1) {
                  tmp.push(id);
                  db.run("UPDATE Posts SET votes=votes" + add + " WHERE id=?", [id], function (err) {
                    if (err) {
                      res.send({ error: true });
                    }
                  });
                } else {
                  select = 0;
                  tmp.splice(tmp.indexOf(id), 1);
                  if (add == "+1") {
                    add = "-1";
                  } else {
                    add = "+1";
                  }
                  db.run("UPDATE Posts SET votes=votes" + add + " WHERE id=?", [id], function (err) {
                    if (err) {
                      res.send({ error: true });
                    }
                  });
                }
                tmp = JSON.stringify(tmp);
                db.run("UPDATE Users SET " + opt + "=? WHERE username=?", [tmp, user], function (err) {
                  if (err) {
                    res.send({ error: true });
                  }
                });
              }
              if (opt == "like") {
                if (bad.bad != null) {
                  var tmp = JSON.parse(bad.bad);
                  if (tmp.indexOf(id) != -1) {
                    db.run("UPDATE Users SET bad=? WHERE username=?", [tmp.splice(tmp, 1), user], function (err) {
                      if (err) {
                        res.send({ error: true });
                      }
                    });
                  }
                }
              } else {
                if (like.like != null) {
                  var tmp = JSON.parse(like.like);
                  if (tmp.indexOf(id) != -1) {
                    db.run("UPDATE Users SET like=? WHERE username=?", [tmp.splice(tmp, 1), user], function (err) {
                      if (err) {
                        res.send({ error: true });
                      }
                    });
                  }
                }
              }
              db.get("SELECT votes FROM Posts WHERE id=?", [id], function (err, row) {
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

app.post("/user/addUser", function (req, res) {
  console.log("add to new user " + req.body);
  if (allowWrite) {
    var user = cleanseString(req.body.username);
    var pass = req.body.password;
    var joined = new Date();
    console.log("Add user: " + user + "@" + pass);
    db.get("SELECT username FROM Users WHERE username=?", [user], function (error, row) {
      console.log(row);
      if (!row) {
        db.run("INSERT INTO Users (username, password, joined) VALUES (?,?, ?)", [user, pass, joined], function (error) {
          if (error) {
            console.log("error!");
            res.send({
              message: "Something happened, please try again",
              error: true
            });
          } else {
            console.log("success");
            res.cookie("user", user, { maxAge: 1800000 }).send({ message: "success", error: false });
          }
        });
      } else {
        console.log("User already exists!");
        res.send({ message: "User already exists!", error: true });
      }
    });
  }
});

app.post("/user/login", function (req, res) {
  var user = cleanseString(req.body.username);
  var pass = cleanseString(req.body.password);
  console.log("Login user: " + user + "@" + pass);
  db.get("SELECT username FROM Users WHERE username=?", [user], function (error, row) {
    if (row) {
      db.get("SELECT password FROM Users WHERE username=?", [user], function (err, row) {
        if (err) {
          console.log("error!");
          res.send({
            message: "Something happened, please try again",
            error: true
          });
        } else {
          if (row.password == pass) {
            console.log("success");
            res.cookie("user", user, { maxAge: 600000 }).send({ message: "success", error: false });
          } else {
            console.log("incorrect password");
            res.send({ message: "Incorrect password", error: true });
          }
        }
      });
    } else {
      console.log("user does not exist");
      res.send({ message: "User does not exist", error: true });
    }
  });
});

app.post("/user/deleteUser", function (req, res) {
  if (allowWrite) {
    var user = req.cookies.user;
    console.log("Delete user: " + user);
    if (user) {
      db.get("SELECT username FROM Users WHERE username=?", [user], function (error, row) {
        if (row) {
          db.run("DELETE FROM Users WHERE username=?", [user], function (err) {
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
      });
    } else {
      console.log("no signed in user");
      res.send({ message: "No signed in user", error: true });
    }
  }
});

app.post("/user/updatePass", function (req, res) {
  if (allowWrite) {
    var user = req.cookies.user;
    var oldpass = req.body.oldpass;
    var newpass = req.body.newpass;
    console.log("Update user password: " + user + " to " + newpass);
    if (user) {
      db.get("SELECT username FROM Users WHERE username=?", [user], function (error, row) {
        if (row) {
          db.get("SELECT password FROM Users WHERE username=?", [user], function (error, row) {
            if (row.password == oldpass) {
              db.run("UPDATE Users SET password=? WHERE username=?", [newpass, user], function (err) {
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
              res.send({
                message: "Incorrect password",
                error: true
              });
            }
          });
        } else {
          console.log("user does not exist");
          res.send({ message: "User does not exist", error: true });
        }
      });
    } else {
      console.log("no signed in user");
      res.send({ message: "No signed in user", error: true });
    }
  }
});

app.post("/user/updateStatus", function (req, res) {
  if (allowWrite) {
    var user = req.cookies.user;
    // const status = cleanseString(req.body.status);
    var status = req.body.status;
    console.log("Update user status: " + user + " to " + status);
    if (user) {
      db.get("SELECT username FROM Users WHERE username=?", [user], function (error, row) {
        if (row) {
          db.run("UPDATE Users SET status=? WHERE username=?", [status, user], function (err) {
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
      });
    } else {
      console.log("no signed in user");
      res.send({ message: "No signed in user", error: true });
    }
  }
});

app.get("/reset", function (req, res) {
  if (allowReset) {
    db.serialize(function () {
      db.run("DROP TABLE IF EXISTS Users");
      db.run("DROP TABLE IF EXISTS Posts");
      db.run("CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password Text, joined TEXT, status TEXT, like TEXT, bad TEXT, profilepic BLOB)");
      db.run("CREATE TABLE Posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, post Text, by TEXT, date TEXT, tag TEXT, votes INTEGER, comments TEXT)");
      db.run("CREATE TABLE Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT expires TEXT)");

      console.log("RESET!");
    });
  }
});

// helper function that prevents html/css/script malice
var cleanseString = function cleanseString(string) {
  return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

app.use(function (req, res) {
  res.status(404).sendFile(__dirname + "/views/404.html");
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

