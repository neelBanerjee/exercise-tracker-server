const router = require('express').Router();
const mongoose = require('mongoose');
let { userExercise, validateExercise } = require('../models/user_exercise.model');
const jwtMiddleware = require("../middleware/authmiddleware");
const Exercise = require('../models/exercise.model');

//====Fetch All Excercise Logs====
router.get("/:id", jwtMiddleware, async (req, res) => {
  try {
    //const exercises = await userExercise.find({ "userid": req.params.id });
    const ObjectId = mongoose.Types.ObjectId;
    const _userid = new ObjectId(req.params.id);

    const exercises = await userExercise.aggregate([
      { $match: { "userid": _userid } },
      { $lookup: { localField: "userid", from: "users", foreignField: "_id", as: "user" } },
      { $lookup: { localField: "exerciseid", from: "exercises", foreignField: "_id", as: "exercise" } },
      { $project: { duration: 1, description: 1, date: 1, "user.fullname": 1, "exercise.exercise": 1 } }
    ]);

    if (!exercises || !exercises.length > 0) {
      res.status(204).json({ exercises: null, message: "No exercise found" });
    } else {
      res.status(200).json({ exercises: exercises, message: "Exercise list was fetched successfully" });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error: ' + error });
  }
});

//===Add New Excercise Log===
router.post("/add", jwtMiddleware, async (req, res) => {
  try {
    //console.log(req.body);return false;
    const { error } = validateExercise(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const userid = req.body.userid;
    const exerciseid = req.body.exerciseid;
    const duration = Number(req.body.duration);
    const description = req.body.description;

    const date = Date.parse(req.body.date); //Date.parse(new Date())

    const newExercise = new userExercise({ userid, exerciseid, duration, description, date });

    await newExercise.save();
    res.status(201).send({ message: "Exercise log was created successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error:" + err });
  }

});

//===Fetch Excercise Log Details===
router.get("/logdetails/:id", jwtMiddleware, async (req, res) => {
  try {
    const exercise = await userExercise.findOne({ _id: req.params.id }, {});

    if (!exercise)
      res.status(204).json({ exercise: null, message: "No exercise log details found" });

    res.status(200).json({ exercise: exercise, message: "Exercise log details was fetched successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error:" + error });
  }
});

//====Fetch Single Excercise Log Details====
router.get("/fetchsinglelog/:id", jwtMiddleware, async (req, res) => {
  try {
    const ObjectId = mongoose.Types.ObjectId;
    const _logid = new ObjectId(req.params.id);

    const exercise = await userExercise.aggregate([
      { $match: { "_id": _logid } },
      { $lookup: { localField: "userid", from: "users", foreignField: "_id", as: "user" } },
      { $lookup: { localField: "exerciseid", from: "exercises", foreignField: "_id", as: "exercise" } },
      { $project: { duration: 1, description: 1, date: 1, "user.fullname": 1, "exercise.exercise": 1 } },
    ]);

    if (!exercise || !exercise.length > 0) {
      res.status(204).json({ exercise: null, message: "No exercise found" });
    } else {
      res.status(200).json({ exercise: exercise, message: "Exercise list was fetched successfully" });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error: ' + error });
  }
});

//===Update Excercise===
router.post("/update", jwtMiddleware, async (req, res) => {
  try {
    const _exerciseid = req.body._exerciseid;

    //console.log(req.body);return false;
    const { error } = validateExercise(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    let exerciseData = {};

    exerciseData.userid = req.body.userid;
    exerciseData.exerciseid = req.body.exerciseid;
    exerciseData.duration = req.body.duration;
    exerciseData.description = req.body.description;
    exerciseData.date = Date.parse(req.body.date);

    await userExercise.findOneAndUpdate(
      { _id: _exerciseid },
      exerciseData,
      { new: true }
    );

    res.status(202).json({ message: "Exercise log was updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error:" + err });
  }
});

//===Delete Excercise===
router.delete("/delete/:id", jwtMiddleware, async (req, res) => {
  try {
    await userExercise.findByIdAndDelete(req.params.id);
    res.status(202).json({ message: "Exercise log was successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error:" + err });
  }
});

//===Fetch a User's Excercise Lists===
router.route('/test/:id').get((req, res) => {
  userExercise.find({ "userid": req.params.id })
    .then(exercise => res.json(exercise))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;