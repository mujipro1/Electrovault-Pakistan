const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');


dotenv.config();

function seedAdminUser() {
    const adminEmail = 'admin@electrovault.pk';

    const checkQuery = 'SELECT * FROM users WHERE role = ? and email = ? LIMIT 1';
    db.query(checkQuery, ['admin', adminEmail], async (err, results) => {
        if (err) {
            console.error('Error checking admin existence:', err);
            return;
        }

        if (results.length > 0) {
            console.log('Admin user already exists. Seeder skipped.');
            return;
        }

        // Hash the password before inserting
        const insertQuery = `
            INSERT INTO users (email, phone, password, role, name, city, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const adminData = [
            adminEmail,
            '03334089697',              // phone
            'electrovault@789!',             // hashed password
            'admin',                    // role
            'Ali Hassan',               // name
            'Islamabad',                  // city
            'NUST H-12 Islamabad'          // address
        ];

        db.query(insertQuery, adminData, (err, result) => {
            if (err) {
                console.error('Error inserting admin user:', err);
                return;
            }

            console.log('Admin user seeded successfully.');
        });
    });
}

// seedAdminUser();

const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const shopRoutes = require('./routes/shopRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adRoutes = require('./routes/adRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Add this middleware to parse JSON bodies
app.use(express.json());

// Add this middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/ads', adRoutes);



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
