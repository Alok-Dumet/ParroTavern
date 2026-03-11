import mongoose from 'mongoose';
import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
// import rateLimit from 'express-rate-limit';
import '../db.mjs';

//my user model
const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');

//my express router
const router = express.Router();

//routes that users shouldn't be able to access unless logged in
const protectedPagePatterns = [
  /^\/$/,
  /^\/profile\/[^/]+$/,
  /^\/yourCampaigns$/,
  /^\/campaign\/[^/]+\/[^/]+$/,
];
const protectedApiPatterns = [
  /^\/users\/[^/]+$/,
  /^\/logout$/,
  /^\/campaigns$/,
  /^\/campaigns\/[^/]+$/,
  /^\/campaigns\/[^/]+\/elements$/,
  /^\/thumbnails\/[^/]+$/,
];

//routes that users should be able to access at all times
const unprotectedPatterns = [/^\/login$/, /^\/register$/, /^\/verify\/[^/]+$/];

//don't redirect any requests for assets and such
const ignoredPatterns = [/^\/(assets|images)\//];

//If the user attempts to reach a protected route while not logged in, redirect to login page
function isAuthenticated(req, res, next) {
  let path = req.path;
  const isProtectedPage = protectedPagePatterns.some((pattern) => pattern.test(path));
  const isProtectedApi = protectedApiPatterns.some((pattern) => pattern.test(path));
  const isUnprotected = unprotectedPatterns.some((pattern) => pattern.test(path));
  const isIgnored = ignoredPatterns.some((pattern) => pattern.test(path));
  if (isIgnored) return next();

  if (isProtectedPage) {
    if (req.user) {
      // console.log("protected path allowed");
      return next();
    } else {
      // console.log("protected path forbidden, redirecting to login");
      return res.status(401).redirect('/login');
    }
  } else if(isProtectedApi){
    if (req.user) {
      // console.log("protected API path allowed", path);
      return next();
    } else {
      return res.status(401).json({ error: 'You must be logged in to access this resource.'});
    }
  }
    else if (isUnprotected) {
    // console.log("unprotected path allowed");
    return next();
  } else {
    if (req.user) {
      // console.log("Non-existant path, redirecting to home");
      return res.status(404).redirect('/');
    } else {
      // console.log("Non-existant path, redirecting to login");
      return res.status(404).redirect('/login');
    }
  }
}

//If the user attempts to reach a user or campaign, it must be a real one
async function userCampaignExists(req, res, next) {
    let user = await User.findOne({ userName: req.params.userName });
    if (!user) return res.status(404).redirect('/');
    console.log("user " + user.userName + " exists")
    if(req.params.campaignName){
      let campaign = await Campaign.findOne({ campaignName: req.params.campaignName, dungeonMaster: user._id });
      if (!campaign) return res.status(404).redirect('/');
      console.log("campaign " + campaign.campaignName + " exists");
    }
    return next();
}

//Helper function for route handlers to check for if a user exists
async function userExists(req, res, userName){
  const foreignUser = await User.findOne({ userName });
  if (!foreignUser) {
    res.status(404).json({ error: 'User not found.' });
    return null;
  }
  return foreignUser;
}

//route handler for retrieving any users data
router.get('/users/:userName', async (req, res) => {
  try{
    const userName = req.params.userName;
    if(userName === "me") return res.json({ user: {userName: req.user.userName, email: req.user.email}});

    const foreignUser = await userExists(req, res, userName);
    if (!foreignUser) return; 

    return res.json({user: {userName: foreignUser.userName}});
  }
  catch(err){
    console.log(err.message);
    return res.status(500).json({ error: 'Something went wrong on the Server. We apologize' });
  }
});

//route handler for logging out
router.post('/logout', (req, res) => {
  req.logOut(() => {
    req.session.destroy(() => {
      return res.json({ logout: 'session destroyed' });
    });
  });
});

//register a new user and make sure to verify them through email
router.post('/register', async function (req, res) {
  try{
    const {username, email, password} = req.body;
    console.log(username, email);

    //find if the username or email already exists
    const existingUserName = await User.findOne({userName: username});
    const existingEmail = await User.findOne({email: email});
    if (existingUserName){
      console.log("Username already exists");
      return res.status(409).json({ error: 'This username is already taken.' });
    }
    if (existingEmail){
      console.log("Email already exists");
      return res.status(409).json({ error: 'An account is already registered with this email.' });
    }

    //generate a verification token and send it to the user with an expiration time of 10 minutes
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = new User({
      userName: username,
      email: email,
      verified: false,
      verificationToken: verificationToken,
      expireAt: new Date(Date.now() + 600000) //10 minutes
    });

    //temporarily register the user as unverified
    await User.register(newUser, password);

    //send an email to the user with a link to verify their account
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    //use domain if it exists otherwise use localhost
    const verificationLink = process.env.DOMAIN ? `${process.env.DOMAIN}/verify/${verificationToken}` : `http://localhost:3000/verify/${verificationToken}`;

    //Send the verification email stating its from a no-reply email address
    await transporter.sendMail({
      from: '"ParroTavern" <no-reply@ParroTavern.com>',
      to: email,
      subject: 'Verify your ParroTavern account',
      text: `Please verify your account by clicking the following link: ${verificationLink}`,
      html: `<p>Please verify your account by clicking the following link:</p><a href="${verificationLink}">${verificationLink}</a>`,
    });

    //Respond with no error
    res.json({});
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: 'Something went wrong on the Server. We apologize' });
  }
});

router.post('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      expireAt: { $gt: Date.now() },
    });

    console.log(user);

    if (!user) return res.status(404).json({ error: 'Problem' });

    user.verified = true;
    user.verificationToken = undefined;
    user.expireAt = undefined;
    await user.save();

    req.logIn(user, function (err) {
      if (err) console.log(err);
      return res.json({});
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: 'Something went wrong on the Server. We apologize' });
  }
});




//authenticates user and logs them in if correct
//Passport automatically picks up req.body.username and password
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user) {
    if (user) {
      console.log(user.pisspee);
      if(user.verified === false) return res.status(403).json({ error: 'Please verify your email before logging in.' });
      req.logIn(user, function (err) {
        if (err) console.log(err);
        res.json({user: {userName: req.user.userName, email: req.user.email}});
      });
    } else {
      res.status(401).json({ error: 'Your login or password is incorrect.' });
    }
  })(req, res, next);
});

// const telemetryLimiter = rateLimit({
//   windowMs: 60000, //1 minute
//   max: 10, //limit each IP to 10 requests per minute
//   message: 'Too many telemetry reports from this IP',
// });

// Logs frontend errors
// router.post("/telemetry", telemetryLimiter, express.json(), (req, res) => {
//   const log = req.body;

//   console.log(`[Telemetry] ${new Date().toISOString()}`);
//   console.log(log);

//   res.status(204).send();
// });


export { router, isAuthenticated, userCampaignExists };
