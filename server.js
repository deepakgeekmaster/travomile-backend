const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth/google');
const formauthRoutes  = require('./routes/auth/auth');
const profileRoute  = require('./routes/Profile/Profile');
const normalRoutes  = require('./routes/web')
const adminRoutes  = require('./routes/Admin/route')
const cookieParser = require('cookie-parser');

const useragent = require('useragent');
const MongoStore = require('connect-mongo');

require('dotenv').config();
const cors = require('cors');

require('./passport');

const app = express();
const port = 3000;

app.use(cookieParser());

app.use(cors({
    origin: [
        'https://travomil-frontend.vercel.app',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
}));

app.use(express.json());


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: process.env.MONGO_URI, 
        collectionName: 'sessions' 
    }),
    cookie: { secure: true }
}));
    const store = new MongoStore({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    });
    console.log(store);
    store.on('error', (error) => {
        console.error('Session store error:', error);
    });

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
        const agent = useragent.parse(req.headers['user-agent']);
        req.device = {
          browser: agent.toAgent(),
          os: agent.os.toString(),
          device: agent.device.toString()
        };
        next();
});

app.use('/auth', authRoutes);
app.use('/formauth', formauthRoutes);
app.use('/Profile', profileRoute);
app.use('/Api',normalRoutes);
app.use('/Admin', adminRoutes);

app.get('/api/getCookie', (req, res) => {
    const otp = req.cookies.otp;
    res.json({ otp });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
