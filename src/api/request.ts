import axios from "axios";

//初始化请求
const service = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 60000
});

//请求前回调
service.interceptors.request.use(
    request => {
        return request;
    },
    error => {
        return Promise.reject(error);
    }
);



const requestData = async (url: string, data = {}, method = "POST",) => {
    const reqdata = await service({ url: url, data: data, method: method })
    return reqdata
}

export default requestData