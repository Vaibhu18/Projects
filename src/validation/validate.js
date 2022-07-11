const mongoose = require('mongoose')

const isValid = function(value) {
    if(typeof (value) == "undefined" || typeof (value) == null) { return false }
    if(typeof (value).trim().length == 0){ return false }
    if(typeof (value) == "string" && (value).trim().length > 0) { return true }
}

const isValidObjectId = (value) => {
    return mongoose.isValidObjectId(value)
}

const isValidName = (name) => { 
    return String(name).match(/^[a-zA-Z ]/)
}

const isValidPhoneNumber = function (mobile) {
    var regularExpression = /^((\+91)?|91)?[6789][0-9]{9}$/
    return regularExpression.test(mobile)
}

const isValidateEmail = (email) => {
    return String(email).toLowerCase().match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)
}

const isValidPassword=(pw)=>{
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,15}$/.test(pw))
    return true
}

const isValidTitle = function(title){
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
}

const isValidPinCode = (pincode) => {
    if (/^[1-9][0-9]{5}$/.test(pincode))
        return true
}

module.exports = {isValid, isValidObjectId, isValidName, isValidPhoneNumber, isValidateEmail, isValidPassword, isValidTitle, isValidPinCode}