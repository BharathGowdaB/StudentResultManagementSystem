const oracledb = require('oracledb')
const manager = require('./manager');

var db 
var isConnected = false


connect();

async function connect(){
    try{
        db = await oracledb.getConnection({user : "dbms",password : "2310"});
        isConnected=true;
        //console.log("Connected to ");
    }
    catch(err){
        //console.log(err);
    } 
    
}  

//<------------------ User----------------------------->

async function authentication(user){
    user.username = user.username.toUpperCase()
    if(!isConnected){
        await connect();
    }
    let res = {}
    var result = await db.execute(`select password,type,login_fail from user_login where user_id='${user.username}'`)
    //console.log(31,result)
    if(result.rows[0]){
        let row = result.rows[0]
        
        //console.log(33,user)
        if(row[2] > manager.maxLoginFail ){
            return({error: true,value:'AccountLocked'})
        }
        else if(row[0]==user.password){
            res = {token:user.token,type:row[1],error:false}
            db.execute(`update user_login set token = '${user.token}',token_fail=0 where user_id='${user.username}'`)
        }
        else{
            db.execute(`update user_login set login_fail = login_fail + 1 where user_id='${user.username}'`)
            res = {token:'',type:'',error:true,value:'LoginFail'}
        }
        db.execute('commit')
    }
    else{
        res = {error:true,value:'LoginFail'}
    }
    //console.log(117,res)
    return res
}

async function tokenAuthentication(user){
    console.log('int token authentication')
    user.username = user.username.toUpperCase()
    if(!isConnected){
        await connect();
    }
    let res = {}
    var result = await db.execute(`select token,token_fail,type from user_login where user_id='${user.username}'`)
    let row = result.rows[0]
    if(row[1] > manager.maxTokenFail ){
        return({error: true,value:'AccountLocked'})
    }
    else if(row[0]==user.token){
        res = {error:false,type:row[2]}
    }
    else{
        res = {token:'',type:'',error:true,value:'TokenFail'}
        db.execute(`update user_login set token_fail = token_fail + 1 where user_id='${user.username}'`)
        db.execute('commit') 
    }
    //console.log(117,res)
    return res
}

async function getInfo(user){
    user.username = user.username.toUpperCase()
    if(!isConnected){
        await connect();
    }
    var res = {}
    if(manager.AccountType[user.type] == 'Student'){
        let result = await db.execute(`select USN, s.Name as Name, Dept_Name as Department, f.Name as HOD,
                                            f.contact as HodContact, Batch, Semester, Section, s.Contact as Phone,s.photo_container,s.dept_id
                                        from student s, department d, faculty f
                                        where usn='${user.username}' 
                                            and s.dept_id = d.dept_id 
                                            and d.hod_id = f.faculty_id`)
        res.name = result.rows[0][1]
        res.dept_name = result.rows[0][2]
        res.hod = result.rows[0][3]
        res.hod_contact = result.rows[0][4]
        res.batch = result.rows[0][5]
        res.semester = result.rows[0][6]
        res.section = result.rows[0][7]
        res.contact = result.rows[0][8]
        res.photo_container = result.rows[0][9]
        res.dept_id= result.rows[0][10]
    }
    else{
        //has to change
        result = await db.execute(`select name,photo_container,contact from faculty where faculty_id='${user.username}'`)
        res['name'] = result.rows[0][0]
        res['photo_container'] = result.rows[0][1]
        res['contact'] = result.rows[0][2]
    }
    console.log(117,res)
    return res
}

//<------------------Student--------------------------->
async function getResults(info){
    info.username = info.username.toUpperCase()
    if(!isConnected){
        await connect();
    }
    let res = {}
    let result = await db.execute(`select * 
                                    from  ((select course_id,semester as course_Semester,isElective,Title
                                            from course
                                            where semester = ${info.semester})
                                            inner join
                                            (select * from results
                                            where usn = '${info.username}')
                                            using (course_id)
                                )`)
 
    if(result.rows[0]){
        res = result
        res.error = false
    }
    else{
        res = {error:true,value:'ResultNotUpdated'}
    }
    //console.log(117,res)
    return res
}

async function getProfessorContact(info){
    info.username = info.username.toUpperCase()
    if(!isConnected){
        await connect();
    }
    let res = {}
    let user = {}
    let result = await db.execute(`select dept_id,semester,section from student where usn='${info.username}'`)
    user.dept_id = result.rows[0][0]
    user.semester = result.rows[0][1]
    user.section = result.rows[0][2]
/*
    result = await db.execute(`select name,contact,profile_container
                                    from faculty f
                                    where f.faculty_id in ((select faculty_id
                                                            from takes 
                                                            where section = '${user.section}'
                                                            and list_id in (select list_id
                                                                            from course_list cl, course c
                                                                            where cl.dept_id='${user.dept_id}'
                                                                            and cl.course_id = c.course_id
                                                                            and c.semester = ${user.semester})
                                                         )
                                                         
                                    )`)*/
    console.log(`select name,contact,photo_container,course_id,title
    from ((((select * from course_list where dept_id = '${user.dept_id}')
    inner join (select course_id,title from course where semester = ${user.semester}) using(course_id))
    inner join (select  * from  takes where section = '${user.section}') using(list_id))
    inner join faculty using(faculty_id)))`)
    result = await db.execute(`(select name,contact,photo_container,course_id,title
                                from ((((select * from course_list where dept_id = '${user.dept_id}')
                                inner join (select course_id,title from course where semester = ${user.semester}) using(course_id))
                                inner join (select  * from  takes where section = '${user.section}') using(list_id))
                                inner join faculty using(faculty_id)))`)
    if(result.rows[0]){
        res = result
        res.error = false
    }
    else{
        res.error = true
        res.value = 'NoProfessor'
    }
    //console.log(res)
    return res
}

//<------------------Faculty-------------------------->

// info = (faculty_id:'F100')
//return : faculty{...}
async function getCourseList(info){
    info.username = info.username.toUpperCase()
    if(!isConnected){
        await connect();
    }
    let res = {}
    //console.log('In getCourseList')
    let result = await db.execute(`select course_id,title,dept_name,semester,section
                                    from ((((select * from takes
                                            where faculty_id='${info.username}') 
                                            inner join course_list 
                                                using (list_id))
                                            inner join department 
                                                using (dept_id))
                                            inner join course
                                                using (course_id))
                                `)
    if(result.rows[0]){
        res = result
        res.error = false
    }
    else{
        res = {error:true,value:'NoCourseTaught'}
    }
    //console.log(res)
    return res
}

//info = faculty{...}
//return : {list_id,dept_id}
async function checkCourseList(info){
    info.username = info.username.toUpperCase()
    if(!isConnected){
        await connect();
    }
    let res = {}
    let result = await db.execute(`select * from
                                    (select list_id,dept_id,semester,title
                                        from 	((((select * from course_list where course_id='${info.course_id}')
                                        inner join 
                                        (select * from department where dept_name='${info.dept_name}') 
                                        using (dept_id))
                                        inner join
                                        (select list_id from takes
                                            where faculty_id = '${info.username}' and section='${info.section}')
                                            using (list_id))
                                        inner join
                                        (select course_id,semester,title from course)
                                        using (course_id))
                                    )
                                `)
    if(result.rows[0]){
        res.error = false
        res.list_id = result.rows[0][0]
        res.dept_id = result.rows[0][1]
        res.semester = result.rows[0][2]
        res.title = result.rows[0][3]
    }
    else{
        res = {error:true}
    }
    //console.log(res)
    return res
}

//info = faculty{...}+dept_id+sem
async function getStudentBySem(info){
    if(!isConnected){
        await connect();
    }
    let res = []

    let result = await db.execute(`select usn from student  where semester = ${info.semester}
                                    and section = '${info.section}' and dept_id='${info.dept_id}'
                                `)
    //console.log(result)            
    if(result.rows[0]){
        for(let i=0 ; i<result.rows.length;i++){
            res.push(result.rows[i][0])
        }
    }
    //console.log(236,res) 
    return res                           
}

//info = faculty{...}+dept_id
async function getStudentResult(info){
    if(!isConnected){
        await connect();
    }
    let res = {}
    //console.log(266,info)
    let result = await db.execute(`select *
                                    from   (select usn,name from student where semester = ${info.semester} and section = '${info.section}' and dept_id='${info.dept_id}')
                                            inner join
                                            (select * from results where course_id='${info.course_id}')
                                            using (usn)
                                `)
    if(result.rows[0]){
       res=result
       res.error = false
    }
    else{
        res = {error:true,value:'NoCourseStudent'}
    }
    //console.log(280,res)
    return res
}

//info = faculty{...}+dept_id+{course_id:'18CS54', newMarks=[usn,name,.....] }
async function updateResult(info){
    if(!isConnected){
        await connect();
    }
    try{
        info.usn
    }
    catch{
        return {error:false}
    }

    let res = {value:[]}
    let student = await getStudentBySem(info)
    //console.log(student)
    if(student == []){
        return ({error:true,value:'NoCourseStudent'})
    }
    //console.log(273,student)
    let metaData=['TEST1_MARKS','TEST1_ASSIGNMENT','TEST2_MARKS','TEST2_ASSIGNMENT','TEST3_MARKS','TEST3_ASSIGNMENT','IA_MARKS']
    /*let query = ''
    for(i in info.newMarks){
        query = ''
        if(student.includes(i)){
            for(c in info.newMarks[i])
                query += c+'='+info.newMarks[i][c]+', '
            query = query.replace(/, $/,'')
            try {
                result = await db.execute(`update results set ${query} where usn='${i}' and course_id = '${info.course_id}'`)
            }
            catch {
                res.value.push({usn:i,value:'UpdateError'})
            }
        }
        else{
            res.value.push({usn:i,value:'Student not listed in your class'})
        } 
    } */  
    for(i = 0 ; i<info.newMarks.length;i++){
        query = ''
        s = info.newMarks[i]

        if(student.includes(s[0])){
            for(c=0 ; c<metaData.length ; c++)
                query += metaData[c]+'='+ s[c+3]+', '
            query = query.replace(/, $/,'')
            //console.log(`update results set ${query} where usn='${s[0]}' and course_id = '${info.course_id}'`)
            try {
                result = await db.execute(`update results set ${query} where usn='${s[0]}' and course_id = '${info.course_id}'`)
                //console.log('updated sucessfully')
            }
            catch {
                res.value.push({usn:s[0],value:'UpdateError'})
            }
        }
        else{
            res.value.push({usn:s[0],value:'Student not listed in your class'})
        } 
    } 
    db.execute('commit')
    return res
}

//info = faculty{...}+dept_id
async function getStudentFromCourse(info){
    if(!isConnected){
        await connect();
    }
    
    stud = await getStudentBySem(info)
    s = ''
    for(i=0;i<stud.length;i++){
       // console.log(356,s)
        s += `'${stud[i]}', `
    }
    
    s = s.replace(/,\s*$/,'')
    let res = {value:[]}
    
    console.log(363,s)
    if(s== '')
        return {error:true}
    result = await db.execute(`select usn,name,semester,batch,contact
                                from (select * from results where course_id='${info.course_id}' and usn in (${s}) ) 
                                inner join student using(usn)
                                `)
    if(result.rows[0]){
        res = result
        res.error = false
        res.studentBySem = stud
    }
    else{
        res.error = true
    }
    return res
}
//info = {course_id:'18CS54', usn : ['s1',s2'...]}
async function addStudentToCourse(info){
    if(!isConnected){
        await connect();
    }
    try{
        info.usn
    }
    catch{
        return {error:false}
    }
    let res = {value:[]}
 
    for(let i=0 ; i<info.usn.length; i++){
       
        try {
            await db.execute(`insert into results(usn,course_id) values('${info.usn[i]}','${info.course_id}')`)
        }
        catch {
            res.value.push({usn:info.usn[i],value:'InsertError'})
        }
        
    }
    db.execute('commit')
    console.log(res)
    return res
}

//info = faculty{...}+dept_id+{course_id:'18CS54', usn : ['s1',s2'...]}
async function removeStudentFromCourse(info){
    if(!isConnected){
        await connect();
    }

    try{
        info.usn
    }
    catch{
        return {error:false}
    }

    let res = {value:[]}
    let student = await getStudentBySem(info)

    if(student == []){
        return ({error:true,value:'NoCourseStudent'})
    }
    //console.log(273,student)
    if(student.includes(info.usn)){
        try {
            await db.execute(`delete from results where usn='${info.usn}' and course_id='${info.course_id}'`)
        }
        catch {
            res.value.push({usn:info.usn[i],value:'Deletion Error'})
        }
    }
    else{
        res.value.push({usn:info.usn[i],value:'Student not listed in your class'})
    } 
    /*
    for(let i=0 ; i<info.usn.length; i++){
        if(student.includes(info.usn[i])){
            try {
                await db.execute(`delete from results where usn='${info.usn[i]}' and course_id='${info.course_id}'`)
            }
            catch {
                res.value.push({usn:info.usn[i],value:'InsertError'})
            }
        }
        else{
            res.value.push({usn:info.usn[i],value:'Student not listed in your class'})
        } 
    }*/
    db.execute('commit')
    return res
}

module.exports = {
    authentication,
    tokenAuthentication,
    getInfo,
    getResults,
    getProfessorContact,
    getCourseList,
    getStudentBySem,
    getStudentFromCourse,
    checkCourseList,
    getStudentResult,
    updateResult,
    addStudentToCourse,
    removeStudentFromCourse
}