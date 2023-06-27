const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: {
    type: String,
    required: [true, "Full name is required!"],
    default: null,
  },
  username: {
    type: String,
    required: [true, "Username can't be empty!"],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    default: null,
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
    default: null,
  },
  phone: {
    type: String,
    required: [true, "Phone no is required!"],
    default: null,
  },
  profilePic: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  about: {
    type: String,
    default: null,
  },
  social: {
    type: Object,
    default: null,
  },
  status: {
    type: String,
    default: 'active',
  }
}, {
  timestamps: true,
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d",
	});
	return token;
};

const User = mongoose.model('User', userSchema);

const validateRegisterUser = (data) => {
	const schema = Joi.object({
		fullname: Joi.string().required().label("Full Name"),
		username: Joi.string().required().label("User Name"),
		email: Joi.string().email().required().label("Email"),
    phone: Joi.string().required().label("Phone"),
		password: passwordComplexity().required().label("Password")
	}).options({allowUnknown: true});
	return schema.validate(data);
};

const validateUserUpdate = (data) => {
	const schema = Joi.object({
		fullname: Joi.string().required().label("Full Name"),
		username: Joi.string().required().label("User Name"),
		email: Joi.string().email().required().label("Email"),
    phone: Joi.string().required().label("Phone"),
	}).options({allowUnknown: true});
	return schema.validate(data);
};

module.exports = { User, validateRegisterUser, validateUserUpdate };