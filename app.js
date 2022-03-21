//jshint esversion:6
require('dotenv').config();

const express = require("express");
const ejs = require("ejs");
const bodyParser = require ("body-parser");
const mongoose = require ("mongoose");

const bcrypt = require ("bcrypt");
const saltRounds = 10;

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/register", (req,res)=>{
    res.render("register");
});

app.post("/register", (req, res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User (
            {email: req.body.username, password: hash}
        );
        newUser.save((err)=>{
            if (err){
                console.log(err);
            } else {
                res.render("secrets");
            }
        });
    });    

});

app.post("/login", (req, res)=>{
    User.findOne(
        {email: req.body.username},
        (err, resoults)=>{
            if (err){
                console.log(err);
            } else if (!resoults){
                console.log("Invalid username");
            } else {
                bcrypt.compare(req.body.password, resoults.password, function(err, result) {
                    if (result){
                        res.render("secrets");
                    } else {
                        console.log("Invalid password");
                    }
                });
            }
        }
    );
}); 



app.listen("3000", ()=>{
    console.log("Server running on 3000");
});