import axiosClient from './axiosClient';

const newsApi = {
    /*Danh sách api category */
    getDetailNews(id) {
        const url = '/news/' + id;
        return axiosClient.get(url);
    },
    getListNews(data) {
        const url = '/news';
        return axiosClient.get(url);
    },
}

export default newsApi;