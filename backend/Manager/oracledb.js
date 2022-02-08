const e = require('express');
const oracledb = require('oracledb')
const manager = require('./manager');
const fs = require('fs')
var db 
var isConnected = false


connect();

async function connect(){
    try{
        db = await oracledb.getConnection({user : "dbms",password : "2310"});
        isConnected=true;
    }
    catch(err){
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
    if(result.rows[0]){
        let row = result.rows[0]
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
    return res
}

async function tokenAuthentication(user){
    user.username = user.username.toUpperCase()
    if(!isConnected){
        await connect();
    }
    let res = {}
    var result = await db.execute(`select token,token_fail,type from user_login where user_id='${user.username}'`)
    if(result.rows.length < 1)
        return {token:'',type:'',error:true,value:'NoRecord'}
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
        result = await db.execute(`select name,photo_container,contact from faculty where faculty_id='${user.username}'`)
        res['name'] = result.rows[0][0]
        res['photo_container'] = result.rows[0][1]
        res['contact'] = result.rows[0][2]
    }
    return res
}

async function createPhotoContainer(username,type){
    if(!isConnected){
        await connect();
    }
    var res = manager.randomString(10)
    try{
        if(type==manager.AccountTypeInv['student']){
            await db.execute(`update student set photo_container='${res}' where usn='${username.toUpperCase()}'`)
            await fs.mkdir(manager.path.private+'\\'+res,false,async (err) => {
                if(err)
                return true
            });
        }      
        else{
            await db.execute(`update faculty set photo_container='${res}' where faculty_id='${username.toUpperCase()}'`)
            await fs.mkdir(manager.path.public+'\\'+res,false,async (err) => {
                if(err)
                    return true
            });
        }
        await db.execute('commit')
    }
    catch(error){
        //console.log(error)
        //res = createPhotoContainer(username,type)
    }
    return res
}
//<------------------Admin---------------------------->

async function createAccount(info){
    if(!isConnected){
        await connect();
    }
    try{
        if(info.type == 'student'){     
            photo = await createPhotoContainer(info.id.toUpperCase(),manager.AccountTypeInv['student'])
            await db.execute(`insert into user_login(user_id,password,type,token) 
                values('${info.id.toUpperCase()}','${info.password}',2,'')`)
            await db.execute(`insert into student(usn,name,dept_id,batch,semester,section,contact,photo_container)
                 values('${info.id.toUpperCase()}','${info.name}','${info.department.toUpperCase()}',
                 ${info.batch},${info.semester},'${info.section.toUpperCase()}',${info.contact},'${photo}')`)
            
        }
        else if(info.type == 'faculty'){
            photo = await createPhotoContainer(info.id.toUpperCase(),manager.AccountTypeInv['faculty'])
            await db.execute(`insert into user_login(user_id,password,type,token) 
                values('${info.id.toUpperCase()}','${info.password}',1,'')`)
            await db.execute(`insert into faculty(faculty_id,name,contact,photo_container) 
                  values('${info.id.toUpperCase()}','${info.name}',${info.contact},'${photo}')`)      
        }
        else if(info.type == 'admin'){
            photo = await createPhotoContainer(info.id.toUpperCase(),manager.AccountTypeInv['faculty'])
            await db.execute(`insert into user_login(user_id,password,type,token) 
                values('${info.id.toUpperCase()}','${info.password}',0,'')`)
            await db.execute(`insert into faculty(faculty_id,name,contact,photo_container) 
                values('${info.id.toUpperCase()}','${info.name}',${info.contact},'${photo}')`)   
        }
        else if(info.type == 'department'){
            await db.execute(`insert into department(dept_id,hod_id,dept_name)
                values('${info.id.toUpperCase()}','${info.hod.toUpperCase()}','${info.name}')`)
        }
        else if(info.type == 'course'){
            await db.execute(`insert into course(course_id,title,semester,schema,credits,iselective)
                values('${info.id.toUpperCase()}','${info.title}',${info.semester},${info.schema},${info.credits},${info.iselective})`)
        
        }
        else{
            return {error:true,value: info.type + ' : Not valid'}
        }
        res = {error:false}
        await db.execute('commit')
    }
    catch (error){
        res = {error:true,value: info.type+' : Inertion was unsuccessful'}//,detail: error}
    }
    return res
}

async function getTableInfo(info){
    if(!isConnected){
        await connect();
    }
    let result
    try{
        if(info.type == 'student'){
            result = await db.execute(`select usn,name,password,contact,batch,dept_id,semester,section
                            from student s,user_login a
                            where s.dept_id='${info.department.toUpperCase()}' and s.semester=${info.semester} and s.section='${info.section.toUpperCase()}' and s.usn=a.user_id
                            order by usn`)
            
        }
        else if(info.type == 'faculty'){
            result = await db.execute(`select faculty_id,name,password,contact
                                from faculty f,user_login a
                                where type=1 and f.faculty_id=a.user_id
                                order by faculty_id`)

        }
        else if(info.type == 'admin'){
            result = await db.execute(`select faculty_id,name,password,contact
                                from faculty f,user_login a
                                where type=0 and f.faculty_id=a.user_id 
                                order by faculty_id`)
        }
        else if(info.type == 'department'){
            result = await db.execute(`select dept_id,dept_name,hod_id
                                from department 
                                order by dept_id`)
        }
        else if(info.type == 'course'){
            result = await db.execute(`select course_id,title,semester,credits,iselective,schema
                                        from course where schema=${info.schema} 
                                        order by course_id`)
        }
        else{
            return {error:true,value: info.type + ' : Not valid'}
        }
        res = result
        res['error'] =false
    }
    catch (error){
        res = {error:true,value: info.type+' : Search was unsuccessful'}//,detail: error}
    }
    return res
}

async function updateTableInfo(info){
    if(!isConnected){
        await connect();
    }
    let res = {}
    try{
        if(info.type == 'student'){
            
            await db.execute(`update user_login set password='${info.password}',type=${manager.AccountTypeInv[info.type]} where user_id='${info.usn}'`)
           
            await db.execute(`update student set name='${info.name}', batch=${info.batch}, dept_id='${info.dept_id.toUpperCase()}' ,
                        semester=${info.semester}, section='${info.section.toUpperCase()}',contact = ${info.contact} where usn='${info.usn}'`)
            
            
        }
        else if(info.type == 'faculty'){
            await db.execute(`update user_login set password='${info.password}',type=${manager.AccountTypeInv[info.type]} where user_id='${info.faculty_id}'`)
            await db.execute(`update faculty set name='${info.name}',contact=${info.contact} where faculty_id='${info.faculty_id}' `)

        }
        else if(info.type == 'admin'){
            await db.execute(`update user_login set password='${info.password}',type=${manager.AccountTypeInv[info.type]} where user_id='${info.faculty_id}'`)
            await db.execute(`update faculty set name='${info.name}',contact=${info.contact} where faculty_id='${info.faculty_id}' `)
        }
        else if(info.type == 'department'){
            await db.execute(`update department set dept_name='${info.dept_name}',hod_id='${info.hod_id.toUpperCase()}'
                            where dept_id='${info.dept_id}'`)
        }
        else if(info.type == 'course'){
            await db.execute(`update course set title='${info.title}',semester=${info.semester}, credits=${info.credits}, iselective = ${info.iselective},schema=${info.schema}
                            where course_id='${info.course_id}'`)
        }
        else{
            return {error:true,value: info.type + ' : Not valid'}
        }
        await db.execute('commit')
        res['error'] =false
    }
    catch (error){
        res = {error:true,value: info.type+' : update was unsuccessful'}//,detail: error}
    }
    return res
}

async function removeTableInfo(info){
    if(!isConnected){
        await connect();
    }
    let res = {}
    try{
        if(info.type == 'student'){
            await db.execute(`delete from user_login where user_id='${info.id}'`)  
        }
        else if(info.type == 'faculty'){
            await db.execute(`delete from user_login where user_id='${info.id}'`)  
        }
        else if(info.type == 'admin'){
            await db.execute(`delete from user_login where user_id='${info.id}'`)  
        }
        else if(info.type == 'department'){
            await db.execute(`delete from department where dept_id='${info.id}'`)  
        }
        else if(info.type == 'course'){
            await db.execute(`delete from course where user_id='${info.id}'`)  
       }
        else{
            return {error:true,value: info.type + ' : Not valid'}
        }
        await db.execute('commit')
        res['error'] =false
    }
    catch (error){
        res = {error:true,value: info.type+' : Removal was unsuccessful'}//,detail: error}
    }
    return res
}

async function getDepartment(){
    if(!isConnected){
        await connect();
    }
    let res = {}
    try{
        res.department = await db.execute(`select dept_id,dept_name,hod_id from department order by dept_id`)
        res.course = await db.execute(`select course_id,title from course order by course_id`)
        res.list = await db.execute(`select dept_id,course_id,title from course_list inner join course using(course_id) order by dept_id,course_id`)
        res.faculty = await db.execute(`select faculty_id,name from faculty order by faculty_id`)
        res.error = false
    }
    catch{
        res.error = true
    }
    return res
}

async function getDeptCourse(info){
    if(!isConnected){
        await connect();
    }
    let res = {}
    try{
        res = await db.execute(`select list_id,course_id,title,credits
                                from (select course_id,list_id from course_list where dept_id = '${info.dept_id.toUpperCase()}')
                                inner join (select * from course where semester=${info.semester}) using(course_id)
                                order by course_id`)
        res.error = false
    }
    catch{
        res.error = true
        res.value = 'No Course listed in department'
    }
    return res
}

async function removeDeptCourse(list_id){
    if(!isConnected){
        await connect();
    }
    let res = {}
    try{
        res = await db.execute(`delete from course_list where list_id = '${list_id}' `)
        res.error = false
        await db.execute('commit')
    }
    catch{
        res.error = true
        res.value = 'Removal of course-list was unsuccessful'
    }
    return res
}
async function addDeptCourse(info){
    if(!isConnected){
        await connect();
    }
    let res = {}
    info.list_id = manager.randomString(10)
    try{
        res = await db.execute(`insert into course_list(list_id,course_id,dept_id) values('${info.list_id}','${info.course_id.toUpperCase()}','${info.dept_id}') `)
        res.error = false
        await db.execute('commit')
    }
    catch{
        res.error = true
        res.value = 'Insertion of course-list was unsuccessful'
    }
    return res
}

async function getFacultyCourse(info){
    if(!isConnected){
        await connect();
    }
    let result = {}
    try{
        result = await db.execute(`select list_id,title,semester,section,faculty_id,name 
                        from (select list_id,course_id from course_list where course_id='${info.course_id.toUpperCase()}' and dept_id='${info.dept_id.toUpperCase()}')
                        inner join takes using(list_id) inner join faculty using(faculty_id) inner join course using(course_id) order by course_id`)
        result.error = false
    }
    catch{
        result.error = true
        result.value = 'Selected Course is not taught to any section'
    }
    return result
}
async function removeFacultyCourse(info){
    if(!isConnected){
        await connect();
    }
    let result = {}
    try{
        await db.execute(`delete from takes where list_id='${info.list_id}' and section='${info.section}'`)
        result.error = false
        await db.execute('commit')
    }
    catch{
        result.error = true
        result.value = 'Removal was unsucessful'
    }
    return result
}
async function addFacultyCourse(info){
    if(!isConnected){
        await connect();
    }
    let result = {}
    try{
        res = await db.execute(`select list_id from course_list where course_id='${info.course_id}' and dept_id='${info.dept_id}'`)
        if(res.rows[0])
            info.list_id = res.rows[0][0]
        else
            return {error:true,value:'Department-Course combination is not listed in course-list'}

        await db.execute(`insert into takes(list_id,faculty_id,section) values('${info.list_id}','${info.faculty_id}','${info.section.toUpperCase()}')`)
        result.error = false
        await db.execute('commit')
    }
    catch{
        result.error = true
        result.value = 'Insertion was unsucessful'
    }
    return result
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
                                            )
                                order by course_id`)
 
    if(result.rows[0]){
        res = result
        res.error = false
    }
    else{
        res = {error:true,value:'ResultNotUpdated'}
    }
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

    
    result = await db.execute(`(select name,contact,photo_container,course_id,title
                                from ((((select * from course_list where dept_id = '${user.dept_id}')
                                inner join (select course_id,title from course where semester = ${user.semester}) using(course_id))
                                inner join (select  * from  takes where section = '${user.section}') using(list_id))
                                inner join faculty using(faculty_id)))
                                order by course_id`)
    if(result.rows[0]){
        res = result
        res.error = false
    }
    else{
        res.error = true
        res.value = 'NoProfessor'
    }
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
    let result = await db.execute(`select course_id,title,dept_name,semester,section
                                    from ((((select * from takes
                                            where faculty_id='${info.username}') 
                                            inner join course_list 
                                                using (list_id))
                                            inner join department 
                                                using (dept_id))
                                            inner join course
                                                using (course_id))
                                order by course_id,section`)
    if(result.rows[0]){
        res = result
        res.error = false
    }
    else{
        res = {error:true,value:'NoCourseTaught'}
    }
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
    ////console.log(res)
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
    ////console.log(result)            
    if(result.rows[0]){
        for(let i=0 ; i<result.rows.length;i++){
            res.push(result.rows[i][0])
        }
    }
    ////console.log(236,res) 
    return res                           
}

//info = faculty{...}+dept_id
async function getStudentResult(info){
    if(!isConnected){
        await connect();
    }
    let res = {}
    let result = await db.execute(`select *
                                    from   (select usn,name from student where semester = ${info.semester} and section = '${info.section}' and dept_id='${info.dept_id}')
                                            inner join
                                            (select * from results where course_id='${info.course_id}')
                                            using (usn)
                                    order by usn
                                `)
    if(result.rows[0]){
       res=result
       res.error = false
    }
    else{
        res = {error:true,value:'NoCourseStudent'}
    }
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

    if(student == []){
        return ({error:true,value:'NoCourseStudent'})
    }

    let metaData=['TEST1_MARKS','TEST1_ASSIGNMENT','TEST2_MARKS','TEST2_ASSIGNMENT','TEST3_MARKS','TEST3_ASSIGNMENT','IA_MARKS','EXTERNAL_MARKS','TOTAL']
     
    for(i = 0 ; i<info.newMarks.length;i++){
        query = ''
        s = info.newMarks[i]

        if(student.includes(s[0])){
            for(c=0 ; c<metaData.length ; c++)
                query += metaData[c]+'='+ s[c+3]+', '
            query = query.replace(/, $/,'')
            
            try {
                result = await db.execute(`update results set ${query} where usn='${s[0]}' and course_id = '${info.course_id}'`)
            }
            catch(error) {
                res.value.push({usn:s[0],value:'Student Marks was not updated',detail:error})
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
        s += `'${stud[i]}', `
    }
    
    s = s.replace(/,\s*$/,'')
    let res = {value:[]}
    
    if(s== '')
        return {error:true}
    result = await db.execute(`select usn,name,semester,batch,contact,photo_container
                                from (select * from results where course_id='${info.course_id}' and usn in (${s}) ) 
                                inner join student using(usn) order by usn
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
        catch(error) {
            res.value.push({usn:info.usn[i],value:'Student was not added',detail:error})
        }
        
    }
    db.execute('commit')
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

    if(student.includes(info.usn)){
        try {
            await db.execute(`delete from results where usn='${info.usn}' and course_id='${info.course_id}'`)
        }
        catch(error) {
            res.value.push({usn:info.usn[i],value:'Removal of Student was unsucessful',detail:error})
        }
    }
    else{
        res.value.push({usn:info.usn[i],value:'Student not listed in your class'})
    } 
    db.execute('commit')
    return res
}

module.exports = {
    authentication,
    tokenAuthentication,
    getInfo,
    createPhotoContainer,

    createAccount,
    getTableInfo,
    updateTableInfo,
    removeTableInfo,
    getDepartment,
    getDeptCourse,
    removeDeptCourse,
    addDeptCourse,
    getFacultyCourse,
    removeFacultyCourse,
    addFacultyCourse,

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