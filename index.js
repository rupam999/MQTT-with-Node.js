const express = require("express");
const app = express();
const mysql = require('mysql');
const bodyParser = require("body-parser");
const hash = require('md5');
const session = require('express-session');



const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Password',
    database : 'smart_tubelight'
});

connection.connect(function(err) {
    if(err){
        console.log(err.code);
        console.log(err.fatal);
    } else
        console.log('Connection Start connection(main)');
});

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.get("/", function(req, res){
    let msg2 = "";
    res.render("index.ejs", {message: msg2});
});

app.post("/login", function(req, res){
    if (!req.session.loggedin) {
        const mysqlLogin = require('mysql');
        const connectionLogin = mysqlLogin.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Password',
            database : 'smart_tubelight'
        });
        connectionLogin.connect(function(err) {
            if(err){
                console.log(err.code);
                console.log(err.fatal);
            }
            console.log('Connection Start');
        });

        let email = req.body.email;
        let password = req.body.password;

        $loginQuery = "SELECT * FROM user WHERE email = '" + email + "' AND password = '" + hash(password) + "'";
        connectionLogin.query($loginQuery, function(err, rows, fields){
            if(err){
                console.log(err);
                console.log('Problem in login');
                res.render("index");
            }
            else{
                if (rows.length > 0) {
                    req.session.loggedin = true;
                    req.session.email = rows[0].email;
                    req.session.userid = rows[0].user_id;
                    // console.log(rows[0].user_id);
                    // console.log(req.session.userid);
                    res.render('successLogin');
                } else{
                    console.log("Wrong Email Password");
                    res.render("index");
                }
            }
        });

        connectionLogin.end(function(){
            console.log('Connection Close')
        });
    } else{
        res.render("successLogin");
    }

});

app.post("/register", function(req, res){
    const mysqlRegister = require('mysql');
    const connectionRegister = mysqlRegister.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'New#pass111',
        database : 'smart_tubelight'
    });

    let fullName = req.body.name;
    let email = req.body.email;
    let mobileNumber = req.body.mobileNumber;
    let password = req.body.password;
    let confirmPassword = req.body.confirmpassword;

    connectionRegister.connect(function(err) {
        if(err){
            console.log(err.code);
            console.log(err.fatal);
        }
        console.log('Connection Start');
    });

    if(confirmPassword == password){

        let zero = 0;

        $registerQuery = 'INSERT INTO user(fullName, email, mobileNumber, password, number) VALUES ("' + fullName + '", "' + email + '", "' + mobileNumber + '", "' + hash(password) + '", "' + zero + '")';
        connectionRegister.query($registerQuery, function(err, rows, fields){
            if(err){
                console.log(err);
                console.log('Problem');
                let response = 1;
                let msg = "Problem in Query Area Contact Admin ... ";
                let objRegister = [
                    {
                        response: response,
                        msg: msg
                    }
                ];
                // console.log(objRegister[0].response);
                res.render("register", {objreg: objRegister});
            }else{
                // console.log(rows);
                // Data Stored
                let msg = "Successfully Register";
                res.render("index.ejs", {message: msg});
            }
        });

    } else{
        let response = 1;
        let msg = "Password And Confirm Password Didn't Match";
        let objRegister = [
            {
                response: response,
                msg: msg
            }
        ];
        // console.log(objRegister[0].response);
        res.render("register", {objreg: objRegister});
    }

    connectionRegister.end(function(){
        console.log('Connection Close')
    });

});

app.get("/register", function(req, res){
    if (!req.session.loggedin) {
        let response = 0;
        let msg = '';
        let objRegister = [
            {
                response: response,
                msg: msg
            }
        ];
        res.render("register.ejs", {objreg: objRegister});
    } else{
        res.render("index");
    }
});

app.get("/control", function(req, res){
    if (req.session.loggedin) {
        const mysqlLight = require('mysql');
        const connectionLight = mysqlLight.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Password',
            database : 'smart_tubelight'
        });
        let uid = 1;
        let numberDevice=0;
        let apiCall = 0;
        let statusDevice = Array();
        let idDevice = Array();
        let nameDevice = Array();

        connectionLight.connect(function(err) {
            if(err){
                console.log(err.code);
                console.log(err.fatal);
            }
            console.log('Connection Start');
        });

        $queryDevice = 'SELECT number from user WHERE user_id = ' + req.session.userid;
        connectionLight.query($queryDevice, function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the queryDevice query.");
                // console.log(req.session.userid);
                return;
            } else{
                numberDevice = rows[0].number;
            }
        });

        $queryDeviceStatus = 'SELECT status,deviceName,device_id from devices WHERE user_id = ' + req.session.userid;
        connectionLight.query($queryDeviceStatus, function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the queryDeviceStatus query.");
                return;
            } else{
                // console.log('device', numberDevice)
                for(let i=0; i<numberDevice; i++){
                    statusDevice.push(rows[i].status);
                    nameDevice.push(rows[i].deviceName);
                    idDevice.push(rows[i].device_id);
                    // console.log('status', statusDevice[i])
                }
            }

            let sendDataStatusDevice = [
                {
                    statusSend: statusDevice,
                    deviceSend: nameDevice,
                    idSend: idDevice,
                    callApi: apiCall
                }

            ];

            // console.log(sendDataStatusDevice);

            connectionLight.end(function(){
                console.log('Connection Close');
            });
            res.render("control.ejs", {sendData: sendDataStatusDevice});
            // res.send('testing');

        });
    } else{
        res.render("index");
    }

});

app.get("/contact", function(req, res){
    if (req.session.loggedin) {
        res.render("contact");
    } else{
        res.render("index");
    }
    res.end();
});


app.get("/apiArea/:deviceid", function(req, res){
    if (req.session.loggedin) {
        // let userid = req.params.user;
        let deviceid = req.params.deviceid;
        let numberDevice=0;
        let stop = 0;
        let apiCall = 0;
        let statusDevice = Array();
        let idDevice = Array();
        let nameDevice = Array();
        $query = 'SELECT * from devices WHERE user_id = ' + req.session.userid + ' AND device_id = ' + deviceid;
        // console.log($query);
        const mqtt = require('mqtt');
        const client  = mqtt.connect('mqtt://127.0.0.1');
        // const mysql = require('mysql');

        // connection = mysql.createConnection({
        //     host     : 'localhost',
        //     user     : 'root',
        //     password : 'Password',
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
                stop = 0;
            } else{
                newStatus = 0;
                stop = 0;
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

        
            $query2 = 'UPDATE devices SET status = ' + newStatus + ' WHERE user_id = ' + req.session.userid + ' AND device_id = ' + deviceid;
            connection.query($query2, function(err, rows, fields) {
                if(err){
                    console.log("An error ocurred performing the query2.");
                    return;
                } else{
                    console.log('Done in update section...');
                }
            });
        });

        $queryDevice = 'SELECT number from user WHERE user_id = ' + req.session.userid;
        connection.query($queryDevice, function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the queryDevice query.");
                return;
            } else{
                numberDevice = rows[0].number;
            }
        });

        $queryDeviceStatus = 'SELECT status,deviceName,device_id from devices WHERE user_id = ' + req.session.userid;
        connection.query($queryDeviceStatus, function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the queryDeviceStatus query.");
                return;
            } else{
                // console.log('device', numberDevice)
                for(let i=0; i<numberDevice; i++){
                    if(deviceid == rows[i].device_id){
                        let change = rows[i].status;
                        if(change === 0){
                            change = 1;
                        } else{
                            change = 0;
                        }
                        statusDevice.push(change);
                    } else{
                        statusDevice.push(rows[i].status);
                    }
                    nameDevice.push(rows[i].deviceName);
                    idDevice.push(rows[i].device_id);
                    // console.log('status', statusDevice[i])
                }
            }
            // console.log(statusDevice)

            let sendDataStatusDevice = [
                {
                    statusSend: statusDevice,
                    deviceSend: nameDevice,
                    idSend: idDevice,
                    callApi: apiCall
                }

            ];

            // console.log(sendDataStatusDevice);

            res.render("control.ejs", {sendData: sendDataStatusDevice});

        });

        // connection.end(function(){
        //     console.log('Connection Close')
        // });
    } else{
        res.render("index");
    }
});

app.post("/addDevice", function(req, res){
    if (req.session.loggedin) {
        // Add Device Action
        let deviceName = req.body.deviceName;
        let deviceId = req.body.deviceId;
        let zero = 0;
        $queryAddDevice = 'INSERT INTO devices(device_id,user_id,deviceName,status) VALUES("' + deviceId +'", "' + req.session.userid +'", "' + deviceName +'", "' + zero +'")';
        connection.query($queryAddDevice, function(err, rows, topic){
            if(err){
                console.log(err);
                console.log('Problem in addDevice');
                let sendCode = 1;
                let message = 'Problem in adding device';
                let objDevice = [
                    {code:sendCode, message:message}
                ];
                // res.render("addDevice", {objDevice: objDevice});
            } else{
                $updateUserQuery = "UPDATE user SET number=(SELECT number WHERE user_id="+ req.session.userid +")+1 WHERE user_id="+ req.session.userid;
                connection.query($updateUserQuery, function(err, rows, topic){
                    if(err){
                        console.log(err);
                        console.log('Problem in addDevice');
                        let sendCode2 = 1;
                        let message2 = 'Problem in adding device';
                        let objDevice2 = [
                            {code:sendCode2, message:message2}
                        ];
                        // res.render("addDevice", {objDevice: objDevice2});
                    } else{
                        let sendCode3 = 2;
                        let message3 = 'Successfully Added the Device' + deviceId;
                        let objDevice3 = [
                            {code:sendCode3, message:message3}
                        ];
                        res.render("addDevice", {objDevice: objDevice3});
                    }
                });
            }
        });

    } else{
        res.render("index");
    }
});

app.get("/addDevice", function(req, res){
    let sendCode = 0;
    let message = '';
    let objDevice = [
        {code:sendCode, message:message}
    ];
    if (req.session.loggedin) {
        res.render("addDevice", {objDevice: objDevice});
    } else{
        res.render("index");
    }
});

app.get("/logout", function(req, res){
    if (req.session.loggedin) {
        connection.end(function(){
            console.log('Connection Close');
        });
        req.session.loggedin = false;
        req.session.email = null;
        req.session.userid = null;
        res.render("index");
    } else{
        res.render("index");
    }
});



// API Section
// Register
app.get("/register/:username/:password/:mobileNo/:name", function(req, res){
    const mysqlRegister = require('mysql');
    const connectionRegister = mysqlRegister.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'Password',
        database : 'smart_tubelight'
    });

    let fullName = req.params.name;
    let email = req.params.username;
    let mobileNumber = req.params.mobileNo;
    let password = req.params.password;

    connectionRegister.connect(function(err) {
        if(err){
            console.log(err.code);
            console.log(err.fatal);
        }
        console.log('Connection Start');
    });

    if(true){

        let zero = 0;

        $registerQuery = 'INSERT INTO user(fullName, email, mobileNumber, password, number) VALUES ("' + fullName + '", "' + email + '", "' + mobileNumber + '", "' + hash(password) + '", "' + zero + '")';
        connectionRegister.query($registerQuery, function(err, rows, fields){
            if(err){
                console.log(err);
                console.log('Problem');
                let regMsg = [
                    {
                        msg: 'Error Some issue...',
                        code: 0
                    }
                ];
                res.send(regMsg);
            }else{
                let regMsg = [
                    {
                        msg: 'Successfully Register',
                        code: 1
                    }
                ];
                res.send(regMsg);
            }
        });

    }

    connectionRegister.end(function(){
        console.log('Connection Close')
    });

});


// Login
app.get("/login/:username/:password", function(req, res){
        const mysqlLogin = require('mysql');
        const connectionLogin = mysqlLogin.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'Password',
            database : 'smart_tubelight'
        });
        connectionLogin.connect(function(err) {
            if(err){
                console.log(err.code);
                console.log(err.fatal);
            }
            console.log('Connection Start API');
        });

        let email = req.params.username;
        let password = req.params.password;
        

        $loginQueryAPI = "SELECT * FROM user WHERE email = '" + email + "' AND password = '" + hash(password) + "'";
        connectionLogin.query($loginQueryAPI, function(err, rows, fields){
            if(err){
                console.log(err);
                console.log('Problem in login');
                let LoginMsg = [
                    {
                        msg: 'Login issue, Connection Issue',
                        code: 0
                    }
                ];
                res.send(LoginMsg);
            }
            else{
                if (rows.length > 0) {
                    let deviceId = Array();
                    let deviceName = Array();
                    let deviceStatus = Array();
                    let numberDevice = 0;
                    let userId = rows[0].user_id;

                    $queryDevice = 'SELECT number from user WHERE user_id = ' + userId;
                    connection.query($queryDevice, function(err, rows, fields) {
                        if(err){
                            console.log("An error ocurred performing the queryDevice query API.");
                            return;
                        } else{
                            numberDevice = rows[0].number;
                            // console.log('number', numberDevice);
                            $queryDeviceStatusAPI = 'SELECT status,deviceName,device_id from devices WHERE user_id = ' + userId;
                            connection.query($queryDeviceStatusAPI, function(err, rows, fields) {
                                if(err){
                                    console.log("An error ocurred performing the queryDeviceStatus query.");
                                    return;
                                } else{
                                    // console.log('device', numberDevice)
                                    for(let i=0; i<numberDevice; i++){
                                        deviceId.push(rows[i].device_id);
                                        deviceName.push(rows[i].deviceName);
                                        deviceStatus.push(rows[i].status);
                                    }
                                }

                                let LoginMsg = [
                                    {
                                        msg: 'Successfully Login',
                                        code: 1,
                                        user_id: userId,
                                        device_id: deviceId,
                                        device_name: deviceName,
                                        status: deviceStatus
                                    }
                                ];

                                connectionLogin.end(function(){
                                    console.log('Connection Close API')
                                });
            
                                res.send(LoginMsg);

                            });

                        }
                    });

                } else{
                    console.log("Wrong Email Password");
                    let LoginMsg = [
                        {
                            msg: 'Login issue, Wrong username or Password',
                            code: 0
                        }
                    ];
                    connectionLogin.end(function(){
                        console.log('Connection Close API')
                    });
                    res.send(LoginMsg);
                }
            }
        });
    // Blank line end
});


// Add Device 
app.get("/addDevice/:userId/:deviceId/:deviceName", function(req, res){
    if (true) {
        // Add Device Action
        let userId = req.params.userId;
        let deviceName = req.params.deviceName;
        let deviceId = req.params.deviceId;
        let zero = 0;
        $queryAddDevice = 'INSERT INTO devices(device_id,user_id,deviceName,status) VALUES("' + deviceId +'", "' + req.session.userid +'", "' + deviceName +'", "' + zero +'")';
        connection.query($queryAddDevice, function(err, rows, topic){
            if(err){
                console.log(err);
                console.log('Problem in addDevice');
                let AddDeviceMsg = [
                    {
                        msg: 'Connection issue',
                        code: 0
                    }
                ];
                res.send(AddDeviceMsg);
            } else{
                $updateUserQuery = "UPDATE user SET number=(SELECT number WHERE user_id="+ userId +")+1 WHERE user_id="+ userId;
                connection.query($updateUserQuery, function(err, rows, topic){
                    if(err){
                        console.log(err);
                        console.log('Problem in addDevice');
                        let AddDeviceMsg = [
                            {
                                msg: 'Some issue in adding device',
                                code: 0
                            }
                        ];
                        res.send(AddDeviceMsg);
                    } else{
                        let AddDeviceMsg = [
                            {
                                msg: 'Successfully added the device',
                                code: 1
                            }
                        ];
                        res.send(AddDeviceMsg);
                    }
                });
            }
        });

    }
});


// Device Publish Status
app.get("/apiArea/:userId/:deviceid", function(req, res){
    if (true) {
        // let userid = req.params.user;
        let deviceid = req.params.deviceid;
        let userId = req.params.userId;
        let numberDevice=0;
        let stop = 0;
        let apiCall = 0;
        let statusDevice = Array();
        let idDevice = Array();
        let nameDevice = Array();
        $query = 'SELECT * from devices WHERE user_id = ' + userId + ' AND device_id = ' + deviceid;
        // console.log($query);
        const mqtt = require('mqtt');
        const client  = mqtt.connect('mqtt://127.0.0.1');
        // const mysql = require('mysql');

        // connection = mysql.createConnection({
        //     host     : '172.104.40.208',
                // user     : 'root',
                // password : 'Password',
                // database : 'smart_tubelight'
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
                let buttonArea = [
                    {
                        msg: 'Problem in Connection',
                        code: 0
                    }
                ];
                res.send(buttonArea);
                return;
            }
            let currentStatus = rows[0].status;
            let newStatus = null;
            if(currentStatus === 0){
                newStatus = 1;
                stop = 0;
            } else{
                newStatus = 0;
                stop = 0;
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

        
            $query2 = 'UPDATE devices SET status = ' + newStatus + ' WHERE user_id = ' + userId + ' AND device_id = ' + deviceid;
            connection.query($query2, function(err, rows, fields) {
                if(err){
                    console.log("An error ocurred performing the query2.");
                    return;
                } else{
                    console.log('Done in update section...');
                }
            });
        });

        $queryDevice = 'SELECT number from user WHERE user_id = ' + userId;
        connection.query($queryDevice, function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the queryDevice query.");
                return;
            } else{
                numberDevice = rows[0].number;
            }
        });

        $queryDeviceStatus = 'SELECT status,deviceName,device_id from devices WHERE user_id = ' + userId;
        connection.query($queryDeviceStatus, function(err, rows, fields) {
            if(err){
                console.log("An error ocurred performing the queryDeviceStatus query.");
                return;
            } else{
                // console.log('device', numberDevice)
                for(let i=0; i<numberDevice; i++){
                    if(deviceid == rows[i].device_id){
                        let change = rows[i].status;
                        if(change === 0){
                            change = 1;
                        } else{
                            change = 0;
                        }
                        statusDevice.push(change);
                    } else{
                        statusDevice.push(rows[i].status);
                    }
                    nameDevice.push(rows[i].deviceName);
                    idDevice.push(rows[i].device_id);
                    // console.log('status', statusDevice[i])
                }
            }
            // console.log(statusDevice)

            let buttonArea = [
                {
                    msg: 'Successfully Done',
                    code: 1,
                    user_id: userId,
                    device_id: idDevice,
                    status: statusDevice
                }
            ];
            res.send(buttonArea);

        });

        // connection.end(function(){
        //     console.log('Connection Close')
        // });
    }
});


app.get("*", function(req, res){
    res.render("index");
});


app.listen(3000, function(){
    console.log('Server Start at port 3000')
});
