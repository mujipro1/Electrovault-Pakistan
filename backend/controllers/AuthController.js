const db = require('../config/db');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const login = (req, res) => {
    const { email, password } = req.body;
    db.query(`
        SELECT * FROM users WHERE email = ?
    `, [email], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (!results.length) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const user = results[0];

        // bcrypt.compare(password, user.password, (err, isMatch) => {
            
        //     if (err) {
        //         res.status(500).json({ error: 'Error comparing passwords' });
        //         return;
        //     }
        //     if (!isMatch) {
        //         res.status(401).json({ error: 'Invalid email or password' });
        //         return;
        //     }

        //     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        //     res.json({ token, user });
        // });

        // dont compare with bcrypt, simply match passwords
        if (password !== user.password) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user });
    }
    );
}

const addNewUser = (req, res) => {
    const { fullName, email, password, phoneNumber, address, city, isBuyer } = req.body;

    const role = isBuyer ? 'buyer' : 'seller';

    db.query(`
        INSERT INTO users (name, email, password, phone, address, city, role) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [fullName, email, password, phoneNumber, address, city, role], (err) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
}

 
module.exports = { login, addNewUser };