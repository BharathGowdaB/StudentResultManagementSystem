const { response } = require('express');
const express = require('express')
const manager = require('../Manager/manager')
const db = require('../Manager/oracledb')
const faculty = express.Router()

faculty.use(express.static(manager.path.src));  

faculty.get('/',async function(req,res){
    res.sendFile(manager.path.src+'\\faculty.html')
})

faculty.get('/home',async function(req,res){
    res.sendFile(manager.path.src+'\\faculty.html')
})

faculty.get('/course',async function(req,res){
    res.sendFile(manager.path.src+'\\faculty-course.html')
})

faculty.get('/students',async function(req,res){
    res.sendFile(manager.path.src+'\\faculty-student.html')
})

faculty.get('/update-marks',async function(req,res){
    res.sendFile(manager.path.src+'\\faculty-update-marks.html')
})

faculty.post('/authenticate',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token
    }
    console.log(34,db)
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

faculty.post('/course-list',async function(req,res){
    user = {
        username : req.body.username,
        token : req.body.token
    }
    let response = await db.tokenAuthentication(user)
    if(!response.error){
        response = await db.getCourseList(user)
        res.send(response)
    }
    else{
        res.send(response)
    }   
})

faculty.post('/add-student',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token,
        course_id : req.body.course_id,
        dept_name : req.body.dept_name,
        section : req.body.section,
        
        addAll : req.body.addAll
    }
    console.log(req.body)
    let response = await db.tokenAuthentication(user)
    if(!response.error){
        user.type = response.type
        response = await validateFaculty(user,async function (user){
            if(user.addAll)
                user.usn = await db.getStudentBySem(user)
            else{
                user.usn = req.body.usn
            }
            let response = await db.addStudentToCourse(user)
            return response
        })
    }
    res.send(response)
})

faculty.post('/remove-student',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token,
        course_id : req.body.course_id,
        title : req.body.title,
        dept_name : req.body.dept_name,
        semester : req.body.semester,
        section : req.body.section,

        usn : req.body.usn
    }
    let response = await db.tokenAuthentication(user)
    if(!response.error){
        user.type = response.type
        response = await validateFaculty(user,async function (user){
            let response = await db.removeStudentFromCourse(user)
            return response
        })
    }
    res.send(response)
})

faculty.post('/get-students',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token,
        course_id : req.body.course_id,
        title : req.body.title,
        dept_name : req.body.dept_name,
        semester : req.body.semester,
        section : req.body.section
    }
    let response = await db.tokenAuthentication(user)
    if(!response.error){
        user.type = response.type
        response = await validateFaculty(user,async function (user){
            let response = await db.getStudentFromCourse(user)
            return response
        })
    }
    console.log(258,response)
    res.send(response)
})

faculty.post('/get-student-mark',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token,
        course_id : req.body.course_id,
        title : req.body.title,
        dept_name : req.body.dept_name,
        semester : req.body.semester,
        section : req.body.section
    }
    let response = await db.tokenAuthentication(user)
    if(!response.error){
        user.type = response.type
        response = await validateFaculty(user,async function (user){
            let response = await db.getStudentResult(user)
            return response
        })
    }
    res.send(response)
})

faculty.post('/update-marks',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token,
        course_id : req.body.course_id,
        title : req.body.title,
        dept_name : req.body.dept_name,
        semester : req.body.semester,
        section : req.body.section,

        newMarks : req.body.newMarks
    }
    let response = await db.tokenAuthentication(user)
    if(!response.error){
        user.type = response.type
        response = await validateFaculty(user,async function (user){
            let response = await db.updateResult(user)
            return response
        })
    }
    res.send(response)
})

async function validateFaculty(user,callback){
    console.log(user)
    if(manager.AccountType[user.type] == 'Student'){
        return ({error:true,value:'AccountTypeError'})
    }
    else{
        let response = await db.checkCourseList(user)
        if(!response.error){
            user.dept_id = response.dept_id
            user.semester = response.semester
            user.title = response.title
            console.log(201,user)
            return callback(user)
        }
        else{
            console.log('error in validity')
            return ({error:true,value:'NotValidCourse'})
        }
    }
}

module.exports = faculty