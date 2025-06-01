import axiosClient from './axiosClient';

const categoryApi = {

    createCategory(data) {
        const url = '/category/search';
        return axiosClient.post(url, data);
    },
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
    getListCategoryWithoutParent(data) {
        const url = '/category/getCategoriesWithoutParent';
        if(!data.page || !data.limit){
            data.limit = 10;
            data.page = 1;
        }
        return axiosClient.post(url,data);
    },
    deleteCategory(id) {
        const url = "/category/" + id;
        return axiosClient.delete(url);
    },
    searchCategory(name) {
        const params = {
            name: name.target.value
        }
        const url = '/category/searchByName';
        return axiosClient.get(url, { params });
    },
}

export default categoryApi;