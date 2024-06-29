const express = require("express")
const router = express.Router()
const verifyToken = require("../middlewares/authMiddleware")
const taskController = require("../controller/taskController")


router.post("/create-task",verifyToken,taskController.createTask)
router.put("/update-task/:taskId",verifyToken,taskController.updateTaskDetailsById)
router.delete("/delete-task/:taskId",verifyToken,taskController.deleteTaskById)
router.get("/get-all-tasks",verifyToken,taskController.getTasks)
router.put("/update-status",verifyToken,taskController.updateTaskStatus)

//public sharing route
router.get("/share/:uniqueLink",taskController.getTaskForSharing)

//analytics route
router.get("/get-analytics",verifyToken,taskController.getTaskAnalytics)



module.exports = router
