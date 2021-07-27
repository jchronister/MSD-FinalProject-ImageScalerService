"use strict";

// Setup process.env from .env File
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const {getReturnObject} = require("./middleware/return-object");
const imageScaler = require("./routes/image-scaler");
const admin = require("./routes/admin");
const createHttpError = require("http-errors");
const fs = require("fs");
const path = require("path");


const app = express();


app.use(logger("dev"));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// View Stream Data
// app.use(function(req, res, next) {
//   req.rawBody = '';
//   req.setEncoding('utf8');

//   req.on('data', function(chunk) { 
//     console.log( chunk);
//   });

//   req.on('end', function() {
//     next();
//   });
// });

// Authentication
// app.use(isValidUser);


// Routes

app.get("/", (res, req) => {
  fs.createReadStream(path.join(__dirname, "static", "index.html")).pipe(req);
});

app.use("/images", imageScaler);
app.use("/admin", admin);


// No Routes Found
app.use((req, res, next) => {
  next(createHttpError(404, "Not Found"));
});

// Error Handler
app.use(function(err, req, res, next) {// eslint-disable-line no-unused-vars

  // Show Errors in Development Mode
  if (req.app.get("env") === "development") {
    var msg = err.message || err;
  } else {
    // msg = "Server Error";
    msg = err.message || err;
  }

  res.status(err.status || 500).json(getReturnObject(msg, null));

});

// Error Catchall
app.use(function(err, req, res, next) {// eslint-disable-line no-unused-vars
  res.status(500).json({
    status: "Failed",
    data: null,
    error: "Image Server Error"
  });
});



app.listen(process.env.PORT || 3000,()=>{

  console.log("application is running on port : " + (process.env.PORT || 3000));

}); 