"use strict";

const http = require("http");
const https = require("https");
const { sendJSON } = require("./return-object");

const logit = false;

const serviceInfo = {
  
  public: {
    name: "jc.imagescaler.thumbnail",
    category: "Image Scaler",
    version: 1,
    description: "Scale Images to Thumbnail", 
    endpoint: process.env.SERVERIP + "/images", 
    heartbeatIntervalms: 15 * 1000,
    documentationURL: process.env.SERVERIP,
    id: undefined,
  },
  
  private: {
    heartbeatTimerId: undefined
  }
};

/** Stop Service & Clear Heartbeat Timer
* @returns {undefined}
*/
module.exports.stopService = function () {

  errorCleanup("User Stopped Service");

};

/** Check on Registry Heartbeat
* @returns {undefined}
*/
module.exports.heartbeatStatus = function () {

  return serviceInfo.private.heartbeatTimerId !== undefined;

};


/** Register Service & Start Heartbeat Timer
* @param {Object} res Response Object
* @returns {undefined} Sends Response
*/
module.exports.registerService = function (res) {

  if (logit) console.log("Registering Service " + new Date());

  // Poll Service Registry
  request(serviceInfo.public)
  
  .then(response => {

    if (response.error) {

      // Throw if Unsuccessful
      throw response.error;

    } else {

      if (logit) console.log("Registering Success " + new Date());
    
      // Save Id
      serviceInfo.public.id = response.data.id;
    
      // Trigger Heartbeat
      serviceInfo.private.heartbeatTimerId = setInterval(
        () => serviceHeartbeat(serviceInfo) 
        , serviceInfo.public.heartbeatIntervalms);

      // Send Success
      sendJSON.call(res, null, "Service Registry Started");

    }

  })
  .catch(err => {

    // Cleanup
    errorCleanup(("registerService: " + (err.message || err)));
  
    // Send Success
    sendJSON.call(res, err.message || err, null);
  });

};



/** Sends Heartbeat Request to Service Registry
* @param {Object} data - Data to Send
* @returns {undefined}
*/
function serviceHeartbeat (data) {

  if (logit) console.log("Sending Heartbeat " + new Date());

  request(data.public)
  .then((response) => {
    
      // Throw if Unsuccessful
      if (response.error) {
        
        if (response.error === "Invalid Id") {

          // Service Registry Lost Service - Reregister
          errorCleanup("Service Registry Lost Service - Reregister");
          serviceInfo.public.id = undefined;
          return module.exports.registerService();

        } else {
          
          // Unknown Error
          throw response.error;

        }
      }

      if (logit) console.log("Heartbeat Success " + new Date());
    
    })
  .catch(err => errorCleanup(("serviceHeartbeat: " + (err.message || err))));
 
}


/** Log & Cleanup for Errors
* @param {String} error - Error Message
* @returns {undefined}
*/
function errorCleanup(error) {

    // Log
    if (logit) console.log(error);
  
    // Cancel Heartbeat
    clearInterval(serviceInfo.private.heartbeatTimerId);
    serviceInfo.private.heartbeatTimerId = undefined;
}



/** HTTP POST Request
 * @param {any} data - Data to Send in Request Body
 * @returns {Promise} HTTP Request Promise
*/
function request (data) {

  return new Promise((resolve, reject) => {

    const options = {
      method: "POST",
      headers: {'content-type': 'application/json'}
    };

    /** HTTP Request Handler Function
     * @param {Object} response - Server Response Object
     * @returns {undefined}
    */
    const responseHandler = function(response) {
      
      let str = '';

      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        resolve(JSON.parse(str));
      });


    };

    // Request
    const url = process.env.MICROSERVICE_REGISTRY_URL;

    // Pick Protocol
    const req = (/^https/.test(url) ? https : http).request(url, options, responseHandler);

    req.on("error", reject);
    req.end(JSON.stringify(data));

  });

}




// Stream via Buffer
// const server = http.createServer((request, response) => {
//   let data = []
//   request
//     .on("data", d => {
//       data.push(d)
//     })
//     .on("end", () => {
//       data = Buffer.concat(data).toString()
//       response.statusCode = 201
//       response.end()
//     })
// })

