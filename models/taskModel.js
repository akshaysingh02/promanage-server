const mongoose = require("mongoose");

const wordCountValidator = (value) => {
  return value.split(" ").length <= 25;
};

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      validate: [wordCountValidator, "Title cannot exceed 25 words"],
    },
    priority: {
      type: String,
      enum: ["high", "moderate", "low"],
      default: "low",
    },
    dueDate: {
      type: Date,
      default: null
    },
    checklist: [
      {
        item: {
          type: String,
          required: true,
        },
        done: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ["backlog", "to do", "in progress", "done"],
      default: "to do",
    },
    refUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: String,
      default: null
    },
    uniqueLink: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Task", taskSchema);
