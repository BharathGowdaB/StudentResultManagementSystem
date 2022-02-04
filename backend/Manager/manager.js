const os_path = require('path');

const maxTokenFail  = 10
const maxLoginFail = 5
const AccountType = {
    0 : 'Admin',
    1 : 'Faculty',
    2 : 'Student'
}
const AccountTypeInv = {
   'admin' : 0,
    'faculty' : 1,
    'student' : 2
}
const path = {
    root: 'C:\\Users\\BharathGowda B\\Documents\\GitHub\\StudentResultManagementSystem',
    src: 'C:\\Users\\BharathGowda B\\Documents\\GitHub\\StudentResultManagementSystem\\src',
    private: 'C:\\Users\\BharathGowda B\\Documents\\GitHub\\StudentResultManagementSystem\\Photo\\private',
    public : 'C:\\Users\\BharathGowda B\\Documents\\GitHub\\StudentResultManagementSystem\\Photo\\public'
} 

function randomString(length){
    var char = 'mlpoknjiuhbvgytfcdrxzsewaqAEQWSDRZXFTCGVYBHUNJIMKOLP_';
    var newString = '';
    for(var i = 0 ; i < length; i++){
        newString += char.charAt(Math.floor(Math.random() * 53));
    }
    return newString;
}

//STD errors ;

//  AccountLocked: 'Account is locked, user need to reset password, or contact admin'
//  LoginFail : 'Username or Password error'
//  TokenFail : 'Invalid Token, Need to login again'
//  AccountTypeError : 'Invalid Account type, Need to login again'
//  ResultNotUpdated : 'No reults found of a student in particular semester'
//  NoProfessor : 'Student has no professors'
//  NoCourseTaught : 'Faculty is treated as non teaching staff'
//  NotValidCourse : 'get-students, Retrival of student info is not allowed for the given course,list info'
//  NoCourseStudent : 'no student are enrolled for the course'


module.exports = {
    path,
    randomString,
    AccountType,
    AccountTypeInv,
    maxTokenFail,
    maxLoginFail
}