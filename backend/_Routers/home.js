const express = require('express')
const manager = require('../Manager/manager')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const db = require('../Manager/oracledb')

var user = express.Router()

user.use(express.static(manager.path.src));

user.post('/login',async function(req,res){
    //console.log(req.body)
    var user = {
        username : req.body.username,
        password : req.body.password,
        token : manager.randomString(20)
    }
    response = await db.authentication(user)
    response.type = manager.AccountType[response.type]
    res.send(response)
})

let photo_path 
let userInfo = {username:'',token:'',type:2}
var profileStorage = multer.diskStorage({
    destination: async (req,file,cb)=>{
        var response = await db.tokenAuthentication(userInfo);
        if(!response.error && response.photo_container){
            response = await db.getInfo(userInfo);
            if(userInfo.type == 2)
                photo_path = manager.path.private +'\\'+response.photo_container
            else
                photo_path = manager.path.public +'\\'+response.photo_container
           cb(null,photo_path)
        }
        else{
            res = await db.createPhotoContainer(userInfo.username,userInfo.type)
            if(userInfo.type == 2)
                photo_path = manager.path.private +'\\'+ res
            else
                photo_path = manager.path.public +'\\'+ res
            cb(null,photo_path)
        }
       //console.log(121,photo_path)
    },
    filename: async (req,file,cb)=>{
        cb(null,'profile.jpg')
    }  
})

var profilePic = multer({storage:profileStorage});

user.post('/set-username',async function(req,res){
    let response  = await db.tokenAuthentication(req.body)
    if(response.error){
        userInfo = {username:'',token:'',type:2}
        res.send({error:true})
    }
    else{
        userInfo = req.body
        userInfo.type = response.type
        res.send({error:false})
    }
    //console.log(userInfo)
})

user.post('/set-profile-pic',profilePic.single('Image'),async function(req,res){
    res.send({error:false});
})

user.get('/get-profile-pic/:id',async function(req,res){
    if(typeof req.params.id !== undefined){
        var par = req.params.id.split('&');
        console.log(73,par)
    
        let response  = await db.tokenAuthentication({username:par[0],token:par[1]})
        if(response.error){
            res.sendFile(manager.path.src+'/static/icons/thumnail.png')
        }
        else{
            try{
                response2 = await db.getInfo({username:par[0],token:par[1],type:response.type})
                if(response.type == 2)
                    res.sendFile(manager.path.private+'/'+response2.photo_container+'/profile.jpg')
                else
                    res.sendFile(manager.path.public+'/'+response2.photo_container+'/profile.jpg')
            }
            catch{
                res.sendFile(manager.path.src+'/static/icons/thumnail.png')
            }
        }
    }
    else{
        res.sendFile(manager.path.src+'/static/icons/thumnail.png')
    }

})

user.get('/get-user-pic/:id',async function(req,res){
    if(typeof req.params.id !== undefined){
        var par = req.params.id.split('&');
        console.log(101,par)
    
        let response  = await db.tokenAuthentication({username:par[0],token:par[1]})
        if(response.error){
            res.sendFile(manager.path.src+'/static/icons/thumnail.png')
        }
        else{
            if(response.type == 2){
                fs.exists(manager.path.public+'/'+par[2]+'/profile.jpg',function (exits){
                    if(exits)
                        res.sendFile(manager.path.public+'/'+par[2]+'/profile.jpg')
                    else
                        res.sendFile(manager.path.src+'/static/icons/thumnail.png')
                    
                })
            }
            else{
                fs.exists(manager.path.private+'/'+par[2]+'/profile.jpg',function (exits){
                    if(exits)
                        res.sendFile(manager.path.private+'/'+par[2]+'/profile.jpg')
                    else{
                        fs.exists(manager.path.public+'/'+par[2]+'/profile.jpg',function (exits){
                            if(exits)
                                res.sendFile(manager.path.public+'/'+par[2]+'/profile.jpg')
                            else{
                                res.sendFile(manager.path.src+'/static/icons/thumnail.png')
                            }
                        })  
                    }   
                })
            } 
        }
    }
    else{
        res.sendFile(manager.path.src+'/static/icons/thumnail.png')
    }

})

module.exports = user