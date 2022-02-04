const { response } = require('express');
const express = require('express')
const multer = require('multer')
const manager = require('../Manager/manager')
const db = require('../Manager/oracledb')
const admin = express.Router()

admin.use(express.static(manager.path.src));  

admin.get('/',async function(req,res){
    res.sendFile(manager.path.src+'\\admin.html')
})

admin.post('/authenticate',async function(req,res){
    
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.getInfo(req.body)
        res.send(response)
    }
})


admin.post('/department',async function(req,res){
    
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.getDepartment()
        res.send(response)
    }
})

admin.post('/get-course-list',async function(req,res){
    
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.getDeptCourse(req.body.info)
        res.send(response)
    }
})

admin.post('/remove-course-list',async function(req,res){
    
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.removeDeptCourse(req.body.list_id)
        res.send(response)
    }
})

admin.post('/add-course-list',async function(req,res){
    
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.addDeptCourse(req.body.info)
        res.send(response)
    }
})

admin.post('/get-faculty-course',async function(req,res){
    
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        info = req.body.info
        id = info.deptCourse.split('-')
        info['dept_id'] = id[0]
        info['course_id'] = id[1]
        response = await db.getFacultyCourse(info)
        res.send(response)
    }
})

admin.post('/remove-faculty-course',async function(req,res){
    
    let response = await db.tokenAuthentication(req.body)
    console.log(94)
    if(response.error){
        res.send(response)
    }
    else{
        info = req.body.info
        console.log(100,info)
        response = await db.removeFacultyCourse(info)
        res.send(response)
    }
})

admin.post('/add-faculty-course',async function(req,res){
    
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        info = req.body.info
        id = info.deptCourse.split('-')
        info['dept_id'] = id[0]
        info['course_id'] = id[1]
        response = await db.addFacultyCourse(info)
        res.send(response)
    }
})


admin.post('/create',async function(req,res){
    /*var info = {
        username : req.body.username,
        token : req.body.token,
        id : req.body.id,
        name : req.body.name,
        password : req.body.password,
        department : req.body.department,
        batch : req.body.batch,
        semester : req.body.semester,
        section : req.body.section,
        contact : req.body.contact,
        hod : req.body.hod,
        title : req.body.title,
        schema : req.body.schema,
        credits : req.body.credits,
        iselective :req.body.iselective
    } */
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.createAccount(req.body.info)
        res.send(response)
    }
})

admin.post('/get-info',async function(req,res){
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.getTableInfo(req.body.info)
        res.send(response)
    }
})

admin.post('/update-info',async function(req,res){
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.updateTableInfo(req.body.info)
        res.send(response)
    }
})

admin.post('/delete-info',async function(req,res){
    let response = await db.tokenAuthentication(req.body)
    if(response.error){
        res.send(response)
    }
    else{
        response = await db.removeTableInfo(req.body.info)
        res.send(response)
    }
})

module.exports = admin