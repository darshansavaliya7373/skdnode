
var express = require("express")
var router = express.Router()
var authentication = require('../middleware/admin.middleware.js')
const{
    login,
    home,
    loginpage,
    addmm,
    adduser,
    // coilenter,
    // singlecoilupdate,
    // todayaddcoil,
    // allcoil,
    // updatepalate,
    // emptypalateno,
    // deleteSingleCoil,
    // operatorwithcoil,
    // chalan,
    // allchalans,
    generateBill

}=require('../controller/admin.controller.js')

router.post('/login',login)
router.get('/login',loginpage)
router.get('/',authentication,home);
router.post('/addmm',authentication,addmm)
router.post('/adduser',authentication,adduser)

// router.get('/todayaddcoil',todayaddcoil)
// router.post('/coilenter/:id',coilenter)
// router.post('/singlecoilupdate/:id/:coil',singlecoilupdate)
// router.get('/allcoil',allcoil)
// router.post('/updatepalate',updatepalate)
// router.get('/emptypalateno',emptypalateno)
// router.delete('/deletesinglecoil/:id',deleteSingleCoil)
// router.get('/operatorwithcoil',operatorwithcoil)
// router.post('/chalan',chalan)
// router.get('/allchalans',allchalans)
router.get('/generateBill/:id',generateBill)
module.exports = router
