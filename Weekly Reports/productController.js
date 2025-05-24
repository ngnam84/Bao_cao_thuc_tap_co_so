const db = require('../config/db');

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const query = `
                SELECT p.*, c.name AS category_name, s.name AS supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
            `;
            const [rows] = await db.execute(query);
            res.status(200).json({ data: rows });
        } catch (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    addCommentOrRating: async (req, res) => {
        const productId = req.params.id;
        const { userId, comment, rating } = req.body;
    
        let connection;
    
        try {
            // Lấy một kết nối từ pool
            connection = await db.getConnection();
            
            // Bắt đầu giao dịch
            await connection.beginTransaction();
    
            // Kiểm tra xem sản phẩm tồn tại hay không
            const [product] = await connection.execute('SELECT * FROM products WHERE id = ?', [productId]);
            if (product.length === 0) {
                await connection.rollback(); // Hủy giao dịch nếu sản phẩm không tồn tại
                return res.status(404).json({ message: 'Product not found' });
            }
    
            // Thêm comment nếu có
            let commentId = null;
            if (comment) {
                const [result] = await connection.execute(
                    'INSERT INTO comments (user_id, product_id, comment) VALUES (?, ?, ?)',
                    [userId, productId, comment]
                );
                commentId = result.insertId;
            }
    
            // Thêm rating nếu có
            let ratingId = null;
            if (rating) {
                const [result] = await connection.execute(
                    'INSERT INTO ratings (user_id, product_id, rating) VALUES (?, ?, ?)',
                    [userId, productId, rating]
                );
                ratingId = result.insertId;
            }
    
            // Hoàn tất giao dịch
            await connection.commit();
    
            // Trả về phản hồi
            return res.status(201).json({
                message: 'Comment and/or rating added successfully',
                commentId: commentId,
                ratingId: ratingId
            });
    
        } catch (err) {
            if (connection) await connection.rollback(); // Hủy giao dịch nếu có lỗi
            console.error('Error adding comment or rating:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            if (connection) await connection.release(); // Giải phóng kết nối
        }
    },
    
    
    getCommentAndRatingByProductId: async (req, res) => {
        const productId = req.params.id;
    
        try {
            // Kiểm tra xem sản phẩm tồn tại hay không
            const [product] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
            if (product.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            // Lấy tất cả các comment và rating của sản phẩm, cùng với thông tin của người dùng
            const query = `
                SELECT c.id AS comment_id, c.comment, r.rating, u.username
                FROM comments c
                LEFT JOIN ratings r ON c.product_id = r.product_id AND c.user_id = r.user_id
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.product_id = ?;
            `;
            const [commentAndRatingData] = await db.execute(query, [productId]);
    
            return res.status(200).json({ commentAndRatingData });
        } catch (err) {
            console.error('Error getting comments and ratings:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getCommentAndRatingByProductId2: async (req, res) => {
        const productId = req.params.id;
    
        try {
            // Kiểm tra xem sản phẩm tồn tại hay không
            const [product] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
            if (product.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            // Lấy tất cả các comment của sản phẩm, cùng với thông tin của người dùng
            const commentQuery = `
                SELECT c.id AS comment_id, c.comment, u.username
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.product_id = ?;
            `;
            const [comments] = await db.execute(commentQuery, [productId]);
    
            // Lấy tất cả các rating của sản phẩm, cùng với thông tin của người dùng
            const ratingQuery = `
                SELECT r.id AS rating_id, r.rating, u.username
                FROM ratings r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.product_id = ?;
            `;
            const [ratings] = await db.execute(ratingQuery, [productId]);
    
            // Trả về kết quả comments và ratings riêng biệt
            return res.status(200).json({ comments, ratings });
        } catch (err) {
            console.error('Error getting comments and ratings:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getProductById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
            if (rows.length > 0) {
                res.status(200).json({ data: rows[0] });
            } else {
                res.status(404).json({ message: 'Product not found' });
            }
        } catch (err) {
            console.error('Error fetching product by ID:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Cập nhật phương thức createProduct để thêm thông tin nhà cung cấp
    createProduct: async (req, res) => {
        const { name, price, promotion, quantity, description, image, category, supplier_id } = req.body;
        try {
            // Tạo sản phẩm
            const [result] = await db.execute(
                'INSERT INTO products (name, price, promotion, quantity, description, image, category_id, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, price, promotion, quantity, description, image, category, supplier_id]
            );

            res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
        } catch (err) {
            console.error('Error creating product:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    updateProduct: async (req, res) => {
        const { id } = req.params;
        const { name, price, promotion, quantity, description, image, category, supplier_id } = req.body;
        try {
            // Xây dựng câu lệnh SQL cập nhật dựa trên các trường được gửi trong body request
            let updateQuery = 'UPDATE products SET ';
            let updateParams = [];
            if (name) {
                updateQuery += 'name=?, ';
                updateParams.push(name);
            }
            if (price !== undefined) {
                updateQuery += 'price=?, ';
                updateParams.push(price);
            }
            if (promotion !== undefined) {
                updateQuery += 'promotion=?, ';
                updateParams.push(promotion);
            }
            if (quantity !== undefined) {
                updateQuery += 'quantity=?, ';
                updateParams.push(quantity);
            }
            if (description) {
                updateQuery += 'description=?, ';
                updateParams.push(description);
            }
            if (image) {
                updateQuery += 'image=?, ';
                updateParams.push(image);
            }
            if (category !== undefined) {
                updateQuery += 'category_id=?, ';
                updateParams.push(category);
            }
            if (supplier_id !== undefined) {
                updateQuery += 'supplier_id=?, ';
                updateParams.push(supplier_id);
            }
            // Xóa dấu phẩy cuối cùng và thêm điều kiện WHERE cho ID
            updateQuery = updateQuery.slice(0, -2) + ' WHERE id=?';
            updateParams.push(id);

            // Thực thi câu lệnh SQL
            await db.execute(updateQuery, updateParams);

            res.status(200).json({ message: 'Product updated successfully' });
        } catch (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    deleteProduct: async (req, res) => {
        const { id } = req.params;
        try {
            await db.execute('DELETE FROM products WHERE id = ?', [id]);
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (err) {
            console.error('Error deleting product:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    searchProducts: async (req, res) => {
        const { query: searchQuery } = req.query;
        try {
            const searchValue = `%${searchQuery}%`;
            const query = `
                SELECT p.*, c.name AS category_name, s.name AS supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.name LIKE ? OR p.description LIKE ?
            `;
            const [rows] = await db.execute(query, [searchValue, searchValue]);
            res.status(200).json({ data: rows });
        } catch (err) {
            console.error('Error searching products:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getProductsByCategory: async (req, res) => {
        const { categoryId } = req.params;
        try {
            const query = `
                SELECT p.*, c.name AS category_name, s.name AS supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.category_id = ?
            `;
            const [rows] = await db.execute(query, [categoryId]);
            res.status(200).json({ data: rows });
        } catch (err) {
            console.error('Error fetching products by category:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }



};

module.exports = productController;
