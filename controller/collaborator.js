const Collaborator = require("../models/collaboratorModel");

const createCollaborator = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        errorMessage: "Bad Request, please enter email",
      });
    }

    let formattedEmail = email.toLowerCase();

    //check for same email for collaborator in users account
    const collabDetails = await Collaborator.findOne({ email: formattedEmail });
    if (collabDetails) {
      return res
        .status(409)
        .json({ errorMessage: "This email already exist as collaborator" });
    }

    const newCollaborator = new Collaborator({
      email: formattedEmail,
      refUser: req.currentUserId,
    });

    const savedCollaborator = await newCollaborator.save();

    res.status(201).json({
      message: "Collaborator created Successfully",
      email: formattedEmail,
      refUser: req.currentUserId,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCollaborators = async (req, res) => {
  try {
    const userId = req.currentUserId;
    if (!userId) {
      return res.status(400).json({ errorMessage: "User id is required" });
    }

    const collaborators = await Collaborator.find({refUser: userId})
    if(!collaborators){
      res.status(404).json({errorMessage: "Can't find any collaborators"})
    }

    res.json(collaborators);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createCollaborator,
  getCollaborators,
};
