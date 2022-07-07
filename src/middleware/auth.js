const jwt = require('jsonwebtoken')

const authentication= async function(req, res, next){
    
    try{
        let token = req.headers["x-Api-Key"];
        if (!token) token = req.headers["x-api-key"];

        if (!token) return res.status(401).send({ status: false, msg: "token must be present" });

        let decodedToken= jwt.verify(token, "Project-3 Book Management")
        
        req.headers["userId"] = decodedToken.userId

        next()
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = {authentication}