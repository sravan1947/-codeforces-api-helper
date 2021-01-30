const bodyParser = require('body-parser');
const express=require('express');
const passport=require('passport');
var User = require('../models/user');
const usersRouter = express.Router();
const cors=require('./cors');
usersRouter.use(bodyParser.json());
var authenticate = require('../authenticate');

usersRouter.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )
usersRouter.route('/')
.get(authenticate.verifyUser,authenticate.verifyAdmin,cors.corsWithOptions,(req,res,next) => {
    User.find({})
    .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
})

usersRouter.post('/signup',cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        console.log('done');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});

usersRouter.post('/login',cors.corsWithOptions, (req, res, next) => {

  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
      }
      //console.log('jjjjjjj '+req.user);
      var token = authenticate.getToken({username: req.user.username});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      //res.json(req.user)
      res.json({success: true, status: 'Login Successful!', token: token});
    }); 
  }) (req, res, next);
});

usersRouter.get('/checkJWTtoken',cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      return next(err);
    
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user});

    }
  }) (req, res);
});
usersRouter.route('/update')
.post(authenticate.verifyUser,cors.corsWithOptions,(req, res, next) => {
    User.findOne({username:req.user.username})
    .then((user) => {
        console.log(user);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        user.codeforces_handle=req.body.codeforces;
        user.save();
        res.json({success:true});
    }, (err) => next(err))
    .catch((err) => next(err));
});
module.exports=usersRouter;
