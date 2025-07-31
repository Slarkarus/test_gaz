const express = require("express");
const measurementRouter = require("./MeasurementRouter");

const router = express.Router();

router.use("/measurement", measurementRouter)

module.exports = router;
