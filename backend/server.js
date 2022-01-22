const express = require('express');
const  manager = require('./Manager/manager');
const http = require('http')
const https = require('https')

const app = new express();
const port = 8001;

app.use(express.json());
app.use(express.static(manager.path.src));

app.get('/',function(req,res){
    res.sendFile('C:\\Users\\BharathGowda B\\Documents\\GitHub\\StudentResultManagementSystem\\backend\\src\\index.html')
    //res.sendFile(manager.path.root+'/'+manager.path.src);
})

const homeR = require('./_Routers/home')
const studentR = require('./_Routers/student')
const facultyR = require('./_Routers/faculty')

app.use('/home/',homeR)
app.use('/student/',studentR)
app.use('/faculty/',facultyR)

//var httpServer = http.createServer(app)
//var https_server = https.createServer(cert,app)
app.listen(port,'',() => {console.log('Server running at port :'+port)})

