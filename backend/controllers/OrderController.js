const db = require('../config/db');
const sendEmail = require("../utils/emailSender");

const getOrderById = (req, res) => {
    const orderId = req.params.id;

    // Fetch order details
    db.query(`
        SELECT * FROM orders WHERE id = ?
    `, [orderId], (err, order) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (!order.length) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        // Fetch order items with product details
        db.query(`
            SELECT oi.*, p.* FROM order_items oi
            INNER JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId], (err, orderItems) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            // Send response with order and order items, including product details
            res.json({ order: order[0], items: orderItems });
        });
    });
}

const markOrderAsDispatched = (req, res) => {
    const orderId = req.params.id;

    db.query(`
        UPDATE orders SET status = 1 WHERE id = ?
    `, [orderId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        db.query('SELECT email, name, guid FROM orders WHERE id = ?', [orderId], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Database error' });
            }
    
            if (results.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
    
            const { email, name, guid} = results[0];


        sendEmail({
            to: email,
            subject: "Order Dispatched Successfully",
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
                <div class="header"><h2>Order Dispatched! ✅</h2></div>
                <div class="content"><p>Dear ${name},</p><p>Thank you for your order! We're excited to let you know that your order has been successfully dispatched. You will recieve your order within 4 working days. Thankyou for your patience.</p>
                <p>Your order ID is <strong>${guid}</strong>.</p>
                <p>Thankyou for choosing Electrovault Pakistan. </p>
                </div>
            </div>
            </body>
            `
          });
        });

        res.json({ message: 'Order marked as dispatched' });
    });
}


const placeNewOrder = (req, res) => {
    const { fullName, email, address,phone, city, cartItems } = req.body;
    const paymentScreenshot = req.file.buffer;        
    const parsedItems = JSON.parse(cartItems);

    // Group items by shopId
    const groupedByShop = {};
    parsedItems.forEach(item => {
        if (!groupedByShop[item.shopId]) {
            groupedByShop[item.shopId] = [];
        }
        groupedByShop[item.shopId].push(item);
    });


    const guid = 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + parsedItems.length;

    const orderIds = [];
    const shopIds = Object.keys(groupedByShop);
    let completed = 0;
    let hasError = false;

    shopIds.forEach(shopId => {
        const items = groupedByShop[shopId];

        // Calculate totalAmount for this shop's items
        const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        // Extract sellerId from the first item in the group
        const sellerId = items[0].sellerId;

        // Insert order
        db.query(`
            INSERT INTO orders (name, email, address, phone_number, city, amount, payment_screenshot, seller_id, shop_id, status, guid)
            VALUES (?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?)
        `, [fullName, email, address, phone, city, totalAmount, paymentScreenshot, sellerId, shopId, 0, guid], (err, result) => {
            if (hasError) return;
            if (err) {
                hasError = true;
                res.status(500).json({ error: 'Database error while inserting order' });
                return;
            }

            const orderId = result.insertId;
            orderIds.push(orderId);

            // Prepare values for order_items
            const values = items.map(item => [orderId, item.productId, item.quantity]);

            db.query(`
                INSERT INTO order_items (order_id, product_id, quantity)
                VALUES ?
            `, [values], (err) => {
                if (err) {
                    hasError = true;
                    res.status(500).json({ error: 'Database error while inserting order items' });
                    return;
                }

                completed++;
                if (completed === shopIds.length) {
                    updateInvoicesSystem();

                    sendEmail({
                        to: email,
                        subject: "Order Placed Successfully",
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
                            <div class="header"><h2>Order Confirmed! ✅</h2></div>
                            <div class="content"><p>Dear ${fullName},</p><p>Thank you for your order! We're excited to let you know that we've successfully received your order.</p>
                            <p>Your order ID is <strong>${guid}</strong>.</p>
                            <p>You will receive another email once your items are shipped. Thankyou for choosing Electrovault Pakistan. </p>
                            </div>
                        </div>
                        </body>
                        `
                      });
                    res.status(201).json({ message: 'Orders placed successfully', orderIds });
                }
            });
        });
    });
};


const updateInvoicesSystem = () => {
    let orders = [];

    db.query('SELECT * FROM orders', (err, orderResults) => {
        if (err) return console.error('Database error:', err);

        orders = orderResults;
        const orderIds = orders.map(order => order.id);
        if (orderIds.length === 0) return;

        db.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds], (err, orderItems) => {
            if (err) return console.error('Database error:', err);

            const itemsByOrderId = {};
            orderItems.forEach(item => {
                if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
                itemsByOrderId[item.order_id].push(item);
            });

            orders = orders.map(order => ({
                ...order,
                items: itemsByOrderId[order.id] || []
            }));

            const allProductIds = [...new Set(orderItems.map(item => item.product_id))];
            if (allProductIds.length === 0) return;

            db.query('SELECT id, commission, price FROM products WHERE id IN (?)', [allProductIds], (err, productResults) => {
                if (err) return console.error('Database error:', err);

                const productMap = {};
                productResults.forEach(product => {
                    productMap[product.id] = {
                        commission: product.commission,
                        price: product.price
                    };
                });

                // Step 1: Enrich items with price and commission, and compute per-item values
                orders.forEach(order => {
                    order.items = order.items.map(item => {
                        const product = productMap[item.product_id] || { commission: 0, price: 0 };
                        const price = product.price || 0;
                        const commissionRate = (product.commission / 100) || 0;
                        const quantity = item.quantity || 1;
                        const amount = price * quantity;
                        const adminCommission = amount * commissionRate;
                        const sellerRetention = amount - adminCommission;

                        return {
                            ...item,
                            price,
                            commissionRate,
                            amount,
                            adminCommission,
                            sellerRetention
                        };
                    });
                });

                // Step 2: Aggregate data per seller
                const sellerSummary = {};

                orders.forEach(order => {
                    const sellerId = order.seller_id;
                    if (!sellerSummary[sellerId]) {
                        sellerSummary[sellerId] = {
                            seller_id: sellerId,
                            total_sales: 0,
                            commission_deducted: 0,
                            retention_amount: 0,
                            order_ids: []
                        };
                    }

                    const sellerData = sellerSummary[sellerId];

                    order.items.forEach(item => {
                        sellerData.total_sales += item.amount;
                        sellerData.commission_deducted += item.adminCommission;
                        sellerData.retention_amount += item.sellerRetention;
                    });

                    sellerData.order_ids.push(order.id);
                });

                const result = Object.values(sellerSummary);

                // Insert into paybacks table
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;

                // Use a Set to track processed sellers and avoid duplicate entries
                const processedSellers = new Set();

                result.forEach(item => {
                    const { seller_id, total_sales, commission_deducted, retention_amount } = item;

                    if (processedSellers.has(seller_id)) return; // Skip if already processed
                    processedSellers.add(seller_id);

                    // First check if the record already exists
                    db.query(`
                        SELECT * FROM paybacks WHERE seller_id = ? AND year = ? AND month = ?
                    `, [seller_id, year, month], (err, existingPaybacks) => {
                        if (err) {
                            console.error(`Error checking payback for seller ${seller_id}:`, err);
                            return;
                        }

                        if (existingPaybacks.length > 0) {
                            // Record exists, update it
                            db.query(`
                                UPDATE paybacks SET 
                                amount = ?, 
                                admin_comission = ?, 
                                total_sales = ? 
                                WHERE seller_id = ? AND year = ? AND month = ?
                            `, [retention_amount, commission_deducted, total_sales, seller_id, year, month], (err) => {
                                if (err) {
                                    console.error(`Error updating payback for seller ${seller_id}:`, err);
                                    return;
                                }
                            });
                        } else {
                            // Record doesn't exist, insert new
                            db.query(`
                                INSERT INTO paybacks 
                                (seller_id, amount, status, year, month, admin_comission, total_sales) 
                                VALUES (?, ?, 0, ?, ?, ?, ?)
                            `, [seller_id, retention_amount, year, month, commission_deducted, total_sales], (err) => {
                                if (err) {
                                    console.error(`Error inserting payback for seller ${seller_id}:`, err);
                                    return;
                                }
                            });
                        }
                    });
                });
            });
        });
    });
};


module.exports = { getOrderById, markOrderAsDispatched, placeNewOrder };
