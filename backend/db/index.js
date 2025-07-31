const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Measurement = sequelize.define("measurement", {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  measurement: {type: DataTypes.STRING, allowNull: false},
  timestamp: {type: DataTypes.DATE, allowNull: false},
  value: {type: DataTypes.DOUBLE, allowNull: false},
});

module.exports = {
  Measurement
};
