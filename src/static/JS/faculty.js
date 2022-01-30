async function getCourseList(){
    var user = {
        'username' : sessionStorage.getItem('username'),
        'token' : sessionStorage.getItem('token')
    }
    var res = await axios.post('/faculty/course-list',user)
    if(res.data.error){
        console.log(res.data)   
        let d = document.createElement('div')
        d.innerHTML = res.data.value
        d.style.color = 'red'
        document.getElementById('error-log').append(d)        
    }
    else{
            for(let i=0; i < res.data.metaData.length ; i++)
            {
                courseList.metaData[res.data.metaData[i].name] = i;
            }
            courseList.rows = res.data.rows
            if(sessionStorage.getItem('COURSE_ID') !== null){
                curInfo.course_id = sessionStorage.getItem('COURSE_ID')
                curInfo.section = sessionStorage.getItem('SECTION')
                curInfo.dept_name = sessionStorage.getItem('DEPT_NAME')
            }
            else if(courseList.rows.length > 0){
                curInfo.course_id = courseList.rows[0][courseList.metaData['COURSE_ID']]
                curInfo.section = courseList.rows[0][courseList.metaData['SECTION']]
                curInfo.dept_name = courseList.rows[0][courseList.metaData['DEPT_NAME']]
            }
        }
        
}


async function createTable(info,alist,rlist,rootEle){
    rootEle.innerHTML = ''
    document.getElementById('error-log').innerHTML = ''

    var colPos = []
    var tempColPos = []
    var table = document.createElement('tbody')
    let headerSize = info.headerSize
    let orgColList = []
    let colNewValue = []

    let tr = document.createElement('tr')
    let tr2 =  document.createElement('tr')
    let j=0;
    for(let i=0; i < alist.length; i++)
    {
        orgColList.push(alist[i])
        let th = document.createElement('th')

        th.colSpan = alist[i][1].colSpan
        th.rowSpan = alist[i][1].rowSpan    
        th.innerHTML = alist[i][1].name
        th.id = alist[i][1].name.toUpperCase()

        if(alist[i][1].colSpan > 1){
            count = 0;
            totalColSpan = alist[i][1].colSpan
            idHeader = alist[i][1].name.toUpperCase()
            
            while(totalColSpan > count)
            {
                count++
                let th2 = document.createElement('th')
                orgColList.push(alist[i+count])
                th2.id = idHeader + ':' + alist[i+count][1].name.toUpperCase()
                th2.innerHTML = alist[i+count][1].name
                if(typeof rlist.metaData[alist[i+count][0]] == 'undefined')
                    rlist.metaData[alist[i+count][0]] =  Object.keys(rlist.metaData).length
                colPos.push(rlist.metaData[alist[i+count][0]])
                tr2.append(th2)
            }
            alist.splice(i,1)
            j++
            i = i+count
            i--
        }
        else{
            if(typeof rlist.metaData[alist[i][0]] == 'undefined')
                rlist.metaData[alist[i][0]] =  Object.keys(rlist.metaData).length
            colPos.push(rlist.metaData[alist[i][0]])
        }
       
        tr.append(th)      
    }
    
    table.append(tr)
    if(tr2.childNodes.length > 0){
        table.append(tr2)
    }
    var priColPos  = rlist.metaData[info.primary_col]
    for(let i=0 ; i<rlist.rows.length;i++){
        let tr = document.createElement('tr')
        tr.id = rlist.rows[i][priColPos]
        for(let j=0 ; j<colPos.length; j++){
            
            let td = document.createElement('td')
            
            if(alist[j][1].isSlNo){
                rlist.rows[i][colPos[j]] = i+1
            }
            else if(alist[j][1].isdefault){
                rlist.rows[i][colPos[j]] = alist[j][2].default
            }
            
            let div = document.createElement('div')
            if(alist[j][1].isClickable){
                div.className = div.className + ' anchor'
                div.onclick = alist[j][2].f
                rlist.rows[i][colPos[j]] = alist[j][2].value
            }   
            div.innerHTML = rlist.rows[i][colPos[j]]
            td.append(div)
            
            tr.append(td)
        }
        table.append(tr)
    }


    //Additional options
    tableEle = document.createElement('table')
    tableEle.className = 'table-list'
    tableEle.append(table)
    rootEle.append(tableEle)
    
} 


async function dropDownOptions(){
    dept_name = document.getElementById('d_dept_name')
    dept_name.innerHTML = ''
    tDept = {}
    count = []
    DeptNo = courseList.metaData['DEPT_NAME']
    for(i=0 ;i<courseList.rows.length ; i++){
        if(tDept[courseList.rows[i][DeptNo]])
            continue
        else
        {
            tDept[courseList.rows[i][DeptNo]] = true
            count.push(courseList.rows[i])
        }
    }
    for(i = 0;i<count.length;i++){
        let d = document.createElement('option')
        d.value = count[i][DeptNo]
        d.innerHTML = count[i][DeptNo]
        dept_name.append(d)
    }
    if(typeof curInfo.dept_name == 'undefined')
    {
        curInfo.dept_name = count[0][DeptNo]
        dept_name.value = count[0][DeptNo]  
    }
    else
    {
        dept_name.value = curInfo.dept_name
    }
    dropDownCourse()

    dept_name.addEventListener('change',async function(e){
        e.preventDefault()
        curInfo.dept_name = e.target.value
        curInfo.course_id = undefined
        curInfo.section = undefined
        dropDownCourse()
    })

    course_id = document.getElementById('d_course_id')
    course_id.addEventListener('change',async function(e){
        e.preventDefault()
        curInfo.course_id = e.target.value
        curInfo.section = undefined
        dropDownSection()
    })

    section = document.getElementById('d_section')
    section.addEventListener('change',async function(e){
        e.preventDefault()
        curInfo.section = e.target.value
    })
    
}

async function  dropDownCourse(){
    course_id = document.getElementById('d_course_id')
    course_id.innerHTML = ''
    tCourse = {}
    count = []
    DeptNo = courseList.metaData['DEPT_NAME']
    CouNo = courseList.metaData['COURSE_ID']
    for(i=0 ;i<courseList.rows.length ; i++){
        if(courseList.rows[i][DeptNo] == curInfo.dept_name){
            if(tCourse[courseList.rows[i][CouNo]])
                continue
            else
            {
                tCourse[courseList.rows[i][CouNo]] = true
                count.push(courseList.rows[i])
            }
        }
    }
    
    for(i = 0;i<count.length;i++){
        let d = document.createElement('option')
        d.value = count[i][CouNo]
        d.innerHTML = count[i][CouNo]
        course_id.append(d)
    }

    if(typeof curInfo.course_id == 'undefined')
    {
        curInfo.course_id = count[0][CouNo]
        course_id.value = count[0][CouNo]  
    }
    else
    {
        course_id.value = curInfo.course_id
    }
    dropDownSection()
}
  
async function dropDownSection(){
    section = document.getElementById('d_section')
    section.innerHTML = ''
    tSec = {}
    count = []
    DeptNo = courseList.metaData['DEPT_NAME']
    CouNo = courseList.metaData['COURSE_ID']
    SecNo = courseList.metaData['SECTION']

    for(i=0 ;i<courseList.rows.length ; i++){
        if(courseList.rows[i][DeptNo] == curInfo.dept_name && courseList.rows[i][CouNo] == curInfo.course_id){
            if(tSec[courseList.rows[i][SecNo]])
                continue
            else
            {
                tSec[courseList.rows[i][SecNo]] = true
                count.push(courseList.rows[i])
            }
        }
    }

    for(i = 0;i<count.length;i++){
        let d = document.createElement('option')
        d.value = count[i][SecNo]
        d.innerHTML = count[i][SecNo]
        section.append(d)
    }

    if(typeof curInfo.section == 'undefined')
    {
        curInfo.section = count[0][SecNo]
        section.value = count[0][SecNo]  
    }
    else
    {
       section.value = curInfo.section
    }
  
}