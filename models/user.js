const mongoose = require('mongoose');

// User Schema
const userSchema = mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  firstname:{
    type: String,
    required: true
  },
  age:{
    type: String
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String
  },
  picture:{
    type: String,
    required: true
  },
  locked:{
    type: Boolean,
    required: true
  },
  type:{
    type: String,
    required: true
  },
  regdate:{
    type: Date,
    required: true
  },
  logindate:{
    type: Date
  },
});

let User = module.exports = mongoose.model('User', userSchema);
