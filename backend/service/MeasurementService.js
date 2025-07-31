const { Measurement } = require("../db");
const Measurement_dto = require("../dto/measurement_dto");
const { Op, Sequelize  } = require("sequelize");
const {sequelize} = require("../db/db");
const moment = require('moment');

class MeasurementService{
    async sendData(measurement, timestamp, value){
        const measurementRow = await Measurement.create({
            measurement: measurement,
            timestamp: timestamp, 
            value: value
        });
        measurementRow.save();

        const measurementDTO = new Measurement_dto(measurementRow);

        return {
            measurement: measurementDTO
        };
    }

    async getData(measurement, timestamp){
        const where = {};
        
        if (measurement) where.measurement = measurement;
        if (timestamp){
            const formattedTimestamp = moment(timestamp).toISOString();
            where.timestamp = { [Op.gt]: formattedTimestamp };
        }
        
        return await Measurement.findAll({ where });
    }

    async getAllMeasurementTypes() {
        return await Measurement.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('measurement')), 'measurement']],
            raw: true
        });
    }
        
}

module.exports = new MeasurementService();
