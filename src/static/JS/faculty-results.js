async function findDependentColumn(depCol,formula){
    let pat = /[^(]*\([^()]+\)/gi
    while(formula !== '#x'){
        opr = formula.match(pat,1)[0]
        arg = opr.match(/\(([^()]+)\)/)
        c = arg[1].split(/\s*,\s*/)
        for(i in c){
            if(c[i].toUpperCase().startsWith('C')){
                col = c[i].match(/[0-9]+/)[0]
                depCol[parseInt(col)-1] = true       
            }   
        }
        formula = formula.replace(pat,'#x')
    }
}

async function formulaOption(i,t,p,th,info,orgColList,alist,rlist,colPos,tempColPos,rootEle){
    if(typeof rlist.metaData[alist[i][0]] == 'undefined'){
        rlist.metaData[alist[i][0]] = Object.keys(rlist.metaData).length
        tempColPos.push({pos:colPos.length,value:alist[i][2],isUndefined:true})
    }
    else if(alist[i][1].hasFormula){
        if(alist[i][2].isFormulaChanged){ 
            tempColPos.push({pos:p,value:alist[i][2],isChanged:true})
        }
        else{
            tempColPos.push({pos:p,value:alist[i][2]})
        }
    }  
    if(alist[i][1].hasFormula){
            d =  document.createElement('div')
            d.className = 'column-input'
            d.style.visibility = 'hidden'
            d.innerHTML = `=<input type='text'>
                            <button  type='submit' onclick="//console.log('formula update')">
                                <img  src='static/icons/enter.png'>
                            </button>`
           
            th.append(d) 
            th.addEventListener('click',function(e){
                toggleVisibility(th.childNodes[1])
             
            })
            th.childNodes[1].addEventListener('click',function(e){
                e.stopPropagation()
            })
            th.childNodes[1].getElementsByTagName('input')[0].value = alist[i][2].formula
            
            th.childNodes[1].getElementsByTagName('button')[0].onclick = async function(e){
                newFormula = th.childNodes[1].getElementsByTagName('input')[0].value

                if(orgColList[t][2].formula !== newFormula){
                    orgColList[t][2].formula = newFormula
                    orgColList[t][2].isFormulaChanged = true
                    await createTableOperation(info,orgColList,rlist,rootEle)
                }   

            }
    }
}


async function saveResults(rlist){
    var user = {
        'username' : sessionStorage.getItem('username'),
        'token' : sessionStorage.getItem('token'),
        'course_id' : curInfo.course_id,
        'dept_name' : curInfo.dept_name,
        'section' : curInfo.section,
        newMarks : rlist.rows
    }
    var res = await axios.post('/faculty/update-marks',user)
    //console.log(res.data)
    renderResultList()
}

 //alist=[[db_attribute_name ,alias{name,rowspan,colspan,isMain},row_html={tagType:'div',pattern:''},callback()],.. ]
//rlist = {metaData: {}, rows: [[]]}
//linkCol = { name : col_name,column_pos , keyPos:[],link:'http..'}

async function createTableOperation(info,alist,rlist,rootEle){
    rootEle.innerHTML = ''
    console.log(rlist)
    var colPos = []
    var priColPos  = rlist.metaData[info.primary_col]
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
                await formulaOption(i+count,i+count+j,i+count-1,th2,info,orgColList,alist,rlist,colPos,tempColPos,rootEle)
                
                colPos.push(rlist.metaData[alist[i+count][0]])
                tr2.append(th2)

            }
            alist.splice(i,1)
            j++
            i = i+count
            i--
        }
        else{
            await formulaOption(i,i+j,i,th,info,orgColList,alist,rlist,colPos,tempColPos,rootEle)
            
            colPos.push(rlist.metaData[alist[i][0]])
        }
       
        tr.append(th)
        
    }
    
    table.append(tr)
    if(tr2.childNodes.length > 0){
        table.append(tr2)
    }
   
    for(let i=0 ; i<rlist.rows.length;i++){
        let tr = document.createElement('tr')
        tr.id = rlist.rows[i][priColPos]
        for(let j=0 ; j<colPos.length; j++){
            let td = document.createElement('td')
           
            let colValue = rlist.rows[i][colPos[j]]
            if(colValue < -1){
                colValue = ''
            }
            
            if(alist[j][2].tagType == 'input'){
                let input = document.createElement('input')
                
                if(colValue == -1){
                    colValue = 'AB'
                    input.style.color =  'rgb(168, 32, 14)'
                }
                input.type = 'text'
                input.pattern = alist[j][2].pattern

                input.setAttribute('value' ,colValue)
                input.addEventListener('input',function(e) {
                    e.preventDefault();
                   
                    if(input.value == '-1')
                    {
                        rlist.rows[i][colPos[j]] = -1
                        input.value = 'AB'
                        input.style.color = 'red'
                    }
                    else if(input.value.trim() == ''){
                        rlist.rows[i][colPos[j]] = -2
                        input.value = ''
                    }
                    else{
                        rlist.rows[i][colPos[j]] = parseInt(input.value)
                    }

                    e.target.parentElement.style.border = "1px solid red"
                    e.target.style.color = 'red'
                    }
                )
                td.append(input)
            }
            else{
                let div = document.createElement('div')
                if(colValue == -1){
                    colValue = 'AB'
                    div.style.color =  'rgb(168, 32, 14)'
                }
                div.innerHTML = colValue
                td.append(div)
            }
            tr.append(td)
        }
        table.append(tr)
    }

    
    let depColList = {}
    for(k=0 ;k<alist.length;k++){

        if(alist[k][1].hasFormula){
            if(alist[k][2].isFormulaChanged){ 
                depColList[k] = true
                alist[k][2].isFormulaChanged = false
            }
        } 
    }
    for(let i=0; i < tempColPos.length; i++){ 
        let depCol = {}
        findDependentColumn(depCol,tempColPos[i].value.formula)
       
        for(k in depCol){
            if(depColList[k]){
                tempColPos[i].isChanged=true
                break
            }
        }
        
        for(let j=0; j < rlist.rows.length; j++){
            let tr = table.childNodes[j+headerSize]
            
            if(tempColPos[i].isUndefined){
                rlist.rows[j][colPos[tempColPos[i].pos]] = await mathRowOperations(tempColPos[i].value.formula,colPos,rlist.rows[j])
            }
            else if(tempColPos[i].isChanged){
                rlist.rows[j][colPos[tempColPos[i].pos]] = await mathRowOperations(tempColPos[i].value.formula,colPos,rlist.rows[j])
                tr.childNodes[tempColPos[i].pos].style.border = '1px solid red'
                tr.childNodes[tempColPos[i].pos].childNodes[0].style.color = 'red'
            }
            
            for(k in depCol){
                tr.childNodes[k].childNodes[0].oninput = async function (e){
                    rlist.rows[j][colPos[tempColPos[i].pos]] = await mathRowOperations(tempColPos[i].value.formula,colPos,rlist.rows[j])
                    tr.childNodes[tempColPos[i].pos].childNodes[0].value = rlist.rows[j][colPos[tempColPos[i].pos]];
                    tr.childNodes[tempColPos[i].pos].childNodes[0].dispatchEvent(new Event('input'));
                    tr.childNodes[tempColPos[i].pos].style.border = '1px solid red'
                    tr.childNodes[tempColPos[i].pos].childNodes[0].style.color = 'red'
                }  
            }

            if(rlist.rows[j][colPos[tempColPos[i].pos]] >= 0)
                tr.childNodes[tempColPos[i].pos].childNodes[0].value = rlist.rows[j][colPos[tempColPos[i].pos]];
            else if(rlist.rows[j][colPos[tempColPos[i].pos]] == -1)
                tr.childNodes[tempColPos[i].pos].childNodes[0].value = 'AB'
            else
                tr.childNodes[tempColPos[i].pos].childNodes[0].value = ''
        }
    }
    
    tableEle = document.createElement('table')
    tableEle.className = 'table-list'
    tableEle.append(table)
    rootEle.append(tableEle)

    tabelOption = document.createElement('div')
    tabelOption.className = 'button-list'
    
    sdiv = document.createElement('div')
    saveButton = document.createElement('button')
    saveButton.innerHTML = 'save'
    saveButton.addEventListener('click' ,async function(e){
        e.preventDefault()
        saveResults(rlist)
    })
    sdiv.append(saveButton)
    tabelOption.append(sdiv)

    ediv = document.createElement('div')
    exportButton = document.createElement('button')
    exportButton.innerHTML = 'export'
    exportButton.addEventListener('click' ,async function(e){
        e.preventDefault()
        exportData2(orgColList,rlist)
    })
    ediv.append(exportButton)
    tabelOption.append(ediv)

    let impdiv = document.createElement('div')
    id = await randomString(10)
    impdiv.innerHTML = `<label for='${id}'>import</label>`
    impInput = document.createElement('input')
    impInput.type = 'file'
    impInput.id = id
    impInput.style.display='none'
    impInput.addEventListener('change', async function (){
       
        var fr = new FileReader()
        fr.onload =  async function(){
            await importData(info,orgColList,colPos,rlist,fr.result)
        }
        fr.readAsText(impInput.files[0])
        impInput.value = null
    })
    impdiv.append(impInput)
    tabelOption.append(impdiv)
    rootEle.append(tabelOption)
    
} 
            
async function mathRowOperations(formula,colPos,values){
               
    let pat = /[^(]*\([^()]+\)/gi
    x=0
    while(formula !== '#x'){
        opr = formula.match(pat,1)[0]

        arg = opr.match(/\(([^()]+)\)/)
        c = arg[1].split(/\s*,\s*/)
         t = 0
        if(opr == '(#x)'){
            formula = formula.replace(pat,"#x")
            continue;
        }

        if(opr.toUpperCase().startsWith('SCALE')){
            if(c.length != 3) 
                return 'Argument Error : SCALE() takes three arguments (obtained , out-of, scale-to )'
            multipler = parseInt(c.pop())
            total = parseInt(c.pop())
            if(c[0].toUpperCase().startsWith('C')){
                col = c[i].match(/[0-9]+/)[0]
                
                x = values[colPos[parseInt(col)-1]]
            }
            else if(c[0] == '#x') 
                x = x * multipler / total
            else
                x = parseInt(c[0]) * multipler / total
      
            formula = formula.replace(pat,"#x")
            continue
        }
        else if(opr.toUpperCase().startsWith('CEIL')){
            if(c.length != 1){
                return 'Argument Error : CEIL() takes only one Arugment'
            }
            if(c[0].toUpperCase().startsWith('C')){
                col = c[i].match(/[0-9]+/)[0]
                x = Math.ceil(values[colPos[parseInt(col)-1]])
            }
            else if(c[0] == '#x') 
                x = Math.ceil(x)
            else
                x = Math.ceil(parseInt(c[0]))
      
            formula = formula.replace(pat,"#x")
            continue
        }

        for(i in c){
            if(c[i].toUpperCase().startsWith('C')){
                col = c[i].match(/[0-9]+/)[0]
                if(!Number.isNaN(parseInt(values[colPos[parseInt(col)-1]])) && parseInt(values[colPos[parseInt(col)-1]]) > 0 ){
                    t += values[colPos[parseInt(col)-1]]
                }
                   
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

        if(opr.toUpperCase().startsWith('SUM')){
            formula = formula.replace(pat,"#x")
        }
        else if(opr.toUpperCase().startsWith('AVG'))
        {
            x = x/c.length
            formula = formula.replace(pat,"#x")
        }
        else{
            return 'Formula Error'
        }
    
    }
   
    return x
}

async function exportData2(orgColList,rlist){
    var str = ''
    let colPos = []
    for(i=0;i<orgColList.length;i++){
        
        if(orgColList[i][1].colSpan > 1){
            count = 0 
            while(count < orgColList[i][1].colSpan){
                count++
                str += ',' + orgColList[i][1].name + ':' + orgColList[i+count][1].name
                colPos.push(rlist.metaData[orgColList[i+count][0]])
            }
            i = i+count
        }
        else{
            str += ',' + orgColList[i][1].name
            colPos.push(rlist.metaData[orgColList[i][0]])
        }
    }
    str = str.substring(1)
    str = `Course:,${curInfo.course_id},2Department:,${curInfo.dept_name},Section:,${curInfo.section}\n` + str
    console.log(colPos)

    for(let i=0 ;i <rlist.rows.length ; i++){
        str += '\n'+ rlist.rows[i][colPos[0]]
        for(let j=1 ; j< colPos.length ; j++)
            if(rlist.rows[i][colPos[j]] == -1)
                str += ',' + 'AB'
            else if (rlist.rows[i][colPos[j]] >= 0)
                str += ',' + rlist.rows[i][colPos[j]]
            else 
                str += ',' + rlist.rows[i][colPos[j]]
    }

    a = document.createElement('a')
    a.href = 'data:text/plain;charset=utf-8,'+encodeURIComponent(str)
    a.download = `${curInfo.course_id}-${curInfo.dept_name}-${curInfo.section}.csv`
    a.click()
}
         
async function importData(info,orgColList,orgColPos,rlist,imptext){
    vlist = imptext.match(/([^\n\r]+)/ig)
    let colName = []
    let j = 0
    for(i=0;i<orgColList.length;i++){  
        if(orgColList[i][1].colSpan > 1){
            count = 0 
            ++j
            while(count < orgColList[i][1].colSpan){
                count++
                colName[orgColList[i][1].name + ':' +orgColList[i+count][1].name] = i+count - j
            }
            i = i+count
        }
        else{
            colName[orgColList[i][1].name] = i - j
        }
    }

    let colPos = []
    let c = 0
    while(true){
        col = vlist[c++];
        if(col.startsWith(info.primary_col)){
            a = col.split(',')
            for(i=0; i < a.length ; i++){
                if(typeof colName[a[i].trim()] !== 'undefined')
                    colPos.push(colName[a[i].trim()])
            }
            break
        }
    }

    index = rlist.metaData[info.primary_col]
    for(i=c ; i<vlist.length ; i++){
        a = vlist[i].split(',')
        let r = -1
        tr = document.getElementById(a[0])
        for(k=0 ; k<rlist.rows.length ; k++){
            if(rlist.rows[k][index] == a[0].toUpperCase()){
                r = k
                break;
            }
        }
        if(tr == null || r < 0)
        {
            continue;
        }
        console.log(a)
        for(j=1;j<colPos.length;j++){
            console.log(a[j],rlist.rows[r][orgColPos[colPos[j]]])
            if(typeof a[j] == 'undefined' || Number.isNaN(parseInt(a[j]))){
                if(a[j].trim().toUpperCase() == 'AB'){
                    if( rlist.rows[r][orgColPos[colPos[j]]] == -1)
                        continue
                    td = tr.childNodes[colPos[j]]
                    inp = td.getElementsByTagName('input')[0]
                    inp.value = a[j]
                    inp.style.color = 'red'
                    td.style.border = '1px solid red'
                    rlist.rows[r][orgColPos[colPos[j]]] = -1
                }
                    
                continue;
            }
            if( rlist.rows[r][orgColPos[colPos[j]]] == parseInt(a[j]))
                continue
            td = tr.childNodes[colPos[j]]
            inp = td.getElementsByTagName('input')[0]
            inp.value = a[j]
            inp.style.color = 'red'
            td.style.border = '1px solid red'
            
            rlist.rows[r][orgColPos[colPos[j]]] = parseInt(a[j])
            
        }
    }
}


        