const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const UserVerification = require("../models/UserVerification");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const getEmailHtml = require("../utils/getEmailHtml");
const randomString = require("random-string");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//Nodemailer

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

const sendVerificationEmail = ({ _id, email }, res) => {
  const currentUrl = "https://snow-net.herokuapp.com/";
  const uniqueString = uuidv4() + _id;
  const html = getEmailHtml(
    currentUrl + "api/auth/verify/" + _id + "/" + uniqueString
  );

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Email - Snow",
    html,
  };

  //Hash

  const salts = 10;
  bcrypt
    .hash(uniqueString, salts)
    .then((hashedUS) => {
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUS,
        createdAt: Date.now(),
        expiresAt: Date.now() + 14400000,
      });
      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              res.status(200).json({
                status: "Pending",
                message: "Verification email sent",
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json(err);
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
};

//Verify

router.get("/verify/:id/:uniqueString", async (req, res) => {
  try {
    const { id, uniqueString } = req.params;
    const user = await UserVerification.findOne({ id });
    if (user?.expiresAt < Date.now) {
      try {
        await UserVerification.deleteOne({ id });
        res.redirect("http://snowcy.com/verified/error");
      } catch (err) {
        console.log(err);
        return res.status(500).json("User verification as expired");
      }
    } else {
      const validUnique = true;
      if (!validUnique)
        return res.status(500).json("Unique string is invalid!");

      await User.updateOne({ _id: id }, { verified: true });
      await UserVerification.deleteOne({ id });
      res.redirect("http://snowcy.com/verified/success");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//Register

router.post("/register", async (req, res) => {
  const { username, name, lastname, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const userFound = await User.find({ username });
    const emailFound = await User.find({ email });

    if (emailFound.length > 0) return res.status(200);
    if (userFound.length > 0)
      return res.status(200).json("This username is already taken");

    const user = new User({
      username,
      name,
      lastname,
      email,
      password: hashPassword,
      verified: false,
      profilePic: `https://source.boringavatars.com/beam/120/${randomString(
        20
      )}/?colors=5FC9F3,2E79BA,1E549F,081F37,247881,43919B,30AADD,00FFC6,F7E2E2,61A4BC,5B7DB1,1A132F,201A1A40,20270082,207A0BC0,20FA58B6,B20600,FF5F00`,
    });

    const newUser = await user.save();
    sendVerificationEmail(newUser, res);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("User Not Found");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json("Incorrect Password");

    if (!user.verified) return res.status(400).json("User is not verified");

    jwt.sign({ user }, "usersecret", (err, token) =>
      res.status(200).json({ token })
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

const verifyToken = (req, res, next) => {
  try {
    const bearer = req.headers["authorization"];

    if (typeof bearer !== "undefined") {
      const token = bearer.split(" ")[1];
      req.token = token;
      next();
    } else {
      res.status(403);
    }
  } catch (err) {
    console.log(err);
  }
};

//VALID EMAIL

router.post("/email", async (req, res) => {
  try {
    const { email } = req.body;
    const isEmail = await User.find({ email });
    if (isEmail.length >= 1) res.status(200).json("");
    else res.status(200).json(true);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error getting email");
  }
});

router.post("/password", async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await User.findOne({ email });

    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) res.status(200).json(true);
    else res.status(200).json(false);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post("/username", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (user) res.status(200).json(true);
    else res.status(200).json(false);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error getting username.");
  }
});

//GET USER WITH TOKEN

router.post("/userdata", verifyToken, async (req, res) => {
  try {
    jwt.verify(req.token, "usersecret", (err, authData) => {
      if (err) {
        res.status(403);
      } else {
        res.status(200).json(authData);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json("Error validation token");
  }
});

//Verify

module.exports = router;
