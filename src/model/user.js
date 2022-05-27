let validator = require('validator');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    validate(e) {
      if (e.includes('password')) {
        throw new Error('not word password');
      }
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,

    validate(e) {
      if (!validator.isEmail(e)) {
        throw new Error('must be eemail');
      }
    },
  },
  age: {
    type: Number,
    default: 0,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  avatar: {
    type: Buffer,
  },
});
schema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 8);
  }
  console.log('save');
  console.log(user.password);
  next();
});
schema.statics.findEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('unable find user');
  }
  const match = await bcryptjs.compare(password, user.password);
  console.log(match);
  // console.log(user.password);
  // console.log(password);
  if (!match) {
    throw new Error('unable match find user');
  }
  return user;
};
schema.statics.checkEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    return true;
  }
  throw new Error('email repetition');
};
const jsonwebtoken = require('jsonwebtoken');
const Task = require('./Task');
schema.methods.generateToken = async function () {
  const user = this;
  const token = jsonwebtoken.sign({ _id: user._id }, 'course');
  user.tokens = user.tokens.concat({ token });

  await user.save();
  return token;
};
schema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});
schema.methods.toJSON = function () {
  const user = this;
  const obj = user.toObject();

  delete obj.password;
  delete obj.tokens;
  delete obj.avatar;

  return obj;
};
schema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });

  next();
});
let User = mongoose.model('User', schema);

module.exports = User;
