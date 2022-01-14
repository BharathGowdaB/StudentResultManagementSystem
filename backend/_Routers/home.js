const express = require('express')
const manager = require('manager')

var user = express.Router()

user.post('/login',async function(req,res){
    var user = {
        username : req.body.username,
        password : req.body.password,
        token : manager.randomString(20)
    }
    response = await db.authenticate(user)
    res.send(response)
})


module.exports = user