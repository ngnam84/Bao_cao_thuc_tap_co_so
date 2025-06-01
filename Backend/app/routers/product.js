const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Thêm router cho API lấy tất cả comment và rating của sản phẩm bằng ID
router.get('/:id/comment-rating', productController.getCommentAndRatingByProductId);

router.get('/:id/comment-rating-2', productController.getCommentAndRatingByProductId2);

// Thêm router cho API thêm comment hoặc rating cho sản phẩm bằng ID
router.post('/:id/comment-rating', productController.addCommentOrRating);

router.get('/category/:categoryId', productController.getProductsByCategory);

// Tìm kiếm sản phẩm
router.get('/search', productController.searchProducts);

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// Lấy sản phẩm bằng ID
router.get('/:id', productController.getProductById);

// Tạo mới sản phẩm
router.post('/', productController.createProduct);

// Cập nhật sản phẩm
router.put('/:id', productController.updateProduct);

// Xóa sản phẩm
router.delete('/:id', productController.deleteProduct);


module.exports = router;
