const mysql  = require('mysql');
const express = require("express");
const bodyParser = require("body-parser");
const path=require("path");
const http=require("http");
const fs=require("fs");
const session = require('express-session');
var requests=require("requests");

var global_name = ''
var global_username = '';
var global_age = '';
var global_location = '';

var app = express();

app.use(express.urlencoded({ extended: true }))
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'CSS')));
app.use(express.static(path.join(__dirname, 'IMAGES')));
app.use(express.static(path.join(__dirname, 'JS')));
app.use(express.static(path.join(__dirname, 'FONT')));
app.use(express.static(path.join(__dirname, 'HTML')));

const homeFile=fs.readFileSync("HTML/Home.html","utf-8");

const replaceVal=(temp,org)=>{
    let data=temp.replace("{%tempval%}",(org.main.temp-273).toFixed(2));
    data=data.replace("{%tempmin%}",(org.main.temp_min-273).toFixed(2));
    data=data.replace("{%tempmax%}",(org.main.temp_max-273).toFixed(2));
    data=data.replace("{%location%}",org.name);
    data=data.replace("{%country%}",org.sys.country);
    data=data.replace("{%tempStatus%}",org.weather[0].main);
    data=data.replace("{%iconval%}",org.weather[0].icon);
    return data;
};

app.get("/SignLog",(req,res)=>{
    res.sendFile(path.join(__dirname, "HTML/Index.html"));
});

app.get("/SignNot",(req,res)=>{
    res.sendFile(path.join(__dirname, "HTML/SignNot.html"));
});

app.get("/UpdateNot",(req,res)=>{
    res.sendFile(path.join(__dirname, "HTML/UpdateNot.html"));
});

app.get("/DeleteNot",(req,res)=>{
    res.sendFile(path.join(__dirname, "HTML/DeleteNot.html"));
});

app.get("/LogNot",(req,res)=>{
    res.sendFile(path.join(__dirname, "HTML/LogNot.html"));
});

app.get("/LogOut",(req,res)=>{
    res.sendFile(path.join(__dirname, "HTML/Index.html"));
});

app.get("/Profile",(req,res)=>{
    var body = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">    
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weatherizer</title>
        <link rel = "icon" href ="ICON.png"  type = "image/x-icon">
        <link rel="stylesheet" href="Update.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">        
    </head>
    <body>   
        <div id="div1">
            <h1>Weatherizer</h1>
        </div> 
        <hr id="hr1" style="border: 3px solid gold; border-radius: 5px;">  
        <ul>
            <li><a href="/Profile">Profile</a></li>
            <li><a href="Delete.html">Delete</a></li>
            <li><a href="Update.html">Update</a></li>  
            <li><a href="Index.html">Log Out</a></li>                   
        </ul>    
        <div id="div2">
            <h2>Profile</h2>
        </div>         
        <div id="div5">
            <form action="/Sign" method="POST">
                <h1>Profile Information</h1>
                <p>This is your profile!</p>
                <hr style="border: 3px solid black; border-radius: 5px;">
                <table id="tab2">
                    <tr>
                        <td colspan="4" align="center"> <img src="USER.png" width="40%" style="border-radius:50%">  </td>
                    </tr>
                    <tr>
                        <td colspan="4" align="center"><hr style="border: 1px solid black; border-radius: 5px;"></td>
                    </tr>
                    <tr>
                        <td> Name </td><td> <i class="fa fa-address-card"></i> </td><td> : </td><td> ${global_name} </td>
                    </tr>
                    <tr>
                        <td colspan="4" align="center"><hr style="border: 1px solid black; border-radius: 5px;"></td>
                    </tr>
                    <tr>
                        <td> Age </td><td> <i class="fa fa-circle"></i> </td><td> : </td><td> ${global_age} </td>
                    </tr>
                    <tr>
                        <td colspan="4" align="center"><hr style="border: 1px solid black; border-radius: 5px;"></td>
                    </tr>
                    <tr>
                        <td> Location </td><td> <i class="fa fa-globe"></i> </td><td> : </td><td> ${global_location} </td>
                    </tr>
                    <tr>
                        <td colspan="4" align="center"><hr style="border: 1px solid black; border-radius: 5px;"></td>
                    </tr>
                    <tr>
                        <td> Username </td><td> <i class="fa fa-user"></i> </td><td> : </td><td> ${global_username} </td>
                    </tr>                   
                </table>
            </form>
        </div>
    </body>
    <script src="Index.js"></script>
    </html>
    `;
    res.writeHead(200, {"Content-Type" : "text/html"});
    res.write(body);
    res.end();
});

app.get("/home",(req,res)=>{
    requests("http://api.openweathermap.org/data/2.5/weather?q=Moscow&appid=9928fb41cc852f95ff36c7306821fd77")
    .on('data', (chunk) =>{
        const objData=JSON.parse(chunk);
        const arrData = [objData];
        const realTimeData=arrData.map((val)=>replaceVal(homeFile,val)).join("");
        res.write(realTimeData);
    })
    .on('end',  (err)=> {
    if (err) return console.log('connection closed due to errors', err);
        res.end();
    });
});

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'weather'
});

connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
});

app.post("/Sign", function(req, res) {
    var name = req.body.name;
    var age = req.body.age;
    var location = req.body.location;
    var username = req.body.username;
    var password = req.body.password;

    global_location = location;
    global_age = age;
    global_name = name;
    global_username = username;

    var sql1 = 'SELECT *FROM users WHERE username=?';
    connection.query(sql1, [username], function (err, data, fields) {
        if (err) {
            console.log(err);
        } 
        else {
            if (data.length>0) {
                res.redirect("/SignNot");
            } else {
                var sql2 = 'INSERT INTO users (Name, Age, Location, Username, Password) VALUES (?, ?, ?, ?, ?)';
                connection.query(sql2, [name , age, location, username,  password], function (err, data) {
                    if (err) {
                        console.log(err);
                    } 
                    else {
                        console.log("1 record inserted");
                        res.write(`<div ><h3 style="float:right">Hello ${name}</h3></div><br>`);
                    }
                });   
                requests("http://api.openweathermap.org/data/2.5/weather?q="+global_location+"&appid=9928fb41cc852f95ff36c7306821fd77").on('data', (chunk) =>{
                    const objData=JSON.parse(chunk);
                    const arrData = [objData];
                    const realTimeData=arrData.map((val)=>replaceVal(homeFile,val)).join("");
                    res.write(realTimeData);
                }).on('end',  (err)=> {
                    if (err) return console.log('connection closed due to errors', err);
                        res.end();
                });
            }           
        }
    });    
});

app.post("/Log", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    var location = 'Kolkata';
    var sql = 'SELECT *FROM users WHERE username=?';
    connection.query(sql, [username], function (err, data, fields) {
        if (err) {
            console.log(err);
        } 
        else {
            if (data.length>0) {
                global_location = data[0].Location;
                global_age = data[0].Age;
                global_name = data[0].Name;
                global_username = data[0].Username;       
                
                res.write(`<div><h3 style="text-align:right">Hello ${global_name}</h3></div><br>`);
                
                requests("http://api.openweathermap.org/data/2.5/weather?q="+global_location+"&appid=9928fb41cc852f95ff36c7306821fd77").on('data', (chunk) =>{
                    const objData=JSON.parse(chunk);
                    const arrData = [objData];
                    const realTimeData=arrData.map((val)=>replaceVal(homeFile,val)).join("");
                    res.write(realTimeData);
                }).on('end',  (err)=> {
                    if (err) return console.log('connection closed due to errors', err);
                    res.end();
                });
            } else {
                res.redirect("/LogNot");
            }           
        }
    });      
});

app.post("/Search", function(req, res) {
    
    var city = req.body.search;
    res.write(`<div><h3 style="align-text:right">Hello ${global_name}</h3></div><br>`);
    requests("http://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=9928fb41cc852f95ff36c7306821fd77")
    .on('data', (chunk) =>{
        const objData=JSON.parse(chunk);
        const arrData = [objData];
        const realTimeData=arrData.map((val)=>replaceVal(homeFile,val)).join("");
        res.write(realTimeData);
    })
    .on('end',  (err)=> {
        if (err) return console.log('connection closed due to errors', err);
            res.end();
    });
});

app.post("/Update", function(req, res) {  
   
    var new_location = req.body.location;
    var password = req.body.password;
    global_location = new_location;
    var username = global_username;  
  
    var sql1 = 'SELECT *FROM users WHERE Username=? AND Password=?';
    connection.query(sql1, [username, password], function (err, data, fields) {
        if (err) {
            console.log(err);
        } 
        else {
            if (data.length>0) {
                var sql2 = 'UPDATE users SET location = ? WHERE Username = ?';
                connection.query(sql2, [new_location, username], function (err, data) {
                    if (err) {
                        console.log(err);
                    } 
                    else {
                        console.log("1 record updated");
                    }
                });   
                res.write(`<div><h3 style="align-text:right">Hello ${global_name}</h3></div><br>`);
                requests("http://api.openweathermap.org/data/2.5/weather?q="+global_location+"&appid=9928fb41cc852f95ff36c7306821fd77").on('data', (chunk) =>{
                    const objData=JSON.parse(chunk);
                    const arrData = [objData];
                    const realTimeData=arrData.map((val)=>replaceVal(homeFile,val)).join("");
                    res.write(realTimeData);
                }).on('end',  (err)=> {
                    if (err) return console.log('connection closed due to errors', err);
                        res.end();
                });                
            } else {
                res.redirect("/UpdateNot");
            }           
        }
    });    
});

app.post("/Delete", function(req, res) {  
   
    var username = req.body.username;
    var password = req.body.password;
  
    var sql1 = 'SELECT *FROM users WHERE Username=? AND Password=?';
    connection.query(sql1, [username, password], function (err, data, fields) {
        if (err) {
            console.log(err);
        } 
        else {
            if (data.length>0) {
                var sql2 = 'DELETE FROM users WHERE Username = ? AND Password = ?';
                connection.query(sql2, [username, password], function (err, data) {
                    if (err) {
                        console.log(err);
                    } 
                    else {
                        console.log("1 record deleted");
                        res.redirect("/LogOut");
                    }
                }); 
            } else {                
                res.redirect("/DeleteNot");                 
            }           
        }
    });    
});

const PORT = process.env.PORT || 8081;
var server = app.listen(PORT, () => console.log(`Weather app listening at ${PORT}`));