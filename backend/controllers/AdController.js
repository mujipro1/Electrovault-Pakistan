const db = require('../config/db');

const getAllAds = (req, res) => {
    db.query(`
        SELECT * FROM ads
    `, (err, ads) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(ads);
    });
}
  

const updateAds = (req, res) => {
    const { ad_number } = req.body;
    const image = req.file.buffer;

    db.query(`
        SELECT * FROM ads WHERE ad_number = ?
    `, [ad_number], (err, ads) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (ads.length === 0) {
            // Insert new ad if it doesn't exist
            db.query(`
                INSERT INTO ads (ad_number, image) VALUES (?, ?)
            `, [ad_number, image], (err, result) => {
                if (err) {
                    console.error('Database error during insert:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Ad inserted successfully' });
            });
        } else {
            // Update existing ad
            db.query(`
                UPDATE ads SET image = ? WHERE ad_number = ?
            `, [image, ad_number], (err, result) => {
                if (err) {
                    console.error('Database error during update:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Ad updated successfully' });
            });
        }
    });
};

module.exports = { getAllAds, updateAds };
