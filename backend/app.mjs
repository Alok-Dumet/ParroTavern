import './config.mjs';
import './db.mjs';
import './passportConfig.mjs';
import passport from 'passport';
import session from 'express-session';
import {router as authRouter, isAuthenticated, campaignExists} from './routes/logRegisterAuth.mjs'
import {router as createCampaignRouter} from './routes/createCampaign.mjs'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

//creating my express app
const app = express();

//getting file path to app.mjs
const __filename = fileURLToPath(import.meta.url);

//getting directory app.mjs is in
const __dirname = path.dirname(__filename);

//allowing me to use req.body to read query string data as key-value pairs.
//foo=baz&bar=brillig
app.use(express.urlencoded({ limit: '10mb', extended: false }));

//allows me to read req.body as jsons also
app.use(express.json({ limit: '10mb'}));

//setting up my session middleware
app.use(session({
  secret: process.env.sessionKey ?? "LocalSecret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60, rolling: true} //logout automatically after an hour of inactivity
}));

//setting up passport to use my session. First one intializes passport, second one lets passport access my sessions made with express-session
app.use(passport.initialize());
app.use(passport.session());

//logs all pages accessed
app.use((req, res, next) => {
  // if(!req.path.includes("src") && !req.path.includes("assets")){
    console.log(req.path, req.body);
  // }
  next();
});

//checks every request to see if the path requested is a protected route. If they're not logged in, redirect to login page
app.use(isAuthenticated);

//checks every request to see if its a visit to a specific campaign
//If so, the campaign must exist and belong to the user (for now)
app.use(campaignExists);

//sets up route handlers for the main, login, and register pages I created in passportUsers.mjs
app.use(authRouter);

//sets up route handler for createCampaign page
app.use(createCampaignRouter);

//telling Express to use the dist directory of my frontend folder to serve static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

//Use the frontend to display any route called at all
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(process.env.PORT ?? 3000,()=>{
  console.log("backend is running on port: " + process.env.PORT);
});