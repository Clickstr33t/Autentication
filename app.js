//jshint esversion:6
require('dotenv').config();

const express = require("express");
const ejs = require("ejs");
const bodyParser = require ("body-parser");
const mongoose = require ("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


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
    const newUser = new User (
        {email: req.body.username, password: req.body.password}
    );

    newUser.save((err)=>{
        if (err){
            console.log(err);
        } else {
            res.render("secrets");
        }
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
                if (resoults.password === req.body.password){
                    res.render("secrets");
                } else {
                    console.log("Invalid password");
                }
            }
        }
    );
}); 



app.listen("3000", ()=>{
    console.log("Server running on 3000");
});