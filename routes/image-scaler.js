"use strict";

// const { login, createAccount } = require("../middleware/authentication");
// const { isMissing } = require("../middleware/verify-data");
const createHttpError = require("http-errors");


const fs = require("fs");

const sharp = require("sharp");

const { sendJSON } = require("../middleware/return-object");
const { s3StreamDownload, s3StreamUpload } = require("../middleware/s3-interface");
const router = require("express")();

// /images
router.route("/")
  .get(resizeImage)//test
  .post(createThumbnailFromS3Bucket);

// /images/vias3path
router.route("/vias3bucket") //test
  .post(resizeImage);

/** Upload Data to S3 Bucket & Return URL
 * @param {Object} req Request Object
 * @param {Object} res Response Object
 * @returns {undefined}
*/
function resizeImage(req, res) {






/////////////////////////////////////////////////////////////////
// Send File to Static Folder

      // const resizer = sharp()
      //   .resize(240, 240);

      const output = fs.createWriteStream("./static/test2Small.png");
      // const output2 = fs.createWriteStream("./static/test2.png");
req.pipe(output).on("error",console.log);

res.send("done");
      // // Save Raw & Thumbnail
      // streamFile(req, res, (n => {

      //   // Delete File on Resize Error
      //   n.pipe(resizer).on('error', (e)=> {
      //   console.log(e);
      //     fs.unlinkSync("./static/test2Small.png")
          
      //   }).pipe(output);
        
      //   n.pipe(output2);

      // }));

// End Send File to Static Folder
/////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Send File to S3

  // const resizer = sharp()
  //       .resize(240, 240);

  //     const {writeStream: output1, promise: promise1} = intermStreamUpload("streamS3fromclient.png");
  //     const {writeStream: output2, promise: promise2} = intermStreamUpload("streamS3fromclientraw.png");

  //     promise1.then(console.log).catch(console.log);
  //     promise2.then(console.log).catch(console.log);

  //     // Save Raw & Thumbnail
  //     streamFile(req, res, (n => {

  //       // Delete File on Resize Error
  //       n.pipe(resizer).on('error', (e)=> {
  //       console.log(e);
  //         fs.unlinkSync("./static/test2Small.png")
          
  //       }).pipe(output1);
        
  //       n.pipe(output2);

  //     }));

// End Send File to S3
/////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Send File to S3 Test

  // const resizer = sharp()
  //       .resize(240, 240);

  //     // Save Raw & Thumbnail
  //     streamFile(req, res, (n => {

  //       // Delete File on Resize Error
  //       const strm = n.pipe(resizer).on('error', (e)=> {
  //       console.log(e);
          
          
  //       });
        
  //       Promise.allSettled([
  //         s3StreamUpload(strm,'streamS3fromclient1.png'),
  //         s3StreamUpload(n,'streamS3fromclient1raw.png')
  //       ])
  //       .then(console.log
       
  //     ).catch(console.log)

  //       // n.pipe(output2);

  //     }));

// End Send File to S3 Test
/////////////////////////////////////////////////////////////////

}


/** Download Image from S3 Bucket & Create Thumbnail & Upload
 * @param {object} req - Request Object
 * @param {object} res - Response Object
 * @param {function} next - Express next Function
 * @returns {undefined}
*/
function createThumbnailFromS3Bucket (req, res, next) {

  // Currently Take Key. Future Take URL
  const s3Key = req.body && req.body.s3Key;
  if (!s3Key) return next(createHttpError(400, "Invalid S3 URL"));

  // Currently Take Key. Future Take URL
  const metadata = req.body && req.body.metadata;

  // Verify Metadata is Object
  if (metadata && (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata))) {
    return next(createHttpError(400, "Metadata Not Key/Value Object"));
  } else if (metadata) {

    // Verify Metadata is a String
    const nonString = Object.keys(metadata).filter( n => typeof metadata[n] !== 'string');

    if (nonString.length) return next(createHttpError(400, "Metadata Needs to be String: " + nonString.join(", ")));
  }



  // Read from S3
  const source = s3StreamDownload(s3Key)
    .on('error', error => {
      sendJSON.call(res, "S3 Download Error: " + error.message, null);
    });

  // Setup Image Size
  const resizer = sharp()
    .resize(240, 240);

  // Send Image to Image Sizer
  const formated = source.pipe(resizer)
      .on('error', error => {
        sendJSON.call(res, "Image Scaler Error: " + error.message, null);
      });

  // Save to S3
  s3StreamUpload (formated, "thumbnail-" + s3Key, metadata)
    .then((data)=> {

      // Send Uploaded Location
      sendJSON.call(res, null, {thumbnailURL: data.Location});
       
    })
    .catch((error)=>sendJSON.call(res, "S3 Upload Error: " + error.message, null,));

}


module.exports = router;