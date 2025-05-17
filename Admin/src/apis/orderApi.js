import axiosClient from './axiosClient';

const orderApi = {
    /*Danh sách api order */

    createOrder(data) {
        const url = '/order';
        return axiosClient.post(url, data);
    },

    getDetailOrder(id) {
        const url = '/order/' + id;
        return axiosClient.get(url);
    },

    getListOrder(data) {
        if (!data.page || !data.limit) {
            data.limit = 10;
            data.page = 1;
        }
        const url = '/order/search';
        return axiosClient.post(url, data);
    },

    deleteOrder(id) {
        const url = "/order/" + id;
        return axiosClient.delete(url);
    },

    searchOrder(name) {
        const params = {
            name: name.target.value
        }
        const url = '/order/searchByName';
        return axiosClient.get(url, { params });
    },

    // API thống kê doanh thu theo tháng
    getMonthlyRevenue() {
        const url = '/order/stats/revenue';
        return axiosClient.get(url);
    },

    // API thống kê các mặt hàng bán chạy theo tháng
    getBestSellingProducts() {
        const url = '/order/stats/best-selling-products';
        return axiosClient.get(url);
    },
}

export default orderApi;
