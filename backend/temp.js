/*var db = require('./Manager/oracledb')
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
//temp()
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
*/
//console.log(typeof like == 'undefined' ? true:false)

formula = 'AVG(SUM(c1,110,102,100,98),400)'


//console.log(mathRowOperations(formula,{},[0,10,98,'#f',78,58]))
function mathRowOperations(formula,tr,values){
   
    let pat = /[^(]+\([^()]+\)/gi
    x=0
    while(formula !== '#x'){
        console.log(97,formula)
        opr = formula.match(pat,1)[0]

        arg = opr.match(/\(([^()]+)\)/)
        console.log(103,arg[1])
        c = arg[1].split(/\s*,\s*/)
        t = 0
        console.log(c)

        if(opr.toUpperCase().startsWith('SCALE')){
            if(c.length != 3)
                return 'Arguments error'
            multipler = parseInt(c.pop())
            total = parseInt(c.pop())
            
            if(c[0] == '#x') 
                x = x * multipler / total
            else
                x = parseInt(c[0]) * multipler / total
            console.log(116,x)
            formula = formula.replace(pat,"#x")
            continue
        }

        for(i in c){
            console.log(c[i])
            if(c[i].toUpperCase().startsWith('C')){
                col = c[i].match(/[0-9]+/)[0]
                t += values[parseInt(col)-1]
            }
            else if(c[i] == '#x'){
                t += x
                continue
            }
            else{
                t += parseInt(c[i])
            }   
        }
        x = t

        if(opr.toUpperCase().startsWith('SUM'))
            console.log(opr);

        else if(opr.toUpperCase().startsWith('AVG'))
        {
            x = x/c.length
        }
        else{
            return 'Formula Error'
        }
        console.log(opr)
        formula = formula.replace(pat,"#x")
    }
    console.log(x)
    return x
}

//arr = [0,1,2,4,4,5]
///console.log(arr.splice(3,1))
//console.log(arr)

student = ['18cs56','18cdg737']
console.log(`${student}`)