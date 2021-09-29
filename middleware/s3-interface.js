"use strict";

const AWS = require('aws-sdk');
const fs = require("fs");
const stream = require('stream');


// AWS Configuration
AWS.config.apiVersions = {s3: "2006-03-01"};  
const accessKeyId = process.env.S3AccessKey;
const secretAccessKey = process.env.S3SecretKey;  
const bucket = process.env.S3Bucket;
const s3 = new AWS.S3({accessKeyId, secretAccessKey});


/** Stream File to S3
 * @param {stream} stream - Data Stream
 * @param {string} key - Data Key
 * @param {object} metadata - Key/Value Metadata
 * @returns {Promise} Returns Upload Status
*/
module.exports.s3StreamUpload = function (stream, key, metadata) {
  
  const params = {
    Bucket: bucket, 
    Key: key, 
    Body: stream,

    // Add Metadata if Exists
    ...(metadata) && {Metadata: metadata},
  };

  return s3.upload(params).promise();

};

/** Stream File From S3
 * @param {string} key - Data Key
 * @returns {stream} Returns Read Stream
*/
module.exports.s3StreamDownload = function (key) {

  return s3.getObject({Bucket: bucket, Key: key}).createReadStream();

};



// Testing
/** Upload File from Disk to S3
 * @param {string} fileName - File Name
 * @returns {undefined}
*/
function uploadFile (fileName) {// eslint-disable-line no-unused-vars

  // Read content from the file
  const fileContent = fs.readFileSync(fileName);

  // Setting up S3 upload parameters
  const params = {
      Bucket: bucket,
      Key: 'TestFile1.jpg', // File name you want to save as in S3
      Metadata: {user: 'jrc', flagged: 'No'},
      Body: fileContent
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {

      if (err) {throw err;}

      console.log(`File uploaded successfully. ${data.Location}`);

  });
}

// Not Working
/** Upload Stream to S3
 * @param {stream} sourceStream - Readable Stream
 * @param {string} key - File Key
 * @returns {undefined}
*/
function uploadReadableStream(sourceStream) {// eslint-disable-line no-unused-vars

  const stream1 = fs.createReadStream("./static/test2.png");// eslint-disable-line no-unused-vars
  const Key = "streamTestPassThrough.png";// eslint-disable-line no-unused-vars

  // const params = {Bucket, Key, Body: stream};
  
  // s3.upload(params).promise()

  // .then(console.log)

  // .catch(console.log);
}


// Not Used Testing Purposes
/** Stream to S3
 * @param {string} key - File Key
 * @returns {object} steam and S3 upload promise
*/
 module.exports.intermStreamUpload = function (key) {

    const passStream = new stream.PassThrough();

    return {
      writeStream: passStream,
      promise: s3.upload({ Bucket: bucket, Key: key, Body: passStream }).promise(),
    };
  
  };

  










