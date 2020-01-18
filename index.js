const express = require("express");
const app = express();
const mysql = require('mysql');


const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'smart_tubelight'
});

connection.connect(function(err) {
    if(err){
        console.log(err.code);
        console.log(err.fatal);
    }
    console.log('Connection Start');
});

app.set("view engine","ejs");
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("index.ejs");
});

app.get("/register", function(req, res){
    res.render("register.ejs");
});

app.get("/control", function(req, res){
    const mysqlLight = require('mysql');
    const connectionLight = mysqlLight.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'smart_tubelight'
    });
    let uid = 1;
    let numberDevice=0;
    let apiCall = 0;
    let statusDevice = Array();

    connectionLight.connect(function(err) {
        if(err){
            console.log(err.code);
            console.log(err.fatal);
        }
        console.log('Connection Start');
    });

    $queryDevice = 'SELECT number from user WHERE user_id = ' + uid;
    connectionLight.query($queryDevice, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the queryDevice query.");
            return;
        } else{
            numberDevice = rows[0].number;
        }
    });

    $queryDeviceStatus = 'SELECT status from devices WHERE user_id = ' + uid;
    connectionLight.query($queryDeviceStatus, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the queryDeviceStatus query.");
            return;
        } else{
            // console.log('device', numberDevice)
            for(let i=0; i<numberDevice; i++){
                statusDevice.push(rows[i].status);
                // console.log('status', statusDevice[i])
            }
        }

        let sendDataStatusDevice = [
            {
                statusSend: statusDevice,
                callApi: apiCall
            }

        ];

        connectionLight.end(function(){
            console.log('Connection Close')
        });
        res.render("control.ejs", {sendData: sendDataStatusDevice});

    });

});

app.get("/contact", function(req, res){
    res.render("contact.ejs");
});


app.get("/apiArea/:user/:deviceid", function(req, res){
    let userid = req.params.user;
    let deviceid = req.params.deviceid;
    let numberDevice=0;
    let uid = 1;
    let stop = 0;
    let apiCall = 1;
    let statusDevice = Array();
    $query = 'SELECT * from devices WHERE user_id = ' + userid + ' AND device_id = ' + deviceid;
    // console.log($query);
    const mqtt = require('mqtt');
    const client  = mqtt.connect('mqtt://127.0.0.1');
    // const mysql = require('mysql');

    // connection = mysql.createConnection({
    //     host     : 'localhost',
    //     user     : 'root',
    //     password : '',
    //     database : 'smart_tubelight'
    // });

    // connection.connect(function(err) {
    //     if(err){
    //         console.log(err.code);
    //         console.log(err.fatal);
    //     }
    //     console.log('Connection Start');
    // });

    connection.query($query, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the query.");
            return;
        }
        let currentStatus = rows[0].status;
        let newStatus = null;
        if(currentStatus === 0){
            newStatus = 1;
        } else{
            newStatus = 0;
        }
        // console.log(client);
        // MQTT Connection Area
        client.on('connect', function () {
            console.log('Connection Area for MQTT');
            client.subscribe('status');
            programedPublish();
        });
        function publish(topic, message) {
            client.publish(topic, message);
        }
        function programedPublish() {
            publish("status", newStatus.toString());
        }

        client.on('message', function (topic, message) {
            if(stop === 0){
                console.log("Published: " + topic.toString() + ' :: ' + message.toString());
                stop = 1;
            }
        });

        client.on('close', function() {
            console.log('mqtt closed');
        });

    
        $query2 = 'UPDATE devices SET status = ' + newStatus + ' WHERE user_id = ' + userid + ' AND device_id = ' + deviceid;
        connection.query($query2, function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the query2.");
                return;
            } else{
                console.log('Done in update section...');
            }
        });
    });

    $queryDevice = 'SELECT number from user WHERE user_id = ' + uid;
    connection.query($queryDevice, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the queryDevice query.");
            return;
        } else{
            numberDevice = rows[0].number;
        }
    });

    $queryDeviceStatus = 'SELECT status from devices WHERE user_id = ' + uid;
    connection.query($queryDeviceStatus, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the queryDeviceStatus query.");
            return;
        } else{
            // console.log('device', numberDevice)
            for(let i=0; i<numberDevice; i++){
                statusDevice.push(rows[i].status);
                // console.log('status', statusDevice[i])
            }
        }
        // console.log(statusDevice)

        let sendDataStatusDevice = [
            {
                statusSend: statusDevice,
                callApi: apiCall
            }

        ];

        res.render("control.ejs", {sendData: sendDataStatusDevice});

    });

    // connection.end(function(){
    //     console.log('Connection Close')
    // });

});

app.get("/logout", function(req, res){
    connection.end(function(){
        console.log('Connection Close')
    });
    res.render("index.ejs");
});

app.get("*", function(req, res){
    res.render("index.ejs");
});


app.listen(3000, function(){
    console.log('Server Start at port 3000')
});