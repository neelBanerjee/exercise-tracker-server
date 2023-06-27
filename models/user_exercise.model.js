const mongoose = require('mongoose');
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);

const Schema = mongoose.Schema;

const userExerciseSchema = new Schema({
  userid: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: [true, "User id can't be empty!"],
    trim: true,
    minlength: 3
  },
  exerciseid: {
    type: mongoose.Types.ObjectId,
    ref: "exercises",
    required: [true, "Exercise can't be empty!"],
    trim: true,
    minlength: 3
  },
  duration: {
    type: Number,
    required: [true, "Duration is required!"],
    default: null,
  },
  description: {
    type: String,
    required: [true, "Description is required!"],
    default: null,
  },
  date: {
    type: Date,
    required: [true, "Date can't be empty!"],
    default: null,
  },
  status: {
    type: String,
    default: 'active',
  },
}, {
  timestamps: true,
});

const userExercise = mongoose.model('User_Exercise_Log', userExerciseSchema);

const validateExercise = (data) => {
	const schema = Joi.object({
		userid: Joi.objectId().required().label("User ID"),
		exerciseid: Joi.objectId().required().label("Exercise"),
		duration: Joi.number().integer().required().label("Duration"),
    description: Joi.string().required().label("Description"),
		date: Joi.date().raw().required().label("Date")
	}).options({allowUnknown: true});
	return schema.validate(data);
};

module.exports = { userExercise, validateExercise};