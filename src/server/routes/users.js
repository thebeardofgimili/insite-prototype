const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const cloudinary = require('cloudinary')

//Cloudinary Config
cloudinary.config({
    cloud_name: 'insitecloud',
    api_key: '734933414891162',
    api_secret: 'kImuNpzMG9qjb8JgO6SxXx9h_YU'
})

//User Model
const User = require('../models/User');

//Login Page
router.get('/login', (req, res) => res.render('login'));

//Register Page
router.get('/register', (req, res) => res.render('register'));

//Register Handle
router.post('/register', multipartMiddleware, (req, res) => {
    //Text from form
    const {name, email, password, password2} = req.body;

    //File from form
    file = req.files.file;
    let errors = [];

    // Check required fields
    if(!name || !email || !password || !password2 || !file){
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check Passwords match
    if(password != password2){
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check Password length
    if(password.length < 6){
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
            
        })
    }
    else{
        //Validation Pass
        User.findOne({ email: email })
            .then(user =>{
                if(user){
                    //User Already Exists
                    errors.push({msg: 'Email is already registered'})
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        
                    })
                }
                else{
                    //Upload photo
                    cloudinary.v2.uploader.upload(file.path, {}, (error, result) => {
                    
                        //Create new User
                       const newUser = new User({
                        name: name,
                        email: email, 
                        password: password,
                        file: result.url,
                        file_id: result.public_id
                        })

                        //Hash Password
                        bcrypt.genSalt(10, (err, salt) => 
                            bcrypt.hash(newUser.password, salt, (error, hash) => {
                                if(err) throw err;

                                //Set Password to hashed 
                                newUser.password = hash;

                                //Save user
                                newUser.save()
                                    .then(user => {
                                        req.flash('success_msg', 'You are now a registered user and can now log in')
                                        res.redirect('/users/login');
                                    })
                                    .catch(err => console.log(err));
                            })
                        )
                    });
                }
                    
                
            })
    }
})

//Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        //This is the map!
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }) (req, res, next);
});

//Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

//welcome Page
router.get('/start', (req, res) => res.render('welcome'));

module.exports = router;
