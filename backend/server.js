const express = require('express');
const  manager = require('./Manager/manager');
const http = require('http')
const https = require('https')

const app = new express();
const port = 8001;

app.use(express.static(manager.path.src));

app.get('/',function(req,res){
   
    res.sendFile(manager.path.src,{
        maxAge:'1d',
        root:manager.path.root
    });
})

app.listen(port,'',() => {console.log('Server running at port :'+port)});

