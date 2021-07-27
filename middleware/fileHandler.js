"use strict";

const Busboy = require("busboy");
const fs = require("fs");

/** ???
 * @param {Object} req Request Object
 * @param {Object} res Response Object
 * @returns {undefined}
*/
module.exports.streamFile = function (request, response, output) {

  // fs.createWriteStream("./static/" + req.body).pipe(req.body.file)
  
  // req.pipe(fs.createWriteStream("./uploadFile"));
  // req.on("end", next);
  
    const busboy = new Busboy({ headers: request.headers });
  
  
    busboy.on("file", function(fieldname, fileStream, filename, encoding, mimetype) {
  
      // var saveTo = path.join(__dirname, "uploads/" + filename);
      // fileStream.pipe(fs.createWriteStream("./static/test123.png"));
      // fileStream.pipe(writeToStream);
      output(fileStream);

    });
  
    // Listen for event when Busboy finds a non-file field.
    busboy.on("field", function (fieldname, val) {
      console.log(fieldname + " not file");
    });
  
    busboy.on("finish", function() {
  
      // res.writeHead(200, { "Connection": "close", "Content-Type" : "application/json" });
      // res.end(JSON.stringify({id: "That`s all folks!"}));

      response.writeHead(200, { "Connection": "close" });
      response.end("That`s all folks!");
  
    });

    busboy.on("error", function() {
      response.end("Image Processing Busboy Error");
    });
     
    return request.pipe(busboy);    
  
  }
  