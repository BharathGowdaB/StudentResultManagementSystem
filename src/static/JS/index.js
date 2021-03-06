async function randomString(length){
    var char = 'mlpoknjiuhbvgytfcdrxzsewaqAEQWSDRZXFTCGVYBHUNJIMKOLP_';
    var newString = '';
    for(var i = 0 ; i < length; i++){
        newString += char.charAt(Math.floor(Math.random() * 53));
    }       
    return newString;
}

function toggleVisibility(ele){
    if(ele.style.visibility == 'hidden')
        ele.style.visibility = 'visible'
    else
        ele.style.visibility = 'hidden'
}

function exportData(orgColList,rlist,curInfo){
    var str = ''
    let colPos = []
    for(i=0;i<orgColList.length;i++){
        
        if(orgColList[i][1].colSpan > 1){
            count = 0 
            while(count < orgColList[i][1].colSpan){
                count++
                if(orgColList[i][1].isOptional){
                    continue
                }
                str += ',' + orgColList[i][1].name + ':' + orgColList[i+count][1].name
                colPos.push(rlist.metaData[orgColList[i+count][0]])
            }
            i = i+count
        }
        else{
            if(orgColList[i][1].isOptional){
                continue
            }
            str += ',' + orgColList[i][1].name
            colPos.push(rlist.metaData[orgColList[i][0]])
        }
    }
    str = str.substring(1)
    str = `Course:,${curInfo.course_id},Department:,${curInfo.dept_name},Section:,${curInfo.section}\n` + str
  
    for(let i=0 ;i <rlist.rows.length ; i++){
        str += '\n'+ rlist.rows[i][colPos[0]]
        for(let j=1 ; j< colPos.length ; j++)
            str += ',' + rlist.rows[i][colPos[j]]
    }

    a = document.createElement('a')
    a.href = 'data:text/plain;charset=utf-8,'+encodeURIComponent(str)

    a.download = `${curInfo.course_id}-${curInfo.dept_name}-${curInfo.section}.csv`
    a.click()
}

document.getElementById('upload-pic').onchange = function(e){
    e.preventDefault();
    if(document.getElementById('upload-pic').value)
        changeProfilePic();
    document.getElementById('upload-pic').value = null;
}

async function changeProfilePic(){
    console.log('Profile changing..');
    var formdata = new FormData();
    var img = document.getElementById('upload-pic').files[0];
    formdata.append('Image',img);
    formdata.append('username',sessionStorage.getItem("username"));
    formdata.append('token',sessionStorage.getItem('token'));
    var flag = await axios.post('/home/set-userName',{'username':sessionStorage.getItem("username"),'token': sessionStorage.getItem("token")})
   
    if(flag.data.error){
        console.log(flag.data);
    }
    else{
        console.log(flag.data);
        var res = await axios.post(`/home/set-profile-pic`,formdata,{
            headers: {
                'Content-Type' : 'multipart/form-data'
            }
        });
        console.log(res.data)
        if(res.data.error){
            console.log(res.data.type);
        }
        else{
            console.log('no error');
            setProfilePic();
        }
    }
}

async function setProfilePic(){
    document.getElementById('user-icon').src = `/home/get-profile-pic/`+sessionStorage.getItem('username')+'&'+sessionStorage.getItem('token')+'&'+Date.now()
}
