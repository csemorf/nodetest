require('./src/mongoose');
const { ObjectID } = require('bson');
const Task = require('./src/model/Task');

// Task.findOneAndDelete({ _id: new ObjectID('628e4c16989ec7b7ce46542c') })
//   .then((res) => {
//     console.log(res);
//     return Task.countDocuments({ completed: false });
//   })
//   .catch((e) => {
//     console.log('error id');
//     console.log(e);
//   })
//   .then((r) => {
//     console.log(r);
//   })
//   .catch((e) => {
//     console.log('object');
//     console.log(e);
//   });

const deleteTask = async (id, completed) => {
  const task = await Task.findByIdAndDelete(id);
  const f = await Task.countDocuments({ completed });
  return f;
};

deleteTask('628e4c9a2ef4af6ddc56fcc1', false).then((r) => {
  console.log(r);
});
