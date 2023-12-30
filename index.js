var express = require('express')
var app = express()
var morgan = require('morgan')
var bodyParser = require('body-parser')
require('./config/mongoose')
app.use(morgan('dev'));
app.use(bodyParser(express.urlencoded({ extended: true })))
// app.use('/admin',require("./router/admin.router"))
app.use('/user', require("./router/user.router"))



app.get('/', (req, res) => {
    res.json({ message: "api running successfully" })
})

app.listen(3001, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("server is running 3001");
    }
})