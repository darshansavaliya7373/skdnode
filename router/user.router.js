
var express = require("express")
var router = express.Router()
const{
    login,
    addcoil,
    coilenter,
    singlecoilupdate,
    todayaddcoil,
    allcoil,
    updatepalate,
    emptypalateno,
    deleteSingleCoil,
    operatorwithcoil,
    filterCoilData,
    chalan,
    

}=require('../controller/user.controller.js')

router.post('/login',login)
router.post('/addcoil',addcoil)
router.get('/todayaddcoil',todayaddcoil)
router.post('/coilenter/:id',coilenter)
router.post('/singlecoilupdate/:id/:coil',singlecoilupdate)
router.get('/allcoil',allcoil)
router.post('/updatepalate',updatepalate)
router.get('/emptypalateno',emptypalateno)
router.delete('/deletesinglecoil/:id',deleteSingleCoil)
router.get('/operatorwithcoil',operatorwithcoil)
router.post('/filterCoilData',filterCoilData)
router.post('/chalan',chalan)
module.exports = router
