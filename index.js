const express = require("express");
const bodyParser = require("body-parser");
const router=require("./router/route")
const mongoose = require("mongoose");
const app = express();
 
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://vaibhu:vaibhu123@cluster0.gvjopnc.mongodb.net/Vaibhu18",{ 
  useNewurlParser: true })
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", router);

app.listen(process.env.PORT || 3000, function () {
  console.log("port is running at:" + (process.env.PORT || 3000));
});
