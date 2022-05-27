const express = require('express');
const auth = require('../middleware/auth');
const User = require('../model/user');
const userRouter = express.Router();
const sharp = require('sharp');
userRouter.post('/users', async (req, res) => {
  try {
    const user = await User(req.body);
    if (await User.checkEmail(user.email)) {
      const token = await user.generateToken();
      await user.save();

      res.status(201).send({ user, token });
    }
  } catch (error) {
    console.log(error.message);
    res.send(error);
  }
});
userRouter.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});
userRouter.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});
userRouter.get('/users/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const result = await User.findOne({ _id });
    if (!result) {
      res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
userRouter.patch('/users/me', auth, async (req, res) => {
  const fields = ['password', 'age', 'name', 'email'];
  const keys = Object.keys(req.body);

  for (const f of keys) {
    if (!fields.includes(f)) {
      return res.status(400).send('error');
    }
  }

  const _id = req.params.id;
  try {
    // const user = await User.findById(_id);
    fields.forEach((f) => {
      req.user[f] = req.body[f];
    });
    await req.user.save();

    // console.log(user);
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});
userRouter.patch('/users/:id', async (req, res) => {
  const fields = ['password', 'age', 'name', 'email'];
  const keys = Object.keys(req.body);

  for (const f of keys) {
    if (!fields.includes(f)) {
      return res.status(400).send('error');
    }
  }

  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    fields.forEach((f) => {
      user[f] = req.body[f];
    });
    await user.save();
    // const user = await User.findOneAndUpdate({ _id }, req.body, {
    //   runValidators: true,
    //   new: true,
    // });
    console.log(user);
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});
userRouter.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findEmailAndPassword(email, password);
    const token = await user.generateToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});
userRouter.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

userRouter.post('/users/logout', auth, async (req, res) => {
  // const user = req.user;
  // console.log(user);
  try {
    req.user.tokens = req.user.tokens.filter((f) => f.token !== req.token);
    console.log(req.user.tokens);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send('err');
  }
});
userRouter.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.delete();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
const multer = require('multer');
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('error file format'));
    }
    cb(undefined, true);
  },
});

userRouter.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

userRouter.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    // console.log(req.file.buffer);
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);
userRouter.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // user.avatar;
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = userRouter;
