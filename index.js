const express= require('express');
const http= require('http');
const bodyparser=require('body-parser');
const authenticate =require('./authenticate');
const mongoose = require('mongoose');
const usersRouter=require('./routes/users');
const codeforcesRouter=require('./routes/codeforces');
const config=require('./config')
var passport = require('passport');
const url = 'mongodb://localhost:27017/cpt';
const port = process.env.PORT || 3000
const app=express();
const server=http.createServer(app);
const connect = mongoose.connect(config.mongoUrl,{ useNewUrlParser: true ,useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true } );
connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });
app.use(passport.initialize());
app.use(passport.session());
app.use( bodyparser.json() );
app.use(bodyparser.urlencoded({
    extended: true
 })); 
app.use('/users',usersRouter);
app.use('/codeforces',codeforcesRouter);
app.post('/lll',(req,res)=>
{
    console.log(req.body);
    res.json(req.body);
}
);
/*app.use(authenticate.verifyUser,(req, res, next) => {
    console.log(req.user);

    if (!req.user) {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      next(err);
    }
    else {
          next();
    }
})*/
app.get('/', (req, res) => res.sendFile(__dirname+'/index.html'))


server.listen(port,()=>
{
console.log("Listening at port "+port);
}
);
