var db = require('./Manager/oracledb')
const manager = require('./Manager/manager');
faculty = {
    username : 'F104',
    token : '',
    course_id : '18MAT11',
    title:'Math1',
    dept_name : 'CSE',
    dept_id: 'D100',
    semester : 5,
    section :'A',
    newMarks : {
        '1BI19CS038' : {
            test1_marks : 25,
            test1_assignment : 10
        },
        '1BI19CS002' : {
            test1_marks : 35,
            test1_assignment : 0
        }
    },
    usn:['1BI19CS038','1BI19CS058','1BI19CS161']

}
student = {
    username: '1BI19CS058',
    token : '',
    type : 2,
    semester : 5
}
async function temp(){
    //console.log(await db.getCourseList(faculty))
    console.log(await db.checkCourseList(faculty))
    //console.log(await db.getStudentResult(faculty))
    //console.log(await db.updateResult(faculty.body))
    //console.log(await db.addStudentToCourse({usn:'1BI19CS161',course_id:'18CS54'}))
    //faculty.usn = await db.getStudentBySem(faculty)
   // console.log(faculty)
    //console.log(await db.addStudentToCourse(faculty))
    //console.log(await db.removeStudentFromCourse(faculty))


    //console.log(await db.getInfo(student))
    //console.log(await db.getResults(student))
    //console.log(await db.getProfessorContact(student))
    
    
    
}
temp()
let res
console.log(temp2(faculty,res))
async function temp2(req,res){
    
    let response = {error:false}// await db.tokenAuthentication(user)
    if(!response.error){
        req.type = 1 //response.type
        return await validateFaculty(req,async function (user){
            console.log('callback called')
           let response = await db.updateResult(user)
           
           return response
        })
    }
    else{
        return response
    }

}

async function validateFaculty(user,callback){
    if(manager.AccountType[user.type] == 'Student'){
        res.send({error:true,value:'AccountTypeError'})
    }
    else{
        response = await db.checkCourseList(user)
        console.log(84,response)
        if(!response.error){
            user.dept_id = response.dept_id
            console.log('callback calling')
            return(await callback(user))
        }
        else{
            return({error:true,value:'NotValidCourse'})
        }
    }
}