let validator = require('validator');
const mongoose = require('mongoose');
const schema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

schema.pre('save', async function (next) {
  console.log('task save');

  next();
});
let Task = mongoose.model('Task', schema);
module.exports = Task;
