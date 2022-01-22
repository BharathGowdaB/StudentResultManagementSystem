const express = require('express')
const manager = require('../Manager/manager')
const db = require('../Manager/oracledb')

var user = express.Router()

user.use(express.static(manager.path.src));

user.post('/login',async function(req,res){
    console.log(req.body)
    var user = {
        username : req.body.username,
        password : req.body.password,
        token : manager.randomString(20)
    }
    response = await db.authentication(user)
    response.type = manager.AccountType[response.type]
    res.send(response)
})


module.exports = user