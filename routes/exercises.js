const router = require('express').Router();
let { Exercise, validateNewExercise } = require('../models/exercise.model');
const jwtMiddleware = require("../middleware/authmiddleware");

//===Fetch All Exercise===
router.get("/", jwtMiddleware, async (req, res) => {
  try {
    const exercises = await Exercise.find();
    if (!exercises || !exercises.length>0) {
      res.status(204).json({ message: "No exercise found" });
    } else {
      res.status(200).json({ exercises: exercises, message: "Exercises are fetched successfully" });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error: ' + error });
  }
});

//====Add New Excercise====
router.post("/add", jwtMiddleware, async (req, res) => {
  try {
    //console.log(req.body);return false;
    const { error } = validateNewExercise(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const exerciseByName = await Exercise.findOne({ exercise: req.body.exercise });
		
    if (exerciseByName)
			return res.status(409).send({ message: "This exercise is already exists!" });

    const exercise = req.body.exercise;
    const status = "active";

    const newExercise = new Exercise({ exercise, status });

    await newExercise.save();
    res.status(201).send({ message: "Exercise was created successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error:" + err });
  }

});

//===Fetch Excercise Details===
router.route('/:id').get((req, res) => {
  Exercise.findById(req.params.id)
    .then(exercise => res.json(exercise))
    .catch(err => res.status(400).json('Error: ' + err));
});

//===Update Excercise===
router.route('/update/:id').post((req, res) => {
  Exercise.findById(req.params.id)
    .then(exercise => {
      exercise.exercise = req.body.exercise;

      exercise.save()
        .then(() => res.json({message:'Exercise is successfully updated!'}))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

//===Delete Excercise===
router.route('/delete/:id').delete((req, res) => {
  Exercise.findByIdAndDelete(req.params.id)
    .then(() => res.json({message:'Exercise is successfully deleted!'}))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;