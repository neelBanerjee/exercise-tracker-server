const router = require('express').Router();
let { User, validateUserCreate, validateUserUpdate } = require('../models/user.model');
const jwtMiddleware = require("../middleware/authmiddleware");
const fs = require('fs');
const path = require('path');
const upload = require("../middleware/multer");
const bcrypt = require("bcrypt");

//===Fetch All User===
router.get("/", jwtMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    if (!users || !users.length > 0) {
      res.status(204).json({ message: "No user found" });
    } else {

      const rootPath = path.resolve(process.cwd());
      const url = req.protocol + '://' + req.get('host');

      const noUserUrl = url + '/assets/images/no-user.png';

      //Formatting user data before sending
      users.forEach(user => {

        if (user.hasOwnProperty('profilePic') || user.profilePic != null) {
          const profilePicPath = path.join(rootPath, 'uploads', user.profilePic);

          // Check if the file exists 
          if (fs.existsSync(profilePicPath)) {
             user.profilePic = url + '/uploads/' + user.profilePic;
          } else {
            user.profilePic = noUserUrl;
          }
        }else{
          user.profilePic = noUserUrl;
        }
      });

      res.status(200).json({ users: users, message: "User list was fetched successfully" });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error: ' + error });
  }
});

//===Add New User===
router.post("/create", async (req, res) => {

  try {
    const { error } = validateUserCreate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(409).send({ message: "User with given email already Exist!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const fullname = req.body.fullname;
    const username = req.body.username;
    const email = req.body.email;
    const password = hashPassword;
    const phone = req.body.phone;
    const profilePic = req.body.profilePic;
    const address = req.body.address;

    const newUser = new User({ fullname, username, email, password, phone, profilePic, address });

    await newUser.save();
    res.status(201).send({ message: "User created successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error:" + err });
  }

});

//===Fetch User Details===
router.get("/:id", jwtMiddleware, async (req, res) => {
  //console.log(req);
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {

      const rootPath = path.resolve(process.cwd());
      const url = req.protocol + '://' + req.get('host');

      const noUserUrl = url + '/assets/images/no-user.png';

      const currentProfilePic = user.profilePic;

      if (user.hasOwnProperty('profilePic') || user.profilePic != null) {
          const profilePicPath = path.join(rootPath, 'uploads', user.profilePic);

          // Check if the file exists 
          if (fs.existsSync(profilePicPath)) {
              user.profilePic = url + '/uploads/' + user.profilePic;
          } else {
              user.profilePic = noUserUrl;
          }
      } else {
          user.profilePic = noUserUrl;
      }

      res.status(200).json({ user: user, currentProfilePic: currentProfilePic, message: "User data was fetched successfully" });
    }
  } catch (error) {
    //console.log(error);
    res.status(500).json({ message: 'Error: ' + error });
  }
});

//===Update User===
router.put("/update", jwtMiddleware, async (req, res) => {

  try {
    const { error } = validateUserUpdate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const _userid = req.body.userid;

    const user = await User.findOne(
      {
        $or: [
          { username: req.body.username },
          { email: req.body.email }
        ],
        $and: [
          { _id: { $ne: _userid } }
        ]
      });
    if (user)
      return res.status(409).json({ message: "User with given email already Exist!" });

    const findUser = await User.findById({ _id: _userid });
    //validate
    if (!findUser) {
      res.status(400).json({ message: "no user found with this id" });
    }

    let userData = {};

    userData.fullname = req.body.fullname;
    userData.username = req.body.username;
    userData.email = req.body.email;
    userData.phone = req.body.phone;
    userData.profilePic = req.body.profilePic;
    userData.address = req.body.address;
    userData.about = req.body.about;

    let socialMediaLinks = {};

    if (req.body.hasOwnProperty('fbLink')) {
      socialMediaLinks.facebook = req.body.fbLink;
    }

    if (req.body.hasOwnProperty('twitterLink')) {
      socialMediaLinks.twitter = req.body.twitterLink;
    }

    if (req.body.hasOwnProperty('instaLink')) {
      socialMediaLinks.instagram = req.body.instaLink;
    }

    userData.social = socialMediaLinks;
    userData.status = "active";

    //console.log(userData);

    await User.findOneAndUpdate(
      { _id: _userid },
      userData,
      { new: true }
    );

    res.status(202).json({ message: "User was updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error:" + err });
  }

});


//===Update User Profilepic===
router.put("/updateprofilepic", [jwtMiddleware, upload.single("profilePic")], async (req, res) => {

  try {
    // const { error } = validateUserUpdate(req.body);
    // if (error)
    //   return res.status(400).json({ message: error.details[0].message });

    const _userid = req.body.userId;
    const url = req.protocol + '://' + req.get('host');
    const profilePic = url + '/uploads/' + req.file.filename;

    //console.log(req.file.filename);
    //console.log(_userid);
    //console.log(profilePic);
    //console.log(reqFiles);

    const findUser = await User.findById({ _id: _userid });
    //validate
    if (!findUser) {
      res.status(400).json({ message: "no user found with this id" });
    }

    //Fetching User Old Profile Pic by ID
    //const user = await User.findById(_userid);
    const currentProfilePicture = req.body.currentProfilePic;//user.profilePic;

    // Delete the current profile picture if it exists
    if (currentProfilePicture) {
      const rootPath = path.resolve(process.cwd());
      const filePath = path.join(rootPath, 'uploads', currentProfilePicture);

      //console.log(filePath);

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // Delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting profile picture:', err);
          }
        });
      } else {
        console.error('File not exists!');
      }
    }

    let userData = {};

    userData.profilePic = req.file.filename;

    //console.log(userData);

    await User.findOneAndUpdate(
      { _id: _userid },
      userData
    );

    res.status(200).json({ profilePic: profilePic, currentProfilePic: req.file.filename, message: "Profile pic is successfully updated!" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error:" + err });
  }

});

//===Update Multiple Files Upload===
router.put("/uploadmultiplefiles", [jwtMiddleware, upload.array("images", 10)], async (req, res) => {

  try {
    // const { error } = validateUserUpdate(req.body);
    // if (error)
    //   return res.status(400).json({ message: error.details[0].message });

    const reqFiles = [];
    const url = req.protocol + '://' + req.get('host')
    for (var i = 0; i < req.files.length; i++) {
      reqFiles.push(url + '/uploads/' + req.files[i].filename)
    }
    console.log(reqFiles);
    res.status(200).json({ imgUrl: reqFiles[0], message: "File(s) are successfully uploaded!" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error:" + err });
  }

});

//===Delete User===
router.route('/delete/:id').delete((req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: 'User is successfully deleted!' }))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;