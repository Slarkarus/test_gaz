const express = require('express');
const { body } = require('express-validator')
const measurementController = require("../../controller/MeasurementController.js")
const router = express.Router();

router.post(
    "/sendData",
    body("timestamp").exists(),
    body("measurement").isString(),
    body("value").exists(),
    measurementController.sendData
);

router.get(
    "/getData",
    measurementController.getData
);

router.get(
    "/measurementTypes",
    measurementController.getAllMeasurementTypes
);

module.exports = router;