const measurementService = require("../service/MeasurementService");
const { validationResult } = require("express-validator");

class MeasurementController {
    async sendData(req, res, next){
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(JSON.stringify(errors.mapped())));
            }
            const {measurement, timestamp, value} = req.body;
            const {measurementDTO} = await measurementService.sendData(
                measurement,
                timestamp,
                value
            );
            return res.status(200).end();
        }
        catch (e) {
            next(e);
        }
    }

    async getData(req, res, next){
        try{
            const {measurement, timestamp} = req.query;
            const measurements = await measurementService.getData(measurement, timestamp);
            return res.json(measurements);
        }
        catch (e){
            next(e);
        }
    }

    async getAllMeasurementTypes(req, res, next) {
        try {
            const types = await measurementService.getAllMeasurementTypes();
            return res.json(types.map(item => item.measurement));
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new MeasurementController();