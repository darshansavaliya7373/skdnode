const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("./config/mongoose");
const flash = require("express-flash");
const session = require("express-session");

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
)

app.use(cookieParser());
app.use(flash());
require("dotenv").config();
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Add this line for JSON parsing

app.use(express.static(path.join(__dirname, "assets")));
app.use("/user", require("./router/user.router"));
app.use("/admin", require("./router/admin.router"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.json({ message: "API running successfully" });
});

app.listen(3001, (err) => {
  if (err) { 
    console.log(err);
  } else {
    console.log("Server is running on port 3001");
  }
})