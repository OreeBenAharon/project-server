const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    street: {
      type: String,
    },
    admin: {
      type: Boolean,
      required: true,
    },
  });

const User = mongoose.model("user", mediaSchema);

module.exports = User
