const express = require("express")
const router = express.Router()
const collabController = require("../controller/collaborator")
const verifyToken = require("../middlewares/authMiddleware")

router.post("/create-collaborator",verifyToken,collabController.createCollaborator)

module.exports = router