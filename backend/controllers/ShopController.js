const sendEmail = require("../utils/emailSender");
const db = require('../config/db');

const getShopData = (req, res) => {
    const shopId = req.params.id;

    // Fetch shop details
    db.query(`
        SELECT * FROM shops WHERE id = ?
    `, [shopId], (err, shop) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (!shop.length) {
            res.status(404).json({ error: 'Shop not found' });
            return;
        }

        // Check if the shop is accepted
        if (shop[0].accepted !== 1) {
            res.json({ shop: shop[0] });
            return;
        }

        // Fetch products for the shop
        db.query(`
            SELECT * FROM products WHERE shop_id = ?
        `, [shopId], (err, products) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            if (!products.length) {
                res.json({ shop: shop[0], products: [], orders: [] });
                return;
            }

            // Fetch product images for the products
            const productIds = products.map(product => product.id);
            db.query(`
                SELECT * FROM product_images WHERE product_id IN (?)
            `, [productIds], (err, productImages) => {
                if (err) {
                    res.status(500).json({ error: 'Database error' });
                    return;
                }

                // Attach images to their respective products
                const productsWithImages = products.map(product => {
                    const images = productImages
                        .filter(image => image.product_id === product.id)
                        .map(image => image.image); // Assuming `image_data` contains the base64 string
                    return { ...product, images };
                });

                // Fetch orders for the shop
                db.query(`
                    SELECT * 
                    FROM orders 
                    WHERE shop_id = ?
                `, [shopId], (err, orders) => {
                    if (err) {
                        res.status(500).json({ error: 'Database error' });
                        return;
                    }

                    if (!orders.length) {
                        res.json({ shop: shop[0], products: productsWithImages, orders: [] });
                        return;
                    }

                    // Fetch order items for the orders
                    db.query(`
                        SELECT * 
                        FROM order_items 
                        WHERE order_id IN (SELECT id FROM orders WHERE shop_id = ?)
                    `, [shopId], (err, orderItems) => {
                        if (err) {
                            res.status(500).json({ error: 'Database error' });
                            return;
                        }

                        // Group order items by order_id
                        const ordersWithItems = orders.map(order => {
                            const items = orderItems.filter(item => item.order_id === order.id);
                            return { ...order, items };
                        });

                        // Send response with shop, products (with images), and orders with items
                        res.json({ shop: shop[0], products: productsWithImages, orders: ordersWithItems });
                    });
                });
            });
        });
    });
};

const addNewShop = (req, res) => {
    const { sellerId, name, address, city, postalCode, description } = req.body;
    db.query(`
        INSERT INTO shops (name, address, city, postal_code, description, accepted, seller_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, address, city, postalCode, description, 0, sellerId], (err) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }

        sendEmail({
            to: 'electrovault.pk@gmail.com',
            subject: `New Shop on board`,
            html: `
            <style>
                body {font-family: Arial, sans-serif;background-color: #f4f6f8;margin: 0;padding: 0;}
                .container {max-width: 600px;background-color: #ffffff;margin: 40px auto;padding: 30px;border-radius: 8px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);}
                .header {text-align: center;padding-bottom: 20px;}
                .header h1 {color: #27ae60;margin: 0;}
                .content {line-height: 1.6;color: #333333;}
                .button {display: inline-block;margin-top: 20px;padding: 12px 24px;background-color: #27ae60;color: #ffffff;text-decoration: none;border-radius: 5px;}
                .footer {margin-top: 30px;text-align: center;font-size: 12px;color: #888888;}
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header"><h5>Dear Admin, a new shop request has been recieved at Electrovault.pk website. Please check out and approve or disapprove the request.</h5></div>
                <div>Shop Details:</div>
                <p>Name: ${name}</p>
                <p>Address: ${address}</p>
                <p>City: ${city}</p>
                <p>Description: ${description}</p>
                <br/>
                <div>Regards,</div>
                <div>Electrovault Pakistan.</div>
                </div>
            </div>
            </body>
        `
        });

        res.status(200).json({ message: 'Shop added successfully' });
    });
}

const getAllShops = (req, res) => {
    db.query(`
        SELECT * FROM shops
    `, (err, shops) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(shops);
    });
}

const approveShopRequest = (req, res) => {
    const { shopId } = req.body;
    db.query(`
        UPDATE shops SET accepted = 1 WHERE id = ?
    `, [shopId], (err) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }

        db.query(`
            select seller_id from shops where id = ?
        `, [shopId], (err, results) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            const { seller_id } = results[0];

            db.query(`
                select email,name from users where id = ?
            `, [seller_id], (err, results) => {
                if (err) {
                    res.status(500).json({ error: 'Database error' });
                    return;
                }

                const { email, name } = results[0];

                sendEmail({
                    to: email,
                    subject: `Shop Approved!`,
                    html: `
            <style>
                body {font-family: Arial, sans-serif;background-color: #f4f6f8;margin: 0;padding: 0;}
                .container {max-width: 600px;background-color: #ffffff;margin: 40px auto;padding: 30px;border-radius: 8px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);}
                .header {text-align: center;padding-bottom: 20px;}
                .header h1 {color: #27ae60;margin: 0;}
                .content {line-height: 1.6;color: #333333;}
                .button {display: inline-block;margin-top: 20px;padding: 12px 24px;background-color: #27ae60;color: #ffffff;text-decoration: none;border-radius: 5px;}
                .footer {margin-top: 30px;text-align: center;font-size: 12px;color: #888888;}
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header"><h5>Congratulations Dear ${name}, Your shop request has been approved by admin. You can now enter products and receive orders on your new shop</h5></div>
                <p>Check out your new shop by visiting your seller portal at the electrovault website.</p>
                <br/>
                <div>Regards,</div>
                <div>Electrovault Pakistan.</div>
                </div>
            </div>
            </body>
        `
                });
            });
        });


        res.status(200).json({ message: 'Shop approved successfully' });

    });
}


module.exports = { getShopData, addNewShop, getAllShops, approveShopRequest };
