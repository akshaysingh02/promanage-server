const Task = require("../models/taskModel");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, priority, dueDate, checklist, assignedTo } = req.body;

    if (!title || !priority || !checklist) {
      return res.status(400).json({
        errorMessage: "please send title, priority, and checklist. Bad request",
      });
    }
    const uniqueLink = uuidv4();
    const task = new Task({
      title,
      priority,
      dueDate,
      checklist,
      refUser: req.currentUserId,
      assignedTo: assignedTo.toLowerCase(),
      uniqueLink,
    });

    const createdTask = await task.save();
    res.status(201).json({
      message: "task created Successfully",
      taskLink: `${uniqueLink}`,
      createdTask: createdTask,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update task details
const updateTaskDetailsById = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    if (!taskId) {
      return res.status(400).json({
        errorMessage: "Bad request, can't get id for task to update",
      });
    }
    const { title, priority, dueDate, checklist, assignedTo } = req.body;

    if (!title || !priority || !checklist) {
      return res.status(400).json({
        errorMessage: "Bad request, can't get details from req body",
      });
    }

    const isTaskExsist = await Task.findOne({ _id: taskId });
    if (!isTaskExsist) {
      return res.status(400).json({
        errorMessage: "Bad request, can't find the task by id",
      });
    }

    const task = await Task.findById(taskId);
    if (task.refUser.toString() !== req.currentUserId.toString()) {
      if (req.currentUserEmail === null) {
        return res.status(401).json({ message: "User not authorized" });
      } else if (
        task.assignedTo.toString() !== req.currentUserEmail.toString()
      ) {
        return res
          .status(401)
          .json({ message: "Task is not assigned to current user" });
      } else if (
        task.assignedTo.toString() === req.currentUserEmail.toString()
      ) {
        if (assignedTo) {
          return res.status(401).json({
            message: "You are not authorized to change the assigned user",
          });
        }
      }
    }

    task.title = title || task.title;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.checklist = checklist || task.checklist;
    task.assignedTo = assignedTo.toLowerCase() || task.assignedTo.toLowerCase();

    const updatedTask = await task.save();
    res.json({
      message: "Task Updated Successfully",
      updatedTask: updatedTask,
    });
  } catch (error) {
    console.log("Can't update the task details", error);
  }
};

//Delete the task
const deleteTaskById = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.currentUserId;
    if (!taskId) {
      return res.status(400).json({
        errorMessage: "Bad request, can't get task id",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    //check for ownership
    if (userId.toString() !== task.refUser.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this task" });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted Successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred while deleting the task" });
  }
};

//Get task for public sharing
const getTaskForSharing = async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    const task = await Task.findOne({ uniqueLink });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    const taskData = task.toObject();
    res.json({ taskData });
  } catch (error) {
    console.error("Error fetching Task:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred while fetching the Task" });
  }
};

// Get all tasks for the logged-in user ( tasks user created + tasks assigned by other user)
const getTasks = async (req, res) => {
  try {
    const activeUserId = req.currentUserId;
    const activeUserEmail = req.currentUserEmail;

    if (!activeUserId) {
      return res.status(400).json({
        errorMessage: "Please log in again, user not found, Bad request",
      });
    }

    const { filter } = req.query;
    let dateFilter = {};

    if (filter) {
      const currentDate = new Date();
      let startDate;

      switch (filter) {
        case 'today':
          dateFilter = {
            createdAt: {
              $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
              $lt: new Date(currentDate.setHours(23, 59, 59, 999)),
            },
          };
          break;
        case 'this_week':
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 7);
          dateFilter = {
            createdAt: {
              $gte: startDate,
              $lt: currentDate,
            },
          };
          break;
        case 'this_month':
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 30);
          dateFilter = {
            createdAt: {
              $gte: startDate,
              $lt: currentDate,
            },
          };
          break;
        default:
          break;
      }
    }

    const tasks = await Task.find({ refUser: activeUserId, ...dateFilter });
    const assignedTasks = await Task.find({ assignedTo: activeUserEmail, ...dateFilter });

    res.json({ usersTasks: tasks, assignedTasks: assignedTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Move task to another block
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId, newStatus } = req.body;

    if (!taskId || !newStatus) {
      return res.status(400).json({
        errorMessage: "Task ID and new status are required.",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        errorMessage: "Task not found.",
      });
    }

    task.status = newStatus;
    await task.save();

    res.status(200).json({
      message: "Task status updated successfully",
      updatedTask: task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get analytics data for the tasks
const getTaskAnalytics = async (req, res) => {
  try {
    const activeUserId = req.currentUserId;
    const activeUserEmail = req.currentUserEmail;

    if (!activeUserId || !activeUserEmail) {
      return res.status(400).json({
        errorMessage: "Please log in again, user not found. Bad request",
      });
    }

    // Fetch tasks created by the user
    const userCreatedTasks = await Task.find({ refUser: activeUserId });

    // Fetch tasks assigned to the user
    const assignedTasks = await Task.find({ assignedTo: activeUserEmail });

    // Helper function to compute task statistics
    const computeTaskStats = (tasks) => {
      return {
        totalBacklogTasks: tasks.filter((task) => task.status === "backlog")
          .length,
        totalTodoTasks: tasks.filter((task) => task.status === "to do").length,
        totalInProgressTasks: tasks.filter(
          (task) => task.status === "in progress"
        ).length,
        totalDoneTasks: tasks.filter((task) => task.status === "done").length,
        totalLowPriorityTasks: tasks.filter((task) => task.priority === "low")
          .length,
        totalModeratePriorityTasks: tasks.filter(
          (task) => task.priority === "moderate"
        ).length,
        totalHighPriorityTasks: tasks.filter((task) => task.priority === "high")
          .length,
        totalTasksWithDueDate: tasks.filter((task) => task.dueDate !== null)
          .length,
      };
    };

    // Compute statistics for both sets of tasks
    const userCreatedTaskStats = computeTaskStats(userCreatedTasks);
    const assignedTaskStats = computeTaskStats(assignedTasks);

    // Combine statistics into a single response object
    const analytics = {
      userCreatedTaskStats,
      assignedTaskStats,
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};


module.exports = {
  createTask,
  updateTaskDetailsById,
  deleteTaskById,
  getTaskForSharing,
  getTasks,
  updateTaskStatus,
  getTaskAnalytics
};
