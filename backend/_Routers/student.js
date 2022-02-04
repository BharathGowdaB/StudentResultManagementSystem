const express = require('express')
const manager = require('../Manager/manager')
const db = require('../Manager/oracledb')
const multer = require('multer')
const { response } = require('express')
const student = express.Router()

student.use(express.static(manager.path.src)); 

student.get('/*',async function(req,res){
    res.sendFile(manager.path.src+'\\student-v2.html' )
})

/*
student.get('/',async function(req,res){
    res.sendFile(manager.path.src+'\\student.html' )
})

student.get('/home',async function(req,res){
    res.sendFile(manager.path.src+'\\student.html' )
})

student.get('/results',async function(req,res){
    res.sendFile(manager.path.src+'\\student-results.html' )
})


student.get('/professors',async function(req,res){
    res.sendFile(manager.path.src+'\\student-professors.html' )
})
*/
student.post('/authenticate',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token
    }
    let response = await db.tokenAuthentication(user)
    if(response.error){
        res.send(response)
    }
    else{
        user.type = response.type
        response = await db.getInfo(user)
        res.send(response)
    }
})

student.post('/info',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token
    }
    let response = await db.tokenAuthentication(user)
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

student.post('/results',async function(req,res){
    var user = {
        username : req.body.username,
        token : req.body.token
    }
    var response = await db.tokenAuthentication(user) 
    if(!response.error){
        user.semester = req.body.semester
        ////console.log(64,req.body.semester)
        ////console.log(65,user)
        response = await db.getResults(user)
        res.send(response)
    }
    else{
        res.send(response)
    }
   
})

student.post('/professors',async function(req,res){
    var user = {
        username : req.body.username,
        token : req.body.token
    }
    var response = await db.tokenAuthentication(user) 
    if(!response.error){
        if(manager.AccountType[response.type] == 'Student'){
            user.type = response.type
            user = await db.getInfo(user)
            user.username = req.body.username
            //console.log(92,user)
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