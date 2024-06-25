const express = require("express")
const router = express.Router()
const collabController = require("../controller/collaborator")
const verifyToken = require("../middlewares/authMiddleware")

router.post("/create-collaborator",verifyToken,collabController.createCollaborator)
router.get("/get-collaborators",verifyToken,collabController.getCollaborators)

module.exports = router