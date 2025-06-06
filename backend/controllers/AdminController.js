const sendEmail = require("../utils/emailSender");
const db = require('../config/db');

const getStats = (req, res) => {
    db.query('SELECT COUNT(*) AS seller_count FROM users WHERE role = "seller"', (err, sellerResults) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        db.query('SELECT COUNT(*) AS shop_count FROM shops', (err, shopResults) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            db.query('SELECT COUNT(*) AS order_count FROM orders', (err, orderResults) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                db.query(`
                    SELECT commission, COUNT(commission) AS count 
                    FROM products 
                    GROUP BY commission 
                    ORDER BY count DESC 
                    LIMIT 1
                `, (err, comissionResults) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    db.query('SELECT COUNT(*) AS category_count FROM categories', (err, categoryResults) => {
                        if (err) {
                            return res.status(500).json({ error: 'Database error' });
                        }

                        const stats = {
                            seller_count: sellerResults[0].seller_count,
                            shop_count: shopResults[0].shop_count,
                            order_count: orderResults[0].order_count,
                            most_common_comission: comissionResults.length > 0 ? comissionResults[0].commission : null,
                            category_count: categoryResults[0].category_count,
                        };

                        res.json(stats);
                    });
                });
            });
        });
    });
};

const getAllOrders = (req, res) => {
    db.query('SELECT * FROM orders', (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.guid]) {
                acc[order.guid] = {
                    guid: order.guid,
                    orders: [],
                    totalAmount: 0,
                    status: order.status,
                };
            }
            acc[order.guid].orders.push(order);
            acc[order.guid].totalAmount += order.amount;
            return acc;
        }, {});

        const groupedOrderArray = Object.values(groupedOrders);

        const allOrderIds = orders.map(order => order.id);

        db.query('SELECT * FROM order_items WHERE order_id IN (?)', [allOrderIds], (err, orderItems) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            groupedOrderArray.forEach(group => {
                group.orders.forEach(order => {
                    order.items = orderItems.filter(item => item.order_id === order.id);
                });
            });

            res.json(groupedOrderArray);
        });
    });
};

const getOrderByGUID = (req, res) => {
    const guid = req.params.id;

    db.query('SELECT * FROM orders WHERE guid = ?', [guid], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderIds = orders.map(order => order.id);

        db.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds], (err, orderItems) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            const ordersWithItems = orders.map(order => {
                const items = orderItems.filter(item => item.order_id === order.id);
                return {
                    ...order,
                    items,
                    confirmedByAdmin: order.confirmedByAdmin // Include approvedByAdmin in the response
                };
            });

            res.json(ordersWithItems);
        });
    });
};


const setCommissions = (req, res) => {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'No products provided for commission update' });
    }

    let completed = 0;
    let hasError = false;

    products.forEach(product => {
        db.query(
            'UPDATE products SET commission = ? WHERE id = ?',
            [product.commission, product.id],
            (err, result) => {
                if (hasError) return;
                if (err) {
                    hasError = true;
                    return res.status(500).json({ error: 'Database error' });
                }

                completed++;
                if (completed === products.length) {
                    res.json({ message: 'Commissions updated successfully' });
                }
            }
        );
    });
};

const approveOrder = (req, res) => {
    const { guid } = req.body;

    // Step 1: Get all orders with this guid
    db.query("SELECT * FROM orders WHERE guid = ?", [guid], (err, orders) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (!orders.length) {
            return res.status(404).json({ message: "No orders found with the given GUID." });
        }

        // Step 2: Determine toggle value
        const currentStatus = orders[0].confirmedByAdmin; // assuming all have the same value
        const newStatus = currentStatus === 0 ? 1 : 0;

        // Step 3: Update all orders with the new status
        db.query("UPDATE orders SET confirmedByAdmin = ? WHERE guid = ?", [newStatus, guid], (updateErr) => {
            if (updateErr) {
                console.error("Error updating orders:", updateErr);
                return res.status(500).json({ message: "Database error during update" });
            }

            db.query('SELECT seller_id FROM orders WHERE guid = ?', [guid], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'Order not found' });
                }
                const { seller_id } = results[0];

                db.query('SELECT email, name FROM users WHERE id = ?', [seller_id], (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ error: 'Database error' });
                    }

                    if (results.length === 0) {
                        return res.status(404).json({ error: 'User not found' });
                    }
                    const { email, name } = results[0];

                    if (newStatus == 1) {

                        sendEmail({
                            to: email,
                            subject: `New Order | Order Approved By Admin`,
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
                                <div class="header"><h2>Congratulations ${name},! You received a new order. You can find your order details in your portal under the orders section.</h2></div>
                                </div>
                            </div>
                            </body>
                        `
                        });
                    }
                    else {
                        sendEmail({
                            to: email,
                            subject: `Order Disapproved By Admin`,
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
                                <div class="header"><h2>Dear ${name}, We are sorry to inform you that your order ${guid} has been disapproved by admin. You may contact the admin for further details.</h2></div>
                                </div>
                            </div>
                            </body>
                        `
                        });
                    }
                });
            });

            res.status(200).json({ message: `Orders updated to confirmedByAdmin = ${newStatus}` });
        });
    });
};
const getInvoices = (req, res) => {
    db.query(`SELECT * FROM paybacks`, (err, paybacks) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(paybacks);
    });
};

const getInvoiceById = (req, res) => {
    const invoiceId = req.params.id;

    db.query('SELECT * FROM paybacks WHERE id = ?', [invoiceId], (err, invoice) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (invoice.length === 0) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }

        res.json(invoice[0]);
    });
}

const resolveInvoice = (req, res) => {
    const invoiceId = req.body.invoice_id;
    db.query('SELECT month, year, amount, seller_id, admin_comission, total_sales FROM paybacks WHERE id = ?', [invoiceId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const { month, year, amount, seller_id, admin_comission, total_sales } = results[0];

        // Convert month number to month name
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

        db.query('SELECT email, name FROM users WHERE id = ?', [seller_id], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { email, name } = results[0];

            db.query('UPDATE paybacks SET status = 1 WHERE id = ?', [invoiceId], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Database error' });
                    return;
                }

                if (result.affectedRows === 0) {
                    res.status(404).json({ error: 'Invoice not found' });
                    return;
                }
                sendEmail({
                    to: email,
                    subject: "Your Monthly Invoice | Electrovault",
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
                <div class="header"><h2>Invoice Paid! ✅</h2></div>
                <div class="content"><p>Dear ${name},</p><p>Your monthly invoice of PKR ${amount} for the month of ${monthName} ${year} has been paid into your account. Please check your account for confirmation</p>
                <h4>Invoice Details</h4>
                <div>Month: ${monthName} ${year}</div>
                <div>Total Sales:  PKR ${total_sales}</div>
                <div>Commission Deducted: PKR ${admin_comission} </div>
                <div>Amount: PKR ${amount} </div>
                <p>For any queries, reply to this email. Thankyou for choosing Electrovault Pakistan. </p>
                </div>
            </div>
            </body>
            `
                });
                res.json({ message: 'Invoice resolved successfully' });
            });
        });
    });
}

const getPendingOrders = (req, res) => {
    db.query('SELECT * FROM orders WHERE confirmedByAdmin = 0', (err, orders) => {
        if (err) {
            console.error("Error fetching pending orders:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (!orders.length) {
            return res.status(404).json({ message: "No pending orders found." });
        }

        const orderIds = orders.map(order => order.id);

        db.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds], (err, orderItems) => {
            if (err) {
                console.error("Error fetching order items:", err);
                return res.status(500).json({ message: "Database error" });
            }

            // return only the number of pending orders
            const pendingOrders = orders.map(order => {
                const items = orderItems.filter(item => item.order_id === order.id);
                return {
                    ...order,
                    items,
                    confirmedByAdmin: order.confirmedByAdmin // Include approvedByAdmin in the response
                };

            });

            res.json(pendingOrders.length);
        });
    });
}

const hideProduct = (req, res) => {
    const productId = req.params.id;

    // First get current status
    db.query('SELECT hiddenByAdmin FROM products WHERE id = ?', [productId], (err, result) => {
        if (err) {
            console.error("Error fetching product:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (!result.length) {
            return res.status(404).json({ message: "Product not found" });
        }

        const newStatus = result[0].hiddenByAdmin === 0 ? 1 : 0;

        // Toggle the status
        db.query('UPDATE products SET hiddenByAdmin = ? WHERE id = ?', [newStatus, productId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating product:", updateErr);
                return res.status(500).json({ message: "Database error during update" });
            }

            res.status(200).json({ hiddenByAdmin: newStatus });
        });
    });
};

module.exports = { getStats, getAllOrders, getOrderByGUID, setCommissions, approveOrder, getInvoices, getInvoiceById, resolveInvoice, getPendingOrders, hideProduct };
