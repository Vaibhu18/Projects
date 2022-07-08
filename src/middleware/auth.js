const jwt = require('jsonwebtoken')

const authentication= async function(req, res, next){
    
    try{
        let token = req.headers["x-Api-Key"];
        if (!token) token = req.headers["x-api-key"];

        if (!token) return res.status(401).send({ status: false, message: "token must be present" });

        jwt.verify(token, "Project-3 Book Management", (err, decode)=>{
            if(err){
                return res.status(401).send({ status: false, message: err.message});
            } else{
                req.headers["userId"] = decode.userId
                next()
            }
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = {authentication}