const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const posts = [
    { username: 'Yasir', title: 'Post 1' },
    { username: 'Bugon', title: 'Post 2' },
];

let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null)
        return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken))
        return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken })
    })
})

app.delete('/logout', (req, res)=>{
    refreshTokens = refreshTokens.filter(token=>token !== req.body.token)
    res.sendStatus(204)
})

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('Token not found');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log('JWT Verification Error:', err.message);
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        console.log('Decoded User:', user);
        next();
    });
}

// Login route
app.post('/login', (req, res) => {
    const username = req.body.username;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const user = { name: username };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204);
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

// Protected posts route using auntheticateToken
app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name));
});

// Start the server
app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});