import './config.mjs';
import './db.mjs';
import './passportConfig.mjs';
import passport from 'passport';
import session from 'express-session';
import compression from 'compression';
// import helmet from 'helmet';
import cors from 'cors';
import express from 'express';
import path from 'path';
// import fs from "fs";
// import https from "https";
import { fileURLToPath } from 'url';
import {
  router as authRouter,
  isAuthenticated,
  campaignExists,
  userExists,
} from './routes/logRegisterAuth.mjs';
import { router as createCampaignRouter } from './routes/createCampaign.mjs';
// import logger from "./logger.mjs";

// -------------------------------------------------------------------------------- Path Setup ----------------------------------------------------------------------------------------------
//getting file path to app.mjs
const __filename = fileURLToPath(import.meta.url);

//Same __Filename but excluding file name (app.mjs)
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------------------------- Creating Express App ------------------------------------------------------------------------------------
const app = express();

// -------------------------------------------------------------------------------- (Later implement SSL Certificates) ----------------------------------------------------------------------
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, '../cert/key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, '../cert/cert.pem'))
// };

// -------------------------------------------------------------------------------- Cross Origin Resource Sharing (CORS) ---------------------------------------------------------------------
//NO ONE IS ALLOWED TO ACCESS MY API EXCEPT FOR THE FRONTEND, LOCALHOST, AND WHATEVER URL I USE FOR THE PRODUCTION VERSION OF THE FRONTEND
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'whateverURLParroTavernWillUse'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization'],
  credentials: true
}));


// -------------------------------------------------------------------------------- Helmet Security Headers ----------------------------------------------------------------------------------

//adds the Helmet library's default security headers
// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       imgSrc: ["'self'", "data:", "blob:"],
//       connectSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );
app.disable("x-powered-by");

// -------------------------------------------------------------------------------- Compression ----------------------------------------------------------------------------------------------
//compress data sent over to increase speed
app.use(compression());

// -------------------------------------------------------------------------------- Accepted formats for body parsing ------------------------------------------------------------------------
//allowing me to use req.body to read query string data as key-value pairs.
//foo=baz&bar=brillig
app.use(express.urlencoded({ limit: '10mb', extended: false }));

//allows me to read req.body as jsons also
app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------------------------- Session and Passport Session -----------------------------------------------------------------------------
//Use an array of long randomly generate strings as the session key. Change these every so often to keep the session secure.
app.use(
  session({
    secret: process.env.sessionKey ?? 'LocalSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2, rolling: true }, //logout automatically after an hour of inactivity
  })
);

//setting up passport to use my session. First one intializes passport, second one lets passport access my sessions made with express-session
app.use(passport.initialize());
app.use(passport.session());

// -------------------------------------------------------------------------------- Logging pages accessed for local testing -----------------------------------------------------------------
//logs all pages accessed
app.use((req, res, next) => {
  console.log(req.path, req.body ? req.body : "");
  // logger.info(`${req.path} was visited`, req.body ? req.body : "");
  next();
});

// -------------------------------------------------------------------------------- Authentication Checks ------------------------------------------------------------------------------------
//checks every request to see if the path requested is a protected route. If they're not logged in, redirect to login page
app.use(isAuthenticated);

//checks if a user or campaign exists before allowing access to the route
app.use("/campaign/:userName/:campaignName", campaignExists);
app.use("/userData/:userName", userExists);
app.use("/profile/:userName", userExists);

// -------------------------------------------------------------------------------- Route Handlers ------------------------------------------------------------------------------------------
//sets up route handlers for the main, login, and register pages I created in passportUsers.mjs
app.use(authRouter);

//sets up route handler for createCampaign page
app.use(createCampaignRouter);

// -------------------------------------------------------------------------------- Marking Files as Cacheable -------------------------------------------------------------------------------
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

// -------------------------------------------------------------------------------- Fallback ------------------------------------------------------------------------------------------------
//Use the frontend to display any route called at all
app.get(/.*/, (req, res) => {
  return res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// -------------------------------------------------------------------------------- Starting the Server -------------------------------------------------------------------------------------
app.listen(process.env.PORT ?? 3000, () => {
  console.log('backend is running on port: ' + process.env.PORT);
});

// -------------------------------------------------------------------------------- (Later implement SSL Certificates with HTTPS) -----------------------------------------------------------
// https.createServer(sslOptions, app).listen(process.env.PORT ?? 3000, () => {
//   console.log('HTTPS server is running on port: ' + process.env.PORT);
// });

