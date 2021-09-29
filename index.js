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
app.use(cors());



// Home Index File
app.get("/", (res, req) => {fs.createReadStream(path.join(__dirname, "static", "index.html")).pipe(req);});

// Routes
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
    err.status = 500;
    msg = "Server Error";
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


// Start Server
app.listen(process.env.PORT || 3000,()=>{

  console.log("application is running on port : " + (process.env.PORT || 3000));

}); 