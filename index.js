const express = require('express');
const app = express();
const User = require("./config/database.js");
const { hashSync } = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');



// view engine
app.set('view engine','ejs')
app.use(express.urlencoded({extended: true}))



// session
// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ 
    mongoUrl:'mongodb+srv://tofikabdu:X8kT8NCcvx0wKJQ0@nodejsauth.heonew2.mongodb.net/ ' ,
    collectionName : 'session'
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 
  }
}))
 

//passport configuration
require('./config/passport.js')
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.get('/login',(req,res)=>{
  res.render('login')
})


app.get('/register',(req,res)=>{
  res.render('register')
})



// app.post('/login',passport.authenticate('local',{successRedirect: 'protected'}))
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.status(500).json({ error: 'An error occurred during authentication.' });
    }
    if (!user) {
      // return res.status(404).json({ error: info.message})
      return res.redirect('/login?error=' + encodeURIComponent(info.message));
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({ error: 'An error occurred during login.' });
      }
      return res.redirect('/protected'); // success url
    });
  })(req, res, next);
});




app.post('/register',(req,res)=>{
  const newUser = new User({
    username : req.body.username,
    password :hashSync(req.body.password, 10)
  })

  newUser.save()
    .then(user => console.log(user))
    .catch(error => console.log(error));

  res.redirect('/login');
})



app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      return;
    }
    res.redirect('/login');
  });
});



app.get('/protected',(req,res)=>{
  if (req.user){
    res.send("protected get")
  } else {
    res.redirect('login')
  }
})












app.listen(3000, () => {
  console.log('Server started on port 3000');
});
