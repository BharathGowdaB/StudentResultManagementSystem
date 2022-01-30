

async function addStudent(){
    inp = document.getElementById('add-student').getElementsByTagName('input')[0]
    text = inp.value
    inp.value=''
    text = text.trim()
    text = text.toUpperCase()
    let usn = []
    let user = {
        'username' : sessionStorage.getItem('username'),
        'token' : sessionStorage.getItem('token'),
        'course_id' : curInfo.course_id,
        'dept_name' : curInfo.dept_name,
        'section' : curInfo.section,
    }

    if(text.startsWith('ALL')){
        usn = courseList.studentBySem
        user.addAll = true
    }
    else{
        slist = text.split(';')
        for(i=0;i<slist.length;i++){
            s = slist[i].trim()
            usn.push(s)
        }
    }
    user.usn = usn
    if(usn[usn.length-1] == '')
        usn.pop()
    
    var res = await axios.post('/faculty/add-student',user)
    console.log(res.data)
    if(res.data.value){
        if(res.data.value.length > 0){
            errorlog = document.getElementById('error-log')
            for(i=0 ;i < res.data.value.length ; i++){
                let d = document.createElement('div')
                d.innerHTML = res.data.value[i].usn + '\t : \t' +res.data.value[i].value
                d.style.color = 'red'
                errorlog.append(d)
            }
        }
    }
    renderStudentList() 
}

async function removeStudent(usn){
    let user = {
        'username' : sessionStorage.getItem('username'),
        'token' : sessionStorage.getItem('token'),
        'course_id' : curInfo.course_id,
        'dept_name' : curInfo.dept_name,
        'section' : curInfo.section,
        'usn' : usn
    }
    var res = await axios.post('/faculty/remove-student',user)
    console.log(res.data)
    if(res.data.value){
        if(res.data.value.length > 0){
            errorlog = document.getElementById('error-log')
            for(i=0 ;i < res.data.value.length ; i++){
                let d = document.createElement('div')
                d.innerHTML = res.data.value[i].usn + '\t : \t' +res.data.value[i].value
                d.style.color = 'red'
                errorlog.append(d)
            }
        }
    }
    renderStudentList()
}

async function getStudentList(){
    var user = {
        'username' : sessionStorage.getItem('username'),
        'token' : sessionStorage.getItem('token'),
        'course_id' : curInfo.course_id,
        'dept_name' : curInfo.dept_name,
        'section' : curInfo.section
    }
    var res = await axios.post('/faculty/get-students',user)
    if(res.data.error){
        console.log(res.data)
        studentList.rows = []
    }
    else{
        for(let i=0; i < res.data.metaData.length ; i++)
        {
            studentList.metaData[res.data.metaData[i].name] = i;
        }
        studentList.rows = res.data.rows
        courseList.studentBySem = res.data.studentBySem
    }
}