const db = require('../config/db');

const orderController = {
    getAllOrder: async (req, res) => {
        try {
            // Lấy tất cả đơn hàng từ cơ sở dữ liệu kèm thông tin của người dùng
            const query = `
                SELECT o.*, u.email AS user_email, u.phone AS user_phone, u.username AS user_username
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
            `;
            const [rows] = await db.execute(query);
            res.status(200).json({ data: rows });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getOrderById: async (req, res) => {
        const { id } = req.params;
        try {
            // Lấy đơn hàng theo ID từ cơ sở dữ liệu kèm thông tin của người dùng
            const query = `
                SELECT o.*, u.email AS user_email, u.phone AS user_phone, u.username AS user_username
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            if (rows.length > 0) {
                res.status(200).json({ data: rows[0] });
            } else {
                res.status(404).json({ message: 'Order not found' });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    createOrder: async (req, res) => {
        const { userId, address, billing, description, status, products, orderTotal } = req.body;
        
        try {
            // Kiểm tra và cập nhật số lượng sản phẩm
            for (const product of products) {
                // Lấy thông tin sản phẩm từ database bằng tên sản phẩm
                const [productRows] = await db.execute(
                    'SELECT id, quantity FROM products WHERE name = ?',
                    [product.name]
                );

                if (productRows.length === 0) {
                    throw new Error(`Product with name "${product.name}" not found`);
                }

                const currentQuantity = productRows[0].quantity;
                const productId = productRows[0].id;

                // Kiểm tra nếu số lượng đặt hàng lớn hơn số lượng trong kho
                if (currentQuantity < product.quantity) {
                    throw new Error(`Insufficient quantity for product ${product.name}`);
                }

                // Cập nhật số lượng sản phẩm
                const newQuantity = currentQuantity - product.quantity;
                await db.execute(
                    'UPDATE products SET quantity = ? WHERE id = ?',
                    [newQuantity, productId]
                );

                // Thêm id vào object product
                product.id = productId;
            }

            // Tạo đơn hàng trong cơ sở dữ liệu
            const [result] = await db.execute(
                'INSERT INTO orders (user_id, address, billing, description, status, products, order_total) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, address, billing, description, status, JSON.stringify(products), orderTotal]
            );

            res.status(201).json({ 
                message: 'Order created successfully', 
                orderId: result.insertId 
            });

        } catch (err) {
            // Nếu có lỗi, thử khôi phục lại số lượng sản phẩm
            if (products) {
                for (const product of products) {
                    try {
                        // Lấy id sản phẩm nếu chưa có
                        if (!product.id) {
                            const [productRows] = await db.execute(
                                'SELECT id FROM products WHERE name = ?',
                                [product.name]
                            );
                            if (productRows.length > 0) {
                                product.id = productRows[0].id;
                            } else {
                                continue; // Bỏ qua nếu không tìm thấy sản phẩm
                            }
                        }

                        const [currentProduct] = await db.execute(
                            'SELECT quantity FROM products WHERE id = ?',
                            [product.id]
                        );
                        if (currentProduct.length > 0) {
                            const currentQuantity = currentProduct[0].quantity;
                            const newQuantity = currentQuantity + product.quantity;
                            await db.execute(
                                'UPDATE products SET quantity = ? WHERE id = ?',
                                [newQuantity, product.id]
                            );
                        }
                    } catch (restoreErr) {
                        console.error('Error restoring product quantity:', restoreErr);
                    }
                }
            }

            res.status(500).json({
                error: err.message || 'Error creating order'
            });
        }
    },

    deleteOrder: async (req, res) => {
        const { id } = req.params;
        
        try {
            // Lấy thông tin đơn hàng trước khi xóa
            const [orderRows] = await db.execute(
                'SELECT products FROM orders WHERE id = ?',
                [id]
            );

            if (orderRows.length === 0) {
                throw new Error('Order not found');
            }

            const orderProducts = JSON.parse(orderRows[0].products);

            // Hoàn lại số lượng cho từng sản phẩm
            for (const product of orderProducts) {
                // Lấy số lượng hiện tại của sản phẩm
                const [productRows] = await db.execute(
                    'SELECT quantity FROM products WHERE id = ?',
                    [product.id]
                );

                if (productRows.length === 0) {
                    throw new Error(`Product with ID ${product.id} not found`);
                }

                // Cộng lại số lượng đã mua
                const currentQuantity = productRows[0].quantity;
                const newQuantity = currentQuantity + product.quantity;

                // Cập nhật số lượng mới
                await db.execute(
                    'UPDATE products SET quantity = ? WHERE id = ?',
                    [newQuantity, product.id]
                );
            }

            // Xóa đơn hàng
            await db.execute('DELETE FROM orders WHERE id = ?', [id]);

            res.status(200).json({ 
                message: 'Order deleted successfully and product quantities restored' 
            });

        } catch (err) {
            res.status(500).json({
                error: err.message || 'Error deleting order'
            });
        }
    },

    updateOrder: async (req, res) => {
        const { id } = req.params;
        const { userId, address, billing, description, status, products, orderTotal } = req.body;
        try {
            // Xây dựng câu lệnh SQL cập nhật dựa trên các trường được gửi trong body request
            let updateQuery = 'UPDATE orders SET ';
            let updateParams = [];
            
            // Kiểm tra và thêm các trường cần cập nhật
            if (userId !== undefined) {
                updateQuery += 'user_id=?, ';
                updateParams.push(userId);
            }
            if (address !== undefined) {
                updateQuery += 'address=?, ';
                updateParams.push(address);
            }
            if (billing !== undefined) {
                updateQuery += 'billing=?, ';
                updateParams.push(billing);
            }
            if (description !== undefined) {
                updateQuery += 'description=?, ';
                updateParams.push(description);
            }
            if (status !== undefined) {
                updateQuery += 'status=?, ';
                updateParams.push(status);
            }
            if (products !== undefined) {
                updateQuery += 'products=?, ';
                updateParams.push(JSON.stringify(products));
            }
            if (orderTotal !== undefined) {
                updateQuery += 'order_total=?, ';
                updateParams.push(orderTotal);
            }
            
            // Xóa dấu phẩy cuối cùng và thêm điều kiện WHERE cho ID
            updateQuery = updateQuery.slice(0, -2) + ' WHERE id=?';
            updateParams.push(id);
    
            // Thực thi câu lệnh SQL
            await db.execute(updateQuery, updateParams);
    
            res.status(200).json({ message: 'Order updated successfully' });
        } catch (err) {
            res.status(500).json(err);
        }
    },
    

    searchOrderByName: async (req, res) => {
        const { query } = req.query;
        try {
            // Tìm kiếm đơn hàng theo tên từ cơ sở dữ liệu
            const [rows] = await db.execute('SELECT * FROM orders WHERE name LIKE ?', [`%${query}%`]);
            res.status(200).json({ data: rows });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getOrderByUser: async (req, res) => {
        const { id } = req.params;
        console.log(id)
        try {
            // Lấy tất cả đơn hàng của một người dùng từ cơ sở dữ liệu
            const [rows] = await db.execute('SELECT * FROM orders WHERE user_id = ?', [id]);
            res.status(200).json({ data: rows });
        } catch (err) {
            res.status(401).send('Unauthorized');
        }
    },

    // API thống kê doanh thu theo tháng
    getMonthlyRevenue: async (req, res) => {
        try {
            // Truy vấn tổng doanh thu theo tháng
            const query = `
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') AS month,
                    SUM(order_total) AS total_revenue
                FROM orders
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY DATE_FORMAT(created_at, '%Y-%m') DESC
            `;
            const [rows] = await db.execute(query);
            res.status(200).json({ data: rows });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getBestSellingProducts: async (req, res) => {
        try {
            const query = `
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') AS month,
                    COALESCE(products, '[]') AS products
                FROM orders
                WHERE products IS NOT NULL
            `;
            const [rows] = await db.execute(query);

            console.log(rows)
    
            const productSales = {};
    
            rows.forEach(row => {
                const month = row.month;
                let products = [];
    
                try {
                    products = JSON.parse(row.products);
                } catch (err) {
                    console.error('Error parsing JSON:', err);
                }
    
                products.forEach(product => {
                    const { name, quantity } = product;
    
                    if (!productSales[month]) {
                        productSales[month] = {};
                    }
    
                    if (!productSales[month][name]) {
                        productSales[month][name] = 0;
                    }
    
                    productSales[month][name] += quantity;
                });
            });
    
            const result = Object.keys(productSales).map(month => {
                const products = Object.keys(productSales[month]).map(name => ({
                    name,
                    total_quantity: productSales[month][name]
                }));
    
                return {
                    month,
                    products: products.sort((a, b) => b.total_quantity - a.total_quantity)
                };
            });
    
            res.status(200).json({ data: result });
        } catch (err) {
            console.error('Error processing request:', err);
            res.status(500).json({ error: err.message });
        }
    }
    
    
};

module.exports = orderController;
