const mongoose = require('mongoose');
const Joi = require("joi");

const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  exercise: {
    type: String,
    required: [true, "Exercise can't be empty!"],
    trim: true,
    minlength: 3
  },
  status: {
    type: String,
    default: 'active',
  },
}, {
  timestamps: true,
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

const validateNewExercise = (data) => {
	const schema = Joi.object({
		exercise: Joi.string().required().label("Exercise Name"),
	}).options({allowUnknown: true});
	return schema.validate(data);
};

module.exports = { Exercise, validateNewExercise };