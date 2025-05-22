import passport from 'passport';
import mongoose from 'mongoose';
import { Strategy as LocalStrategy } from 'passport-local';

//my user model
const User = mongoose.model('User');

//Passport will use whatever strategy I pass into LocalStrategy() to authenticate username and password
//The strategy I'm using is the one passportLocalMongoose gave to my User model
//This will trigger whenever I call passport.authenticate('local')
passport.use(new LocalStrategy(User.authenticate()));

//serialize stores the user's ID in the session
passport.serializeUser(User.serializeUser());
//deserialize checks the user's ID from the session, then uses it to find the full user object stored in MongoDB and attch it to the session (req.user)
passport.deserializeUser(User.deserializeUser());
