class Measurement_dto{
    id;
    measurement;
    timestamp;
    value;
    
    constructor(model) {
        this.id = model.id;
        this.measurement = model.measurement;
        this.timestamp = model.timestamp;
        this.value = model.value;
    }
}

module.exports = Measurement_dto;