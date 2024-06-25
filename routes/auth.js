const express = require("express")
const router = express.Router()
const verifyToken = require("../middlewares/authMiddleware")
const authController = require("../controller/userController")

router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.put("/update-user/:userId",verifyToken,authController.updateUserDetailsById)
router.get("/get-user-details",verifyToken,authController.getUserDetails)

module.exports = router;