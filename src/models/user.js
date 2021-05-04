const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const userSchema = Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    avatar: { type: String, required: true },
    status: { type: Boolean, required: true },
    role: { type: Array, required: true },
    competitions: { type: Array, required: true },
    pay: { type: Array, required: true },
    password: { type: String, required: true },
    titles: { type: Number, required: true },
  },
  { timestamps: true }
);

userSchema.statics.createToken = async (user, secret, expire) => {
  const { id, email, role, status, pay } = user;
  return await jwt.sign({ id, email, role, status, pay }, secret, {
    expiresIn: expire,
  });
};
userSchema.statics.checkToken = async (req, api_secret_token) => {
  const token = req.headers["authorization"];
  if (token) {
    try {
      return await jwt.verify(token, api_secret_token);
    } catch (e) {
      return undefined;
    }
  } else {
    return undefined;
  }
};
userSchema.statics.hashPassword = function (password) {
  let salt = bcrypt.genSaltSync(15);
  return bcrypt.hashSync(password, salt);
};
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
