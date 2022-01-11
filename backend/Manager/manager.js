const os_path = require('path');


var path = {
    root: 'C:/Users/BharathGowda B/Documents/GitHub/StudentResultManagementSystem',
    src: './Src'
} 

function randomString(length){
    var char = 'mlpoknjiuhbvgytfcdrxzsewaqAEQWSDRZXFTCGVYBHUNJIMKOLP_';
    var newString = '';
    for(var i = 0 ; i < length; i++){
        newString += char.charAt(Math.floor(Math.random() * 53));
    }
    return newString;
}



module.exports = {
    path,
    randomString
}