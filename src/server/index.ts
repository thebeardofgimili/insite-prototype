/*
 * embed webpack-dev-server
 */
let webpack, webpackDevMiddleware, webpackHotMiddleware, webpackConfig;

webpack = require("webpack");
webpackDevMiddleware = require("webpack-dev-middleware");
webpackConfig = require("../../webpack.config");
webpackHotMiddleware = require("webpack-hot-middleware");
import {ensureAuthenticated} from "./config/auth" ;
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

import { Server } from "colyseus";
import http from "http";
import express from "express";
import path from "path";
import basicAuth from "express-basic-auth";
import socialRoutes from "@colyseus/social/express";
import { monitor } from "@colyseus/monitor";

import { ArenaRoom } from "./rooms/ArenaRoom";

export const port = Number(process.env.PORT || 8080);
export const endpoint = "localhost";

export let STATIC_DIR: string;

const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

//Databse Configuration
const db = require('./config/keys').MongoURI;

//Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
    .then(()=> console.log('MongoDB connected'))
    .catch(err => console.log(err));

const app = express();
const gameServer = new Server({
  server: http.createServer(app),
  express: app
});

gameServer.define("arena", ArenaRoom);

// Express Session Middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));


//Passport Config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
// Connect Flash
app.use(flash());

// Conditional went here
const webpackCompiler = webpack(webpackConfig({}));
app.use(webpackDevMiddleware(webpackCompiler, {}));
app.use(webpackHotMiddleware(webpackCompiler));

// EJS
app.use(expressLayouts)
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = (req as any).flash('success_msg');
    res.locals.error_msg = (req as any).flash('error_msg');
    res.locals.error = (req as any).flash('error');
    next();
});

// on development, use "../../" as static root
//STATIC_DIR = path.resolve(__dirname, "..", "..");
//game
app.all('*', (req, res, next) => {
  if(!req.url.includes('users')){
    console.log(req.url);
    ensureAuthenticated(req, res, next);
  }   
  else{
    console.log(req.url);
    next();
  }
});

//game!
STATIC_DIR = path.resolve(__dirname, "..", "..");

app.use('/', express.static(STATIC_DIR));

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


gameServer.listen(port);
console.log(`Listening on http://${endpoint}:${port}`);






