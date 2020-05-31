var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var expressValidator = require("express-validator");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require("mongodb");
var mongoose = require("mongoose");
const validadorCpf = require('validar-cpf');
mongoose.Promise = global.Promise;
const settings = require("./credentials.json");
var cors = require("cors");

const mongoConnectionString =
  "mongodb+srv://time_31:MYhgUjV0MiOTClor@cluster0-y0e9d.mongodb.net/test?retryWrites=true&w=majority";

console.log("mongoConnectionString => ", mongoConnectionString);

mongoose.connect(mongoConnectionString);
var db = mongoose.connection;
var users = require("./routes/users");
var nodemailer = require("nodemailer");

// Init App
var app = express();

// View Engine
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs({ defaultLayout: "layout" }));
app.set("view engine", "handlebars");

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Express Session
app.use(
  session({
    secret: "session secret key",
    saveUninitialized: true,
    resave: true,
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

app.use(cors({ origin: 'http://localhost:3000' , credentials :  true}));
app.options('*', cors());


app.use("/users", users);

// Set Port
app.set("port", process.env.PORT || 5000);

app.listen(app.get("port"), function () {
  console.log("Server started on port " + app.get("port"));
});
