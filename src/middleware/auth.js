const User = require('../model/user');

const jsonwebtoken = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const bearer = req.header('Authorization').replace('Bearer ', '');

    const token = jsonwebtoken.verify(bearer, 'course');
    const user = await User.findOne({ _id: token._id, 'tokens.token': bearer });
    if (!user) throw new Error('unable to find the user');
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: error.message || 'unauthorized' });
  }
};
module.exports = auth;
