//jshint esversion:6
require('dotenv').config();

const express = require("express");
const ejs = require("ejs");
const bodyParser = require ("body-parser");
const mongoose = require ("mongoose");
//  1 RICHIAMARE EXPRESS-SESSION
const session = require ("express-session");
//  2 RICHIAMARE PASSPORT
const passport = require ("passport");
//  3 RICHIAMARE PASSPORT-LOCAL-MONGOOSE  >>> NON E' NECESSARIO RICHIAMARE PASSPORT-LOCAL
const passportLocalMongoose = require ("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

/*
    4 SOTTO LE DICHIARAZIONI DI EXPRESS E PRIMA DELLE DICHIARAZIONI DI MONGOOSE
    INSERIRE IL CODICE RICHIESTO DA EXPRESS-SESSION
*/

app.use(session({
  secret: "Our little test",
  resave: false,
  saveUninitialized: true
}));

/*
    5 SOTTO SESSION INSERIRE LE DICHIARAZIONI RICHIESTE DA PASSPORT
*/

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

/* 
    6  DOPO LA DICHIARAZIONE DELLO SCHEMA
    SETTARE PASSPORT-LOCAL-MONGOOSE COME PLUG-IN
    IN FINE CREARE IL MODELLO
    
*/
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);


/*
    7 INSERIRE LA CONFIGURAZIONE DI PASSPORT-LOCAL-MONGOOSE ALLA FINE
*/


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/register", (req,res)=>{
    res.render("register");
});

app.get("/secrets", (req, res)=>{
    if (req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});


app.post('/register', (req, res)=>{
    User.register({username: req.body.username, active: true}, req.body.password, (err, user)=>{
        if (err){
            console.log(user);
        }
        //Utilizzo il metodo LOGIN di passport
        req.login(user, function(err) {
            if (err) { console.log(err);}
            res.redirect('/secrets');
          }); 
    });
});

app.post('/login', 
  passport.authenticate('local', 
  { 
    successRedirect: "/secrets",
    failureRedirect: "/login" })
  );

app.get("/logout", (req, res)=>{
    //USARE IL METODO LOGOUT DI PASSPORT
    req.logout();
    res.redirect("/");
});



app.listen("3000", ()=>{
    console.log("Server running on 3000");
});