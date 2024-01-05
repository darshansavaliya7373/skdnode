
var express = require("express")
var router = express.Router()
var authentication = require('../middleware/user.middleware.js')
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
    chalan,
    allchalans,
    generateBill,
    allmm,

}=require('../controller/user.controller.js')

router.post('/login',login)
router.post('/addcoil',authentication,addcoil)
router.get('/todayaddcoil',authentication,todayaddcoil)
router.post('/coilenter/:id',authentication,coilenter)
router.post('/singlecoilupdate/:id/:coil',authentication,singlecoilupdate)
router.get('/allcoil',authentication,allcoil)
router.post('/updatepalate',authentication,updatepalate)
router.get('/emptypalateno',authentication,emptypalateno)
router.delete('/deletesinglecoil/:id',authentication,deleteSingleCoil)
router.get('/operatorwithcoil',authentication,operatorwithcoil)
router.post('/chalan',authentication,chalan)
router.get('/allchalans',authentication,allchalans)
router.get('/generateBill/:id',authentication,generateBill)
router.get('/allmm',authentication,allmm)
router.get('/profile',authentication,(req,res)=>{
    res.json(req.user)
})

module.exports = router
