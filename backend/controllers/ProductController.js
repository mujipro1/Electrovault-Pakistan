const db = require('../config/db');

const getProducts = (req, res) => {
    const query = `
        SELECT 
            p.*, 
            pi.image AS product_image 
        FROM 
            products p
        LEFT JOIN 
            product_images pi 
        ON 
            p.id = pi.product_id
        where p.hiddenBySeller = 0 and p.hiddenByAdmin = 0
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const productMap = {};

        results.forEach(row => {
            const productId = row.id;

            if (!productMap[productId]) {
                const { product_image, ...productData } = row;
                productMap[productId] = {
                    ...productData,
                    images: []
                };
            }

            if (row.product_image) {
                const base64Image = Buffer.from(row.product_image).toString('base64');
                productMap[productId].images.push(`data:image/jpeg;base64,${base64Image}`);
            }
        });

        const products = Object.values(productMap);
        res.json(products);
    });
};



const getProductById = (req, res) => {
    const productId = req.params.id;

    const query = `
        SELECT 
            p.*, 
            COALESCE(
                JSON_ARRAYAGG(
                    CASE 
                        WHEN s.spec_key IS NOT NULL THEN JSON_OBJECT('title', s.spec_key, 'value', s.spec_value)
                        ELSE NULL 
                    END
                ), 
                JSON_ARRAY()
            ) AS product_specifications,
            COALESCE(
                JSON_ARRAYAGG(
                    CASE WHEN r.id IS NOT NULL THEN JSON_OBJECT(
                            'id', r.id, 
                            'rating', r.rating, 
                            'description', r.description, 
                            'user', JSON_OBJECT(
                                'id', u.id, 
                                'name', u.name, 
                                'email', u.email
                            )
                        )
                        ELSE NULL 
                    END
                ), 
                JSON_ARRAY()
            ) AS product_reviews,
            COALESCE(
                JSON_ARRAYAGG(
                    CASE 
                        WHEN i.image IS NOT NULL THEN JSON_OBJECT('url', i.image)
                        ELSE NULL
                    END
                ),
                JSON_ARRAY()
            ) AS product_images
        FROM products p
        LEFT JOIN product_specifications s ON p.id = s.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN product_images i ON p.id = i.product_id
        WHERE p.id = ?
        GROUP BY p.id
    `;

    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = results[0];
        product.product_specifications = typeof product.product_specifications === 'string' 
            ? JSON.parse(product.product_specifications) || [] 
            : product.product_specifications || [];
        product.product_reviews = typeof product.product_reviews === 'string' 
            ? JSON.parse(product.product_reviews) || [] 
            : product.product_reviews || [];
        product.product_images = typeof product.product_images === 'string' 
            ? JSON.parse(product.product_images) || [] 
            : product.product_images || [];
        
            const uniqueReviews = new Map();

            product.product_reviews.forEach(review => {
                if (!review || !review.id) return; // Skip null or invalid entries
                if (!uniqueReviews.has(review.id)) {
                    uniqueReviews.set(review.id, review);
                }
            });
            
            product.product_reviews = Array.from(uniqueReviews.values());
            
        
        // remove product image duplicates
        const uniqueImages = new Set();

        product.product_images = product.product_images.filter(img => {
            if (!img || !img.url) return false;
            if (uniqueImages.has(img.url)) return false;
            uniqueImages.add(img.url);
            return true;
        });

        const uniqueSpecs = new Set();
        product.product_specifications = product.product_specifications.filter(spec => {
            if (!spec || !spec.title) return false;
            if (uniqueSpecs.has(spec.title)) return false;
            uniqueSpecs.add(spec.title);
            return true;
        });



        res.json(product);
    });
};


const addNewProduct = (req, res) => {
    const { name, category, price, stock, description, shopId } = req.body;

    const specifications = Array.isArray(req.body.specifications)
    ? req.body.specifications.map(spec => ({
        key: spec.key,
        value: spec.value
    }))
    : [];


    const findOrCreateCategory = (categoryName, callback) => {
        const selectQuery = `SELECT id FROM categories WHERE title = ?`;
        db.query(selectQuery, [categoryName], (err, results) => {
            if (err) {
                console.error("Find category error:", err);
                return res.status(500).json({ error: 'Database error (category lookup)' });
            }

            if (results.length > 0) {
                return callback(results[0].id); // category exists
            }

            const insertQuery = `INSERT INTO categories (title, description) VALUES (?, ?)`;
            db.query(insertQuery, [categoryName, 'New Category'], (err, insertResult) => {
                if (err) {
                    console.error("Insert category error:", err);
                    return res.status(500).json({ error: 'Database error (category insert)' });
                }
                return callback(insertResult.insertId); // new category created
            });
        });
    };

    findOrCreateCategory(category, (categoryId) => {
        const query = `
            INSERT INTO products (title, category_id, price, stock, description, shop_id , rating, commission)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [name, categoryId, price, stock, description, shopId, 4, 5], (err, results) => {
            if (err) {
                console.error("Insert Product Error:", err);
                return res.status(500).json({ error: 'Database error' });
            }

            const productId = results.insertId;

            // Insert specifications
            const insertSpecifications = (callback) => {
                if (specifications.length === 0) return callback();

                const specQuery = `
                    INSERT INTO product_specifications (product_id, spec_key, spec_value)
                    VALUES ?
                `;
                const specValues = specifications.map(spec => [productId, spec.key, spec.value]);

                db.query(specQuery, [specValues], (err) => {
                    if (err) {
                        console.error("Insert Specs Error:", err);
                        return res.status(500).json({ error: 'Database error (specs)' });
                    }
                    callback();
                });
            };

            // Insert images
            const insertImages = (callback) => {
                if (!req.files || req.files.length === 0) return callback();

                const imageQuery = `
                    INSERT INTO product_images (product_id, image) VALUES ?
                `;
                const imageValues = req.files.map(file => [productId, file.buffer]);

                db.query(imageQuery, [imageValues], (err) => {
                    if (err) {
                        console.error("Insert Images Error:", err);
                        return res.status(500).json({ error: 'Database error (images)' });
                    }
                    callback();
                });
            };

            // Chain insertions
            insertSpecifications(() => {
                insertImages(() => {
                    res.status(201).json({ message: 'Product added successfully', productId });
                });
            });
        });
    });
};

const addReview = (req, res) => {
    const { userId, rating, review } = req.body;
    const productId = req.params.id;

    if (!productId || !userId || !rating) {
        return res.status(400).json({ error: 'Product ID, User ID and Rating are required' });
    }

    // Start transaction
    db.beginTransaction(err => {
        if (err) {
            console.error("Transaction Error:", err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Step 1: Get total reviews and current rating
        const getRatingQuery = `
            SELECT 
                COUNT(*) as totalReviews,
                p.rating as currentRating
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.id = ?
            GROUP BY p.id
        `;

        db.query(getRatingQuery, [productId], (err, results) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Rating Query Error:", err);
                    res.status(500).json({ error: 'Database error' });
                });
            }

            const totalReviews = results[0]?.totalReviews || 0;
            const currentRating = results[0]?.currentRating || 0;

            // Calculate new rating
            const newRating = ((currentRating * totalReviews) + rating) / (totalReviews + 1);

            // Step 2: Update product rating
            const updateRatingQuery = `
                UPDATE products 
                SET rating = ? 
                WHERE id = ?
            `;

            db.query(updateRatingQuery, [newRating, productId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Update Rating Error:", err);
                        res.status(500).json({ error: 'Database error' });
                    });
                }

                // Step 3: Insert new review
                const insertReviewQuery = `
                    INSERT INTO reviews (product_id, user_id, rating, description)
                    VALUES (?, ?, ?, ?)
                `;

                db.query(insertReviewQuery, [productId, userId, rating, review], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Insert Review Error:", err);
                            res.status(500).json({ error: 'Database error' });
                        });
                    }

                    // Commit transaction
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Commit Error:", err);
                                res.status(500).json({ error: 'Database error' });
                            });
                        }
                        res.status(200).json({ 
                            message: 'Review added successfully',
                            newRating: newRating
                        });
                    });
                });
            });
        });
    });
}

const getRecommendedProducts = (req, res) => {
    const currentProductId = req.params.productId || null;

    const attachImagesToProducts = (products, res) => {
        if (products.length === 0) return res.json({ recommended: [] });
    
        const productIds = products.map(product => product.id);
        const imagesQuery = `SELECT product_id, image FROM product_images WHERE product_id IN (?)`;
    
        db.query(imagesQuery, [productIds], (err, imageResults) => {
            if (err) return res.status(500).json({ error: 'Error fetching product images' });
    
            // Use an object to group images per product_id
            const imagesMap = {};
            
            imageResults.forEach(({ product_id, image }) => {
                if (image) {
                    const base64Image = Buffer.from(image).toString('base64');
                    const dataUrl = `data:image/jpeg;base64,${base64Image}`; // or image/png depending on your images
                    if (!imagesMap[product_id]) {
                        imagesMap[product_id] = [];
                    }
                    imagesMap[product_id].push(dataUrl);
                }
            });
            
    
            // Attach images to each product
            const enrichedProducts = products.map(product => ({
                ...product,
                images: imagesMap[product.id] || []
            }));
    
            res.json({ recommended: enrichedProducts });
        });
    };
    

    if (currentProductId) {
        const getCategoryIdQuery = `SELECT category_id FROM products WHERE id = ? LIMIT 1`;

        db.query(getCategoryIdQuery, [currentProductId], (err, categoryResult) => {
            if (err || categoryResult.length === 0) {
                return res.status(500).json({ error: 'Failed to get product category' });
            }

            const categoryId = categoryResult[0].category_id;

            const fallbackQuery = `
                (
                    SELECT * FROM products 
                    WHERE category_id = ? AND id != ? AND hiddenBySeller = 0 AND hiddenByAdmin = 0
                    LIMIT 10
                )
                UNION
                (
                    SELECT p.* FROM products p
                    LEFT JOIN reviews r ON p.id = r.product_id
                    WHERE p.id != ?
                    AND p.hiddenBySeller = 0 AND p.hiddenByAdmin = 0
                    GROUP BY p.id
                    ORDER BY AVG(r.rating) DESC
                    LIMIT 10
                )
            `;

            db.query(fallbackQuery, [categoryId, currentProductId, currentProductId], (err, fallbackResults) => {
                if (err) return res.status(500).json({ error: 'Error fetching fallback recommendations' });
                attachImagesToProducts(fallbackResults, res);
            });
        });
    } else {
        const genericQuery = `
            (
                SELECT p.* FROM products p
                LEFT JOIN reviews r ON p.id = r.product_id 
                WHERE p.hiddenBySeller = 0 AND p.hiddenByAdmin = 0
                GROUP BY p.id
                ORDER BY AVG(r.rating) DESC
                LIMIT 10
            )
            UNION
            (
                SELECT p.* FROM products p
                JOIN order_items oi ON p.id = oi.product_id
                WHERE p.hiddenBySeller = 0 AND p.hiddenByAdmin = 0
                GROUP BY p.id
                ORDER BY COUNT(oi.product_id) DESC
                LIMIT 10
            )
        `;

        db.query(genericQuery, (err, genericResults) => {
            if (err) return res.status(500).json({ error: 'Error fetching generic recommendations' });
            attachImagesToProducts(genericResults, res);
        });
    }
};

const fetchProductNames = (req, res) => {
    const query = `
    SELECT id, title FROM products 
    where hiddenBySeller = 0 and hiddenByAdmin = 0
`;

db.query(query, (err, results) => {
    if (err) {
        return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
});   
}

const handleSearchQuery = (req, res) => {
    query = req.body.query;
    const searchQuery = `
        SELECT 
            p.*, 
            pi.image AS product_image 
        FROM 
            products p
        LEFT JOIN 
            product_images pi ON p.id = pi.product_id
        WHERE 
            p.title LIKE ? AND p.hiddenBySeller = 0 AND p.hiddenByAdmin = 0
    `;
    const searchValue = `%${query}%`;
    db.query(searchQuery, [searchValue], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const productMap = {};

        results.forEach(row => {
            const productId = row.id;

            if (!productMap[productId]) {
                const { product_image, ...productData } = row;
                productMap[productId] = {
                    ...productData,
                    images: []
                };
            }

            if (row.product_image) {
                const base64Image = Buffer.from(row.product_image).toString('base64');
                productMap[productId].images.push(`data:image/jpeg;base64,${base64Image}`);
            }
        });

        const products = Object.values(productMap);
        res.json(products);
    });
}


module.exports = { getProducts, handleSearchQuery, getProductById, addNewProduct, addReview , getRecommendedProducts, fetchProductNames};
