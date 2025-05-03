import axiosClient from './axiosClient';

const categoryApi = {
    getDetailCategory(id) {
        const url = '/category/' + id;
        return axiosClient.get(url);
    },
    getListCategory(data) {
        const url = '/category/search';
        if(!data.page || !data.limit){
            data.limit = 10;
            data.page = 1;
        }
        return axiosClient.post(url,data);
    },
}

export default categoryApi;