const express = require('express')
const student = express.Router()

student.post('/authenticate',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token
    }
    let response = await db.tokenAuthenticate(user)
    res.send(response)
})

student.post('/info',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token
    }
    let response = await db.tokenAuthenticate(user)
    if(!response.error){
        if(manager.AccountType[response.type] == 'Student'){
            user.type = response.type
            response = await db.getInfo(user)
            res.send(response)
        }
        else{
            res.send({error:true,value:'AccountTypeError'})
        }
    }
    else{
        res.send(response)
    }
})

student.post('/result',async function(req,res){
    var user = {
        username : req.body.username,
        token : req.body.token
    }
    var response = await db.tokenAuthenticate(user) 
    if(!response.error){
        user.semester = req.body.semester
        response = await db.getResults(user)
        res.send(response)
    }
    else{
        res.send(response)
    }
   
})

student.post('/Professors',async function(req,res){
    var user = {
        username : req.body.username,
        token : req.body.token
    }
    var response = await db.tokenAuthenticate(user) 
    if(!response.error){
        if(manager.AccountType[response.type] == 'Student'){
            response = await db.getProfessorContact(user)
            res.send(response)
        }
        else{
            res.send({error:true,value:'AccountTypeError'})
        } 
    }
    else{
        res.send(response)
    }
})

module.exports = student