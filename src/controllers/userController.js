const userModel = require("../models/userModel")
const validation = require("../validation/validate")
const jwt = require('jsonwebtoken')


const createUser = async function(req,res) {
    try{
        let data = req.body  
        if(Object.keys(data).length == 0) {
            return res.status(400).send({status:false, message: "Field Can't Empty.Please Enter Some Details" });
        }

        // Title validation
        if(!data.title) {
            return res.status(400).send({status:false ,message:"Title is missing"});
        }

        if(!validation.isValidTitle(data.title)) return res.status(400).send({ status: false, message: 'Enter valid title' });


        // Name Validation
        if(!validation.isValid(data.name)) return res.status(400).send({status: false, message: "Please Enter Name/ Name is Missing",});

        if(!validation.isValidName(data.name)) {
            return res.status(400).send({status: false, message: "Name must contain Alphabet",});
        }
        
        
        // Phone Validation
        if(!data.phone) return res.status(400).send({status: false, message: "Phone Number is missing"})
        if(!validation.isValidPhoneNumber(data.phone)) {
            return res.status(400).send({ status: false, message: "Mobile number should be of 10 Digits" })
        }

        let checkIfNumberIsPresent = await userModel.findOne({ phone: data.phone })
        if(checkIfNumberIsPresent) return res.status(400).send({ status: false, message: `${checkIfNumberIsPresent.phone} this Number already exists, please enter anothor Number` })


        //Email Validation
        if(!data.email){
            return res.status(400).send({status: false, message: "Email is missing"})
        }
        if(!validation.isValidateEmail(data.email)) {
            return res.status(400).send({status: false, message: "Invaild E-mail Format." })
        }
        const email = await userModel.findOne({ email: data.email }) 
        if(email) return res.status(400).send({ status:false, message: "Email already exists, please enter anothor Email" })
    

        // Password Validation
        if(!data.password) return res.status(400).send({ status: false, message: "Password is missing" });

        if(!validation.isValidPassword(data.password)) return res.status(400).send({ status: false, message: "Password should be within 8-15 Characters and must contain special, number, upper and lower character" }) //password validation
        
        
        // Address Validation
        if(data.address){
            // Type Of Address
            if(typeof data.address !== 'object' || Array.isArray(data.address) || Object.keys(data.address).length==0) return res.status(400).send({ status: false, message: "Address Should be in Valid Format"})
        
            // Key-Value Pairs Is Present?
            if (!("street" in data.address) || !("city" in data.address) || !("pincode" in data.address))
                return res.status(400).send({ status: false, message: "street, city, pincode all three are required" })

            // Valid Pincode format
            if (!validation.isValidPinCode(data.address.pincode))
                return res.status(400).send({ status: false.valueOf, message: "pincode format not correct" })

            if (!data.address.street)
                return res.status(400).send({ status: false, message: "Pls Enter Valid street" })

            if (!validation.isValidName(data.address.city))
                return res.status(400).send({ status: false, message: "Pls Enter Valid city" })
        }

        const user = await userModel.create(data);
        return res.status(201).send({ status: true, message: 'User Created Successfully', data: user });
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

const userLogIn = async function(req, res){
    try{
        let data = req.body
        if(Object.keys(data).length == 0) {
            return res.status(400).send({status:false, message: "Feild Can't Empty.Please Enter Some Details" });
        }

        //Email Validation
        if(!data.email){
            return res.status(400).send({status: false, message: "Email is missing"})
        }
        if(!validation.isValidateEmail(data.email)) {
            return res.status(400).send({status: false, message: "Invaild E-mail Format." })
        }
        
        // Password Validation
        if(!data.password) return res.status(400).send({ status: false, message: "Password is missing" });
        
        
        // Verifying Login
        let checkDetails = await userModel.findOne({email: data.email, password: data.password})
        if(!checkDetails) return res.status(401).send({ status: false, message: "Invalid Login Credentials..."})

        
        // Creating JWT Token
        let token = jwt.sign(
            {
              userId: checkDetails._id.toString(),
              exp: Math.floor(Date.now() / 1000) + (60*60*24),
              iat: Math.floor(Date.now() / 1000),
            },
            "Project-3 Book Management"
        );
        res.setHeader("x-api-key", token);
        return res.status(200).send({status: true, message: "Success", data: token})
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

module.exports = {createUser, userLogIn}