const mongoose = require("mongoose");

const connectDB = function(){
  mongoose.set("strictQuery", true);

  try {
    mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected`);
  } catch (error) {
    console.log(error);
    console.log(`Error connecting to MongoDB`);
  }
};

module.exports = connectDB;
