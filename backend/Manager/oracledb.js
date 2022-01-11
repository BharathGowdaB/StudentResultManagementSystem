const oracle = require('oracledb')

const db
var isConnected = false


connect();

async function connect(){
    try{
        db = await oracledb.getConnection({user : "BharathGowdaB",password : "2310"});
        isConnected=true;
        console.log("Connected to ");
    }
    catch(err){
        console.log(err);
    } 
    
}  

async function authentication(user){
    if(!isConnected){
        await connect();
    }
    var result = await db.execute(`select password,token,type,login_fail from user where username='${user.username}'`)
    let row = result.rows[0]
    if(row[3] > PushManager.maxLoginFail ){
        return({error: true,value:'AccountLocked'})
    }
    else if(row[0]==user.password){
        res = {token:res[1],type:res[2],error:false}
        db.execute(`update user set token = '${user.token}' where username='${user.username}'`)
    }
    else{
        db.execute(`update user set login_fail = login_fail + 1 where username='${user.username}'`)
        res = {token:'',type:'',error:true}
    }
    db.exectue('commit')
 return res
}

module.exports = {
    authentication
}