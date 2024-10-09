if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express');
const connectDB = require('./db'); 
const app = express();
const User = require('./models/User');
connectDB();

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



initializePassport(passport);

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})




app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar si el correo electrónico ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'El correo electrónico ya está registrado');
      return res.redirect('/register');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await newUser.save(); 

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});

app.delete('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); 
    }
    res.redirect('/login'); 
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)