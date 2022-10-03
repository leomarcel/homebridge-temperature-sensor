const fetch = require('node-fetch');

let Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-temperature-sensor', 'Temperature Sensor', Sensor);
};

class Sensor {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.pin = config.pin;
    this.currentTemperature = 22;
  }

  identify(callback) {
    this.log('Identify requested!');
    callback(null);
  }

  startReading() {
    const callback = () => {
      setTimeout(() => this.getReading(callback), 5000);
    };

    this.getReading(callback);
  }

  getReading(callback) {
    fetch(URL).then(res => {
      callback();
      this.currentTemperature = res.Temperature;
      this.temperatureService.setCharacteristic(Characteristic.CurrentTemperature, this.currentTemperature);
    });
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'DHT22')
      .setCharacteristic(Characteristic.Model, 'Temperature Sensor')
      .setCharacteristic(Characteristic.SerialNumber, 'Raspberry Pi');

    this.temperatureService = new Service.TemperatureSensor(this.name);
    this.temperatureService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', (callback) => {
        callback(null, this.currentTemperature);
      });
    this.temperatureService
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

    this.startReading();

    return [informationService, this.temperatureService];
  }
}
