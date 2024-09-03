const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const APP_ID = 7665918636858856;
const APP_SECRET = "7362ed470ab871ad0928da6e1e74954c";
const REDIRECT_URI = 'https://travomile-backend.vercel.app/auth/facebook/callback';
const axios = require('axios');
const User = require('../../models/Users');

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    if (req.user) {
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.redirect('https://travomil-frontend.vercel.app/');
    } else {
        res.redirect('https://travomil-frontend.vercel.app/404');
    }
});

router.get('/facebook', (req, res) => {
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email`;
    res.redirect(url);
});

router.get('/facebook/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { data } = await axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&code=${code}&redirect_uri=${REDIRECT_URI}`);

        const { access_token } = data;

        const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);
        let user = await User.findOne({ facebookid: profile.id });
        if (user) {
            user.username = profile.name;
            user.email = profile.email;
            user.facebookid = profile.id;
            await user.save();
        }
        else {
                user = new User({
                    username: profile.name,
                    email: profile.emails,
                    facebookid: profile.id
                });

            await user.save();
        }
        res.redirect('https://travomil-frontend.vercel.app/');
    }
    catch (error) {
        console.error('Error:', error);
        res.redirect('/login');
    }
});




module.exports = router;
