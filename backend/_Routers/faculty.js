import express from 'express'
const faculty = express.Router()

faculty.post('/authenticate',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token
    }
    let response = await db.tokenAuthenticate(user)
    res.send(response)
})

faculty.post('/course-list',async function(req,res){
    user = {
        username : req.body.username,
        token : req.body.token
    }
    let response = await db.tokenAuthenticate(user)
    if(!response.error){
        response = await db.getCourseList(user)
        res.send(response)
    }
    else{
        res.send(response)
    }   
})
/*
faculty.post('/add-student',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token,
        course_id : req.body.course_id,
        title : req.body.title,
        dept_name : req.body.dept_name,
        semester : req.body.semester,
        section : req.body.section
    }
    let response = await db.tokenAuthenticate(user)
    if(!response.error){
        if(manager.AccountType[response.type] == 'Student'){
            res.send({error:true,value:'AccountTypeError'})
        }
        else{
            response = await db.checkCourseList(user)
            if(!response.error){
                user.dept_id = response.dept_id
                if(req.body.addAll)
                    user.usn = await db.getStudent(user)
                else{
                    user.usn = req.body.usn
                }
                response = await db.addStudentToCourse(user)
                res.send(response)
            }
            else{
                res.send({error:true,value:'NotValidCourse'})
            }
        }
    }
    else{
        res.send(response)
    }
})

faculty.post('/remove-student',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token,
        course_id : req.body.course_id,
        title : req.body.title,
        dept_name : req.body.dept_name,
        semester : req.body.semester,
        section : req.body.section
    }
    let response = await db.tokenAuthenticate(user)
    if(!response.error){
        if(manager.AccountType[response.type] == 'Student'){
            res.send({error:true,value:'AccountTypeError'})
        }
        else{
            response = await db.checkCourseList(user)
            if(!response.error){
                user.dept_id = response.dept_id
                user.usn = req.body.usn
                response = await db.removeStudentFromCourse(user)
                res.send(response)
            }
            else{
                res.send({error:true,value:'NotValidCourse'})
            }
        }
    }
    else{
        res.send(response)
    }
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
    let response = await db.tokenAuthenticate(user)
    if(!response.error){
        if(manager.AccountType[response.type] == 'Student'){
            res.send({error:true,value:'AccountTypeError'})
        }
        else{
            response = await db.checkCourseList(user)
            if(!response.error){
                user.dept_id = response.dept_id
                response = await db.getStudentResult(user)
                res.send(response)
            }
            else{
                res.send({error:true,value:'NotValidCourse'})
            }
        }
    }
    else{
        res.send(response)
    }
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
    let response = await db.tokenAuthenticate(user)
    if(!response.error){
        user.type = response.type
        if(manager.AccountType[response.type] == 'Student'){
            res.send({error:true,value:'AccountTypeError'})
        }
        else{
            response = await db.checkCourseList(user)
            if(!response.error){
                user.dept_id = response.dept_id
                response = await db.updateResult(user)
                res.send(response)
            }
            else{
                res.send({error:true,value:'NotValidCourse'})
            }
        }
    }
    else{
        res.send(response)
    }

})
*/
faculty.post('/add-student',async function(req,res){
    let user = {
        username : req.body.username,
        token : req.body.token,
        course_id : req.body.course_id,
        title : req.body.title,
        dept_name : req.body.dept_name,
        semester : req.body.semester,
        section : req.body.section,
        
        addAll : req.body.addAll
    }
    let response = await db.tokenAuthenticate(user)
    if(!response.error){
        user.type = response.type
        response = await validateFaculty(user,async function (user){
            if(user.addAll)
                user.usn = await db.getStudent(user)
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
    let response = await db.tokenAuthenticate(user)
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
    let response = await db.tokenAuthenticate(user)
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
    let response = await db.tokenAuthenticate(user)
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
    if(manager.AccountType[user.type] == 'Student'){
        return ({error:true,value:'AccountTypeError'})
    }
    else{
        response = await db.checkCourseList(user)
        if(!response.error){
            user.dept_id = response.dept_id
            console.log(201,user)
            return callback(user)
        }
        else{
            return ({error:true,value:'NotValidCourse'})
        }
    }
}

module.exports = faculty