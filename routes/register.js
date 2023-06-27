const router = require('express').Router();
let {User,validateRegisterUser} = require('../models/user.model');
const bcrypt = require("bcrypt");

//===Register New User===
router.post("/", async (req, res) => {

  try {
		const { error } = validateRegisterUser(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const userByEmail = await User.findOne({ email: req.body.email });
		if (userByEmail)
			return res.status(409).send({ message: "User with given email already Exist!" });
    
    const userByName = await User.findOne({ username: req.body.username });
		if (userByName)
			return res.status(409).send({ message: "This username is already taken!" });

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

    const fullname = req.body.fullname;
    const username = req.body.username;
    const email = req.body.email;
    const password = hashPassword;
    const phone = req.body.phone;
    const profilePic = req.body.profilePic;
    const address = req.body.address;
    
    const newUser = new User({fullname,username,email,password,phone,profilePic,address});

    await newUser.save();
    res.status(201).send({ message: "User created successfully" });
	} catch (err) {
		res.status(500).send({ message: "Internal Server Error:" + err });
	}
  
});

module.exports = router;