const userModel = require("../models/userModel");

const createUser = async function(req,res) {
try{

    let requestBody = req.body   
    let saveData = await userModel.create(requestBody)
    return res.status(201).send({status: true, message: 'Success', data: saveData})
}
catch(err) {
    return res.status(500).send({status: false , message: err.message})
}

}


module.exports = {createUser}