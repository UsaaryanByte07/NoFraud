const mongoose = require("mongoose");

const threatSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  inputType: { 
    type: String, 
    enum: ["url", "email", "text", "file"], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  isFraud: { 
    type: Boolean, 
    required: true,
    default: false
  },
  explanation: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Threat", threatSchema);
