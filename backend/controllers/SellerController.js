const db = require('../config/db');

const getAllSellers = (req, res) => {
    db.query(`
        SELECT users.*,
               (SELECT COUNT(*) FROM shops WHERE shops.seller_id = users.id) AS shopCount 
        FROM users
        WHERE role='seller'
    `, (err, users) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(users);
    });
};
const getCompleteSellerData = (req, res) => {
    const sellerId = req.params.id;
    db.query(`
        SELECT users.id, users.name, users.email, users.phone, users.city,
               (SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', shops.id, 
                        'name', shops.name, 
                        'address', shops.address,
                        'accepted', shops.accepted,
                        'totalProducts', (SELECT COUNT(*) FROM products WHERE products.shop_id = shops.id),
                        'totalOrders', (SELECT COUNT(*) FROM orders WHERE orders.shop_id = shops.id)
                    )) 
                FROM shops WHERE shops.seller_id = users.id) AS shopDetails,
               (SELECT COUNT(*) FROM orders WHERE orders.seller_id = users.id) AS orderCount,
               (SELECT COUNT(*) FROM reviews WHERE reviews.user_id = users.id) AS reviewCount
        FROM users
        WHERE id = ? AND role='seller'
    `, [sellerId], (err, users) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (users.length === 0) {
            res.status(404).json({ error: 'Seller not found' });
            return;
        }
        res.json(users[0]);
    });
}


const getSellerFromShopId = (req, res) => {
    const shopId = req.params.id;
    db.query(`
        SELECT 
            u.id AS seller_id, 
            u.name AS seller_name, 
            u.email AS seller_email, 
            u.role AS seller_role,
            u.phone AS seller_phone,
            s.id AS shop_id, 
            s.name AS shop_name, 
            s.address AS shop_address
        FROM users u 
        JOIN shops s ON u.id = s.seller_id
        WHERE s.id = ? AND u.role = 'seller'
    `, [shopId], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (!results.length) {
            res.status(404).json({ error: 'Seller not found' });
            return;
        }

        const seller = {
            id: results[0].seller_id,
            phone: results[0].seller_phone,
            name: results[0].seller_name,
            email: results[0].seller_email,
            role: results[0].seller_role
        };

        const shop = {
            id: results[0].shop_id,
            name: results[0].shop_name,
            address: results[0].shop_address,
        };

        res.json({ seller, shop });
    });
};

const getSellerShops = (req, res) => {
    const sellerId = req.params.id;
    db.query(`
        SELECT shops.*,
               (SELECT COUNT(*) FROM products WHERE products.shop_id = shops.id) AS productCount,
               (SELECT COUNT(*) FROM orders WHERE orders.shop_id = shops.id) AS orderCount
        FROM shops
        WHERE seller_id = ?
    `, [sellerId], (err, shops) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(shops);
    });
}

const editProduct = (req, res) => {
    const { id } = req.params;
    const { title, price, description, specifications, hiddenBySeller } = req.body;
    const images = req.files;  // Files sent by the client

    const hidden = hiddenBySeller === 'true' ? 1 : 0;

    // Parse specifications JSON string
    let parsedSpecs = [];
    try {
        parsedSpecs = JSON.parse(specifications);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON for specifications' });
    }

    // Step 1: Update product information in the database
    const updateProductQuery = `
        UPDATE products 
        SET title = ?, price = ?, description = ?, hiddenBySeller = ?
        WHERE id = ?
    `;
    db.query(updateProductQuery, [title, price, description, hidden, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error updating product' });

        // Step 2: Delete old specifications
        db.query('DELETE FROM product_specifications WHERE product_id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: 'Error removing old specifications' });

            // Step 3: Insert new specifications
            const specValues = parsedSpecs.map(spec => [id, spec.title, spec.value]);
            if (specValues.length > 0) {
                db.query('INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES ?', [specValues], (err) => {
                    if (err) return res.status(500).json({ error: 'Error inserting specifications' });
                });
            }
        });

        // Step 4: Delete old images from the database (if any)
        db.query('DELETE FROM product_images WHERE product_id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: 'Error removing old images' });

            // Step 5: Insert new images as BLOBs into the database
            if (images && images.length > 0) {
                const imageValues = images.map(img => [id, img.buffer]); // Use the buffer (binary data) instead of filename
                db.query('INSERT INTO product_images (product_id, image) VALUES ?', [imageValues], (err) => {
                    if (err) return res.status(500).json({ error: 'Error inserting images as BLOBs' });
                });
            }

            // Step 6: Return success response
            return res.json({ message: 'Product updated successfully' });
        });
    });
};




const getBalanceBySellerId = (req, res) => {
    const sellerId = req.params.id;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Query 1: Current month paybacks
    const currentMonthQuery = `
        SELECT * FROM paybacks 
        WHERE seller_id = ? 
        AND month = ? 
        AND year = ?
    `;

    db.query(currentMonthQuery, [sellerId, currentMonth, currentYear], (err, currentMonthResults) => {
        if (err) return res.status(500).json({ error: 'Error fetching current month data' });

        // Query 2: Sum of amount for previous months (excluding current), where status = 0
        const previousSumQuery = `
            SELECT SUM(amount) AS total_pending 
            FROM paybacks 
            WHERE seller_id = ? 
            AND status = 0
            AND (year < ? OR (year = ? AND month < ?))
        `;

        db.query(previousSumQuery, [sellerId, currentYear, currentYear, currentMonth], (err, sumResult) => {
            if (err) return res.status(500).json({ error: 'Error fetching previous sum data' });

            const totalPending = sumResult[0]?.total_pending || 0;

            res.json({
                currentMonthData: currentMonthResults,
                previousPendingTotal: totalPending
            });
        });
    });
};


module.exports = { getAllSellers, getCompleteSellerData, getSellerFromShopId, getSellerShops , editProduct, getBalanceBySellerId };
