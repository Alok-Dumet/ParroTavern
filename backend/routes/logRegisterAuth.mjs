import mongoose from 'mongoose';
import express from 'express';
import passport from 'passport';
import '../db.mjs';

//my user model
const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');

//my express router
const router = express.Router();

//routes that users shouldn't be able to access unless logged in
const protectedPatterns = [
  /^\/$/,
  /^\/profile$/,
  /^\/logout$/,
  /^\/session$/,
  /^\/myCampaigns$/,
  /^\/publicCampaigns$/,
  /^\/createCampaign$/,
  /^\/createCampaign\/[^\/]+\/[^\/]+$/,
  /^\/newCampaign$/,
  /^\/save$/,
  /^\/elements\/[^\/]+$/
];

const unprotectedPatterns = [/^\/login$/, /^\/register$/];

const ignoredPatterns = [/^\/(assets|images)\//];

//If the user attempts to reach a protected route while not logged in, redirect to login page
function isAuthenticated(req, res, next){
  let path = req.path;
  const isProtected = protectedPatterns.some(pattern => pattern.test(path));
  const isUnprotected = unprotectedPatterns.some(pattern => pattern.test(path));
  const isIgnored = ignoredPatterns.some(pattern=> pattern.test(path));
  if(isIgnored) return next();

  if(isProtected){
    if(req.user){
      return next();
    }else{
      return res.redirect("/login");
    }
  }
  else if(isUnprotected){
    return next();
  }
  else{
    if(req.user){
      return res.redirect("/");
    }else{
      return res.redirect("/login");
    }
  }
}

//If the user attempts to reach a campaign, it must be a real existing one made by a real user
async function campaignExists(req, res, next){
  let path = req.path;
  let pattern = /^\/createCampaign\/[^\/]+\/[^\/]+$/;
  if(pattern.test(path)){
    path = req.path.split("/");
    let dungeonMaster = decodeURIComponent(path[2]);
    let campaignName = decodeURIComponent(path[3]);
    let user = await User.findOne({userName: dungeonMaster});
    if(!user){
      return res.redirect("/createCampaign");
    }
    let campaign = await Campaign.findOne({campaignName: campaignName, dungeonMaster: user._id});
    if(!campaign){
      return res.redirect("/createCampaign");
    }
    return next();
  }
  else{
    next();
  }
}

//route handler for sessions
router.get("/session", (req, res)=>{
  res.json({user: req.user})
})

router.get("/logout", (req, res)=>{
  req.logOut(()=>{
    req.session.destroy(()=>{
      res.json({logout: "session destroyed"})
    });
  });
});
  
//localPassportMongoose's register method will hash a password for me, check if the user already exists, then make a user automatically
//If registration is succesful, we authenticate the user
router.post('/register', function(req, res) {
  User.register(new User({userName:req.body.username, email:req.body.email}), req.body.password, (err, user)=>{
    if(err){
      res.json({error: err.message});
    }
    else{
      passport.authenticate('local')(req, res, function() {
        res.json({});
      });
    }
  });
});

//authenticates user and logs them in if correct
//Passport automatically picks up req.body.username and password
router.post('/login', function(req,res,next) {
  passport.authenticate('local', function(err,user) {
    if(user) {
      req.logIn(user, function(err) {
      res.json({})
      });
    } else {
      res.json({error: "Your login or password is incorrect."})
    }
  })(req, res, next);
});

export{
  router,
  isAuthenticated,
  campaignExists
};
