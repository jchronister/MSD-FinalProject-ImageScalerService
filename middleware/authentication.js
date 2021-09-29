// Not Used Yet

"use strict";

const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");


// Sign Data
const signData = (data) => jwt.sign(data, process.env.jwtToken);

module.exports.isValidUser = function (req, res, next) {

  let { authorization: token } = req.headers;

  // Verify Token
  if (token) {
    
    try {
      var decode = jwt.verify(token, process.env.jwtToken);
    } catch {
      return next(createHttpError(400, "Invalid Token"));
    }

    req.db.user = decode;
    return next();

  }

  next(createHttpError(401, "Invalid Token"));
};