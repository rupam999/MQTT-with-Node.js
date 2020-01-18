var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://127.0.0.1');
 
client.on('connect', function () {
  client.subscribe('#');
});
 
client.on('message', function (topic, message) {
  console.log("Published: " + topic.toString() + ' :: '+ message.toString());
});
