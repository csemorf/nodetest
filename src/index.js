const mongoose = require('./mongoose.js');
const User = require('./model/user');
const Task = require('./model/Task');
const express = require('express');
const userRouter = require('./router/userRouter.js');
const taskRouter = require('./router/taskRouter.js');
// [users----,tasks------]
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// app.use((req, res, next) => {
//   res.status(503).send('maintainace');
// });
app.use(userRouter);
app.use(taskRouter);
const bc = require('bcryptjs');
// const useBcrypt = async () => {
//   const b = await bc.hash('asdf', 8);

//   console.log(b);

//   const c = await bc.compare('asdf', b);

//   console.log(c);
// };

// useBcrypt();
const main = async () => {
  // console.log(task.owner);
  const user = await User.findById('628fc7286eb6a256f46a200e');
  await user.populate('tasks');
  console.log(user.tasks);
  //   console.log();
  //   console.log(await task.populate('owner'));
  //   console.log(task);

  //   console.log(task.owner);
};
// main();
const multer = require('multer');
const upload = multer({
  dest: 'images',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('error file format'));
    }
    cb(undefined, true);
  },
});
const errorMiddleware = (err, req, res, next) => {
  res.status(400).send({ error: err.message });
};

app.post(
  '/upload',
  upload.single('upload'),
  (req, res) => {
    res.send();
  },
  errorMiddleware
);

app.listen(port, () => {
  console.log('listen at port', port);
});
