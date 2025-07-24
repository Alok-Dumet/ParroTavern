import mongoose from 'mongoose';
import express from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import '../db.mjs';

//my user model
const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');

//my express router
const router = express.Router();

//routes that users shouldn't be able to access unless logged in
const protectedPatterns = [
  /^\/$/,
  /^\/myProfile$/,
  /^\/profile\/[^/]+$/,
  /^\/logout$/,
  /^\/session$/,
  /^\/userData\/[^/]+$/,
  /^\/myCampaigns$/,
  /^\/publicCampaigns$/,
  /^\/createCampaign$/,
  /^\/campaign\/[^/]+\/[^/]+$/,
  /^\/newCampaign$/,
  /^\/deleteCampaign$/,
];

//routes that users should be able to access at all times
const unprotectedPatterns = [/^\/login$/, /^\/register$/];

//don't redirect any requests for assets and such
const ignoredPatterns = [/^\/(assets|images)\//];

//If the user attempts to reach a protected route while not logged in, redirect to login page
function isAuthenticated(req, res, next) {
  let path = req.path;
  const isProtected = protectedPatterns.some((pattern) => pattern.test(path));
  const isUnprotected = unprotectedPatterns.some((pattern) => pattern.test(path));
  const isIgnored = ignoredPatterns.some((pattern) => pattern.test(path));
  if (isIgnored) return next();

  if (isProtected) {
    if (req.user) {
      return next();
    } else {
      return res.redirect('/login');
    }
  } else if (isUnprotected) {
    return next();
  } else {
    if (req.user) {
      return res.redirect('/');
    } else {
      return res.redirect('/login');
    }
  }
}

//If the user attempts to reach a campaign, it must be a real existing one made by a real user
async function campaignExists(req, res, next) {
    let user = await User.findOne({ userName: req.params.userName });
    if (!user) return res.redirect('/createCampaign');
    let campaign = await Campaign.findOne({ campaignName: req.params.campaignName, dungeonMaster: user._id });
    if (!campaign) return res.redirect('/createCampaign');
    return next();
}

//If the user attempts to reach a campaign, it must be a real existing one made by a real user
async function userExists(req, res, next) {
    let user = await User.findOne({ userName: req.params.userName });
    if (!user) return res.redirect('/');
    return next();
}

//route handler for current users data
router.get("/session", async (req, res)=>{
  return res.json({user:{userName: req.user.userName, email: req.user.email}})
})

//route handler for retrieving any users data
router.get('/userData/:userName', async (req, res) => {
  try{
    const userName = req.params.userName;
    if(req.user.userName === userName) return res.json({ user: {userName: req.user.userName, email: req.user.email}});

    let foreignUser = await User.findOne({userName: req.params.userName});
    return res.json({user: {userName: foreignUser.userName}});
  }
  catch(err){
    console.log(err.message);
    res.status(500).json({ error: 'Something went wrong. It was probably your fault lol' });
  }
});

//route handler for logging out
router.get('/logout', (req, res) => {
  req.logOut(() => {
    req.session.destroy(() => {
      res.json({ logout: 'session destroyed' });
    });
  });
});

//localPassportMongoose's register method will hash a password for me, check if the user already exists, then make a user automatically
//If registration is succesful, we authenticate the user
router.post('/register', function (req, res) {
  User.register(
    new User({ userName: req.body.username, email: req.body.email }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(user);
        res.json({ error: err.message });
      } else {
        passport.authenticate('local')(req, res, function () {
          res.json({});
        });
      }
    }
  );
});

//authenticates user and logs them in if correct
//Passport automatically picks up req.body.username and password
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user) {
    if (user) {
      req.logIn(user, function (err) {
        if (err) console.log(err);
        res.json({user: {userName: req.user.userName, email: req.user.email}});
      });
    } else {
      res.json({ error: 'Your login or password is incorrect.' });
    }
  })(req, res, next);
});

const telemetryLimiter = rateLimit({
  windowMs: 60000, //1 minute
  max: 10, //limit each IP to 10 requests per minute
  message: 'Too many telemetry reports from this IP',
});

router.post("/telemetry", telemetryLimiter, express.json(), (req, res) => {
  const log = req.body;

  console.log(`[Telemetry] ${new Date().toISOString()}`);
  console.log(log);

  res.status(204).s end();
});


export { router, isAuthenticated, campaignExists, userExists };
