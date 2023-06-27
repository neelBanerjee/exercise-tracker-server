const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const connectDB = require("./dbConfig");

const port = process.env.PORT || 5000;

// common middleware
app.use(cors());
app.use(express.json());

// db connection
connectDB();

// Serve static files from the "uploads" directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));

const registerRoutes = require("./routes/register");
const authRoutes = require("./routes/auth");
const exercisesRouter = require('./routes/exercises');
const usersRouter = require('./routes/users');
const userExercisesRouter = require('./routes/user-exercise-log');

//Define API Routing
app.use('/api/register', registerRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/users/', usersRouter);
app.use('/api/exercises/', exercisesRouter);
app.use('/api/userexerciselog/', userExercisesRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
