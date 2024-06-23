const mongoose = require('mongoose')

const collaboratorSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    refUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
},{timestamps:{createdAt: "createdAt", updatedAt: "updatedAt"}})

module.exports = mongoose.model("Collaborator",collaboratorSchema)