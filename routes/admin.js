"use strict";

const { sendJSON } = require("../middleware/return-object");
const {registerService, stopService, heartbeatStatus} = require("../middleware/service-registry");

const router = require("express")();

// Routes /admin/
router.route("/registry/start")
  .get(startRegistry);

router.route("/registry/stop")
  .get(stopRegistry);

router.route("/registry/status")
  .get(checkRegistry);

router.route("/registry/evnVar")
  .get((req, res) => {
    
      sendJSON.call(res, null, 
        {"registry server": process.env.MICROSERVICE_REGISTRY_URL,
        server: process.env.SERVERIP,
        port: process.env.PORT
      });
    
  });

/** Register and Start Heartbeat
 * @param {Object} req Request Object
 * @param {Object} res Response Object
 * @returns {undefined}
*/
function startRegistry (req, res) {
  registerService(res);
}

/** Stop Registry Heartbeat
 * @param {Object} req Request Object
 * @param {Object} res Response Object
 * @returns {undefined}
*/
function stopRegistry (req, res) {
  stopService();
  sendJSON.call(res, null, "Service Registry Stopped");
}
    

/** Check on Registry Heartbeat
 * @param {Object} req Request Object
 * @param {Object} res Response Object
 * @returns {undefined}
*/
function checkRegistry (req, res) {
  
  if (heartbeatStatus()) {
    sendJSON.call(res, null, "Service Registry Heartbeat Active");
  } else {
    sendJSON.call(res, null, "Service Registry Heartbeat Stopped");
  }
}


  
module.exports = router;