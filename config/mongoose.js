var mongoose = require("mongoose")
var db = mongoose.connection
mongoose.connect("mongodb://127.0.0.1/skd")
// mongoose.connect("mongodb+srv://morsy:morsy@ds.6e7bjag.mongodb.net/skd")
db.once('open',(err)=>{

    if(err){
        console.log(err);
    }else{
        console.log("db connected");
    }

})