const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

require("dotenv").config();


require("./config/db");

const app = express();

app.use(logger("dev"));

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {

  res.json({

    message: "Personal Notes API Running"

  });

});

app.use(

  "/api/auth",

  require("./routes/auth")

);


app.use(

  "/api/categories",

  require("./routes/categories")

);

app.use(

  "/api/notes",

  require("./routes/notes")

);

app.use((req, res) => {

  res.status(404).json({

    message: "Route Not Found"

  });

});

app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).json({

    message: "Server Error"

  });

});


module.exports = app;