import './config.mjs';
import './db.mjs';
import './passportConfig.mjs';
import passport from 'passport';
import session from 'express-session';
import compression from 'compression';
import helmet from 'helmet';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  router as authRouter,
  isAuthenticated,
  campaignExists,
  userExists,
} from './routes/logRegisterAuth.mjs';
import { router as createCampaignRouter } from './routes/createCampaign.mjs';
// import logger from "./logger.mjs";

//getting file path to app.mjs
const __filename = fileURLToPath(import.meta.url);

//getting directory app.mjs is in
const __dirname = path.dirname(__filename);

//creating my express app
const app = express();

//compress data sent over to increase speed
app.use(compression());

//adds the Helmet library's default security headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
app.disable("x-powered-by");

//allowing me to use req.body to read query string data as key-value pairs.
//foo=baz&bar=brillig
app.use(express.urlencoded({ limit: '10mb', extended: false }));

//allows me to read req.body as jsons also
app.use(express.json({ limit: '10mb' }));

//setting up my session middleware
app.use(
  session({
    secret: process.env.sessionKey ?? 'LocalSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60, rolling: true }, //logout automatically after an hour of inactivity
  })
);

//setting up passport to use my session. First one intializes passport, second one lets passport access my sessions made with express-session
app.use(passport.initialize());
app.use(passport.session());

//logs all pages accessed
app.use((req, res, next) => {
  console.log(req.path, req.body ? req.body : "");
  // logger.info(`${req.path} was visited`, req.body ? req.body : "");
  next();
});

//checks every request to see if the path requested is a protected route. If they're not logged in, redirect to login page
app.use(isAuthenticated);

//checks every request to see if its a visit to a specific campaign
//If so, the campaign must exist and belong to the user (for now)
app.use("/elements/:userName/:campaignName", campaignExists);

//checks if a particular user exists if visiting the profile of a user
app.use("/userData/:userName", userExists);
app.use("/profile/:userName", userExists);

//sets up route handlers for the main, login, and register pages I created in passportUsers.mjs
app.use(authRouter);

//sets up route handler for createCampaign page
app.use(createCampaignRouter);

//globally set no-store caching (overwritten below)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

//Serve static files WITH caching from the dist directory
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
  setHeaders: (res, path) => {
   if (path.endsWith(".html")) {
      //Don't cache HTML so that when I npm run build after an update the changes are reflected
      res.setHeader("Cache-Control", "no-cache");
    } else {
      //Cache all other file to speed up loads for user
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));



//Use the frontend to display any route called at all
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(process.env.PORT ?? 3000, () => {
  console.log('backend is running on port: ' + process.env.PORT);
});
