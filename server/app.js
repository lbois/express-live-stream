const express = require('express'),
    path = require('path'),
    Session = require('express-session'),
    bodyParse = require('body-parser'),
    mongoose = require('mongoose'),
    middleware = require('connect-ensure-login'),
    FileStore = require('session-file-store')(Session),
    config = require('./config/default'),
    flash = require('connect-flash'),
    port = 3333,
    app = express();
    const passport = require('./auth/passport');
    const node_media_server = require('./media_server');
    const redis = require('redis');

const thumbnail_generator = require('./cron/thumbnails');

let RedisStore = require('connect-redis')(Session)
let redisClient = redis.createClient()
 
mongoose.connect('mongodb://127.0.0.1/nodeStream' , { useNewUrlParser: true });
 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static('public'));


// app.use(require('cookie-parser')());

app.use(bodyParse.urlencoded({extended: true}));
app.use(bodyParse.json({extended: true}));
     // Register app routes
 
app.use(Session({
    store:  new FileStore({
        path : './server/sessions'
    }),// new RedisStore({ client: redisClient }),//
    secret: config.server.secret,
    cookie: {maxAge: Date().now + (60 * 1000 * 30) } ,
    resave: false, 
    saveUninitialized: false
}));
 
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use('/settings', require('./routes/settings'));
app.use('/streams', require('./routes/streams'));
app.use('/login', require('./routes/login'));
app.use('/register', require('./routes/register'));
app.use('/user', require('./routes/user'));

app.get('/logout', (req, res) => {
    req.logout();
    return res.redirect('/login');
});

app.get('*', middleware.ensureLoggedIn(), (req, res) => {
    res.render('index');
});
 
app.listen(port, () => console.log(`App listening on ${port}!`));
node_media_server.run();
thumbnail_generator.start();