const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const route = require("./routes/route")
const app = express()

app.use(bodyParser.json())

mongoose.connect("mongodb+srv://rhutvik-patel:jiCI0diV4CDbN9Pr@cluster0.afbog.mongodb.net/group56Database", { useNewUrlParser: true })
.then(() => console.log("MongoDb is Connected..."))
.catch(err => console.log(err))

app.use("/",route)

app.listen(process.env.PORT || 3000, ()=>
    console.log("Express App Running On Port " + (process.env.PORT || 3000))
)