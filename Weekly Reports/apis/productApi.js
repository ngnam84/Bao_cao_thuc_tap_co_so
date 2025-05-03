import axiosClient from './axiosClient';

const productApi = {
    // Lấy danh sách sản phẩm
    getAllProducts: () => {
        const url = '/products';
        return axiosClient.get(url);
    },

    // Lấy chi tiết sản phẩm theo ID
    getProductById: (id) => {
        const url = `/products/${id}`;
        return axiosClient.get(url);
    },

    getProductsByCategory: (id) => {
        const url = `/products/category/${id}`;
        return axiosClient.get(url);
    },


    getOrderByUser: (userId) => {
        const url = `/order/user/${userId}`;
        return axiosClient.get(url);
    },

    getCommentAndRatingByProductId: (productId) => {
        const url = `/products/${productId}/comment-rating`;
        return axiosClient.get(url);
    },

    getCommentAndRatingByProductId2: (productId) => {
        const url = `/products/${productId}/comment-rating-2`;
        return axiosClient.get(url);
    },

    addCommentOrRating: (productId, data) => {
        const url = `/products/${productId}/comment-rating`;
        return axiosClient.post(url, data);
    }
};

export default productApi;
