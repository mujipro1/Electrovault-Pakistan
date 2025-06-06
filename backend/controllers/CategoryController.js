const db = require('../config/db');

const getCategories = (req, res) => {
    const query = `
        SELECT 
            c.*, 
            (SELECT COUNT(*) FROM products WHERE products.category_id = c.id) AS product_count 
        FROM categories c
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};

const getSingleCategoryData = (req, res) => {
    const categoryId = req.params.id;
    const query = `
        SELECT 
            c.id AS category_id,
            c.title AS category_title,
            c.description AS category_description,
            p.*,
            pi.image AS product_image
        FROM 
            categories c
        LEFT JOIN 
            products p ON c.id = p.category_id
        LEFT JOIN 
            product_images pi ON p.id = pi.product_id
        WHERE 
            c.id = ?
    `;

    db.query(query, [categoryId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Get category info from the first row
        const { category_id, category_title, category_description } = results[0];

        const productMap = {};

        results.forEach(row => {
            if (!row.id) return; // skip if no product

            if (!productMap[row.id]) {
                const {
                    product_image,
                    category_id,
                    category_title,
                    category_description,
                    ...productData
                } = row;

                productMap[row.id] = {
                    ...productData,
                    images: []
                };
            }

            if (row.product_image) {
                const base64Image = Buffer.from(row.product_image).toString('base64');
                productMap[row.id].images.push(`data:image/jpeg;base64,${base64Image}`);
            }
        });

        const products = Object.values(productMap);

        res.json({
            id: category_id,
            title: category_title,
            description: category_description,
            products
        });
    });
};

const editCategoryName = (req, res) => {
    const { id, title, description } = req.body;

    if (!id || !title || !description) {
        return res.status(400).json({ error: 'Category ID and new name are required' });
    }

    db.query('UPDATE categories SET title = ?, description = ? WHERE id = ?', [title, description, id], (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category name updated successfully' });
    });
};

const addNewCategory = (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Category title and description are required' });
    }

    db.query('INSERT INTO categories (title, description) VALUES (?, ?)', [title, description], (err, result) => {
        if (err) {
            console.error('Error adding new category:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ message: 'New category added successfully', categoryId: result.insertId });
    });
};

const deleteCategory = (req, res) => {
    const categoryId = req.params.id;

    if (!categoryId) {
        return res.status(400).json({ error: 'Category ID is required' });
    }

    db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    });
};


const getProducts = (req, res) => {
    const query = `
        SELECT id,title, shop_id,price,commission FROM products
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};

module.exports = { 
    getCategories, 
    getSingleCategoryData, 
    editCategoryName, 
    addNewCategory,
    deleteCategory, 
    getProducts
};
