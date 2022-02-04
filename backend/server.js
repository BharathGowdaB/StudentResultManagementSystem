const express = require('express');
const  manager = require('./Manager/manager');
const fs = require('fs')
const http = require('http')
const https = require('https')

const app = new express();
const port = 80;

app.use(express.json());
app.use(express.static(manager.path.src));

app.get('/',function(req,res){
    res.sendFile(manager.path.src+'\\login.html');
})

const homeR = require('./_Routers/home')
const studentR = require('./_Routers/student')
const facultyR = require('./_Routers/faculty')
const adminR = require('./_Routers/admin')

app.use('/home',homeR)
app.use('/student',studentR)
app.use('/faculty',facultyR)
app.use('/admin',adminR)

var key = fs.readFileSync(manager.path.root + '\\server.key')
var cert = fs.readFileSync(manager.path.root + '\\serverca.cert')
var options = {
    'key': key,
    'cert' : cert
}
var httpServer = http.createServer(app)
var https_Server = https.createServer(options,app)
//app.listen(port,'',() => {console.log('Server running at port :'+port)})

httpServer.listen(port,'',() => {console.log('Server running at port :'+port)})
https_Server.listen(443,'',() => {console.log('Server running at port :'+443)})