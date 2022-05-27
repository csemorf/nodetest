const Task = require('../model/Task');

const express = require('express');
const auth = require('../middleware/auth');

const taskRouter = express.Router();

taskRouter.post('/tasks', auth, (req, res) => {
  console.log(req.body);

  let task = Task({ ...req.body, owner: req.user._id });

  task
    .save()
    .then(() => {
      res.status(201).send(task);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});
// taskRouter.get('/tasks', auth, async (req, res) => {
//   try {
//     // const task = await Task.find({});
//     await req.user.populate('tasks');
//     // if (!task) return res.status(404).send();

//     res.send(req.user.tasks);
// res.send(task);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });
//

taskRouter.get('/tasks', auth, async (req, res) => {
  const match = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  const sort = {};
  // sortby=createdAt:desc
  if (req.query.sortBy) {
    const f = req.query.sortBy.split(':');
    sort[f[0]] = f[1] === 'desc' ? -1 : 1;
  }

  try {
    // const task = await Task.find({});
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        // sort: {
        //   createdAt: -1,
        // },
        sort,
      },
    });
    // if (!task) return res.status(404).send();

    res.send(req.user.tasks);
    // res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

taskRouter.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send('error 404');
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
  Task.findOne({ _id })
    .then((result) => {
      if (!result) {
        res.status(404).send();
      }
      res.send(result);
    })
    .catch((e) => {});
});
taskRouter.patch('/tasks/:id', auth, async (req, res) => {
  const fields = ['completed', 'description'];
  const keys = Object.keys(req.body);

  for (const f of keys) {
    if (!fields.includes(f)) {
      return res.status(400).send({ err: 'error' });
    }
  }
  const _id = req.params.id;
  try {
    // const user = await User.findByIdAndUpdate(
    //   req.user.id,
    //   { $set: { ...fieldToUpdate } },
    //   {
    //     runValidators: true,
    //     new: true,
    //   }
    // );

    const task = await Task.findOneAndUpdate(
      { _id, owner: req.user._id },
      { $set: { ...req.body } },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!task) return res.status(404).send();
    // fields.forEach((f) => {
    //   task[f] = req.body[f];
    // });
    await task.save();

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
  // const task = await Task.findByIdAndUpdate({ _id }, req.body, {
  //   new: true,
  //   runValidators: true,
  // });
});

taskRouter.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});
module.exports = taskRouter;
