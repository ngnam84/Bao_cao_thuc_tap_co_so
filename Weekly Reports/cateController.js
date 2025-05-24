// Import các module cần thiết
const db = require('../config/db');

// Controller xử lý các yêu cầu liên quan đến danh mục
const cateController = {
    // Hàm tạo danh mục mới
    createCategory: async (req, res) => {
        try {
            const { name, description, slug, image } = req.body;

            // Kiểm tra xem tên danh mục đã tồn tại chưa
            const [checkCategoryExist] = await db.execute('SELECT * FROM categories WHERE name = ?', [name]);

            // Nếu danh mục đã tồn tại, trả về thông báo lỗi
            if (checkCategoryExist.length > 0) {
                return res.status(400).json({ message: 'Category with this name already exists' });
            }

            // Tạo câu truy vấn SQL để thêm danh mục mới vào cơ sở dữ liệu
            const createQuery = 'INSERT INTO categories (name, description, slug, image) VALUES (?, ?, ?, ?)';
            const values = [name, description, slug, image];

            // Thực hiện truy vấn vào cơ sở dữ liệu
            const [result] = await db.execute(createQuery, values);

            // Trả về thông báo thành công và ID của danh mục mới tạo
            res.status(201).json({ message: 'Category created successfully', categoryId: result.insertId });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const categoryId = req.params.id;
            const { name, description, slug, image } = req.body;
    
            // Tạo một đối tượng để lưu trữ các giá trị cần cập nhật
            const updateValues = {};
    
            // Kiểm tra và thêm các giá trị đã được truyền vào đối tượng cập nhật
            if (name) updateValues.name = name;
            if (description) updateValues.description = description;
            if (slug) updateValues.slug = slug;
            if (image) updateValues.image = image;
    
            // Kiểm tra xem có giá trị nào cần cập nhật không
            if (Object.keys(updateValues).length === 0) {
                return res.status(400).json({ message: 'No data to update' });
            }
    
            // Tạo câu truy vấn SQL để cập nhật thông tin danh mục
            let updateQuery = 'UPDATE categories SET';
            const updateFields = Object.keys(updateValues);
            updateFields.forEach((field, index) => {
                updateQuery += ` ${field} = ?`;
                if (index < updateFields.length - 1) updateQuery += ',';
            });
            updateQuery += ' WHERE id = ?';
    
            // Tạo mảng giá trị để truyền vào truy vấn SQL
            const values = [...Object.values(updateValues), categoryId];
    
            // Thực hiện truy vấn cập nhật vào cơ sở dữ liệu
            const [result] = await db.execute(updateQuery, values);
    
            // Kiểm tra xem danh mục có tồn tại không
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
    
            // Trả về thông báo cập nhật thành công
            res.status(200).json({ message: 'Category updated successfully' });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Error updating category:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    
    

    // Hàm xóa một danh mục
    deleteCategory: async (req, res) => {
        try {
            const categoryId = req.params.id;

            // Tạo câu truy vấn SQL để xóa danh mục
            const deleteQuery = 'DELETE FROM categories WHERE id = ?';

            // Thực hiện truy vấn xóa vào cơ sở dữ liệu
            const [result] = await db.execute(deleteQuery, [categoryId]);

            // Kiểm tra xem danh mục có tồn tại không
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }

            // Trả về thông báo xóa thành công
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Error deleting category:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Hàm tìm kiếm danh mục theo tên
    searchCategoryByName: async (req, res) => {
        try {
            const { name } = req.query;

            // Tạo câu truy vấn SQL để tìm kiếm danh mục theo tên
            const searchQuery = 'SELECT * FROM categories WHERE name LIKE ?';
            const searchTerm = `%${name}%`;

            // Thực hiện truy vấn tìm kiếm vào cơ sở dữ liệu
            const [categories] = await db.execute(searchQuery, [searchTerm]);

            // Trả về danh sách các danh mục phù hợp
            res.status(200).json({ categories });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Error searching category by name:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getAllCategories: async (req, res) => {
        try {
            // Tạo câu truy vấn SQL để lấy tất cả các danh mục
            const query = 'SELECT * FROM categories';

            // Thực hiện truy vấn vào cơ sở dữ liệu
            const [categories] = await db.execute(query);

            // Trả về danh sách các danh mục
            res.status(200).json({ categories });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Error getting all categories:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Hàm lấy thông tin của một danh mục theo ID
    getCategoryById: async (req, res) => {
        try {
            const categoryId = req.params.id;

            // Tạo câu truy vấn SQL để lấy thông tin của một danh mục theo ID
            const query = 'SELECT * FROM categories WHERE id = ?';

            // Thực hiện truy vấn vào cơ sở dữ liệu
            const [category] = await db.execute(query, [categoryId]);

            // Kiểm tra xem danh mục có tồn tại không
            if (category.length === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }

            // Trả về thông tin của danh mục
            res.status(200).json({ category: category[0] });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Error getting category by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};

// Xuất controller để sử dụng ở các file khác
module.exports = cateController;
