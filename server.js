const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const posts = [
    { username: 'Yasir', title: 'Post 1' },
    { username: 'Bugon', title: 'Post 2' },
];

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

// Protected posts route
app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name));
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});