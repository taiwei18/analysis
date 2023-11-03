import axios from "axios";
import { message } from 'ant-design-vue';

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
//请求后回调
service.interceptors.response.use(
    response => {
        if (response.data.code == '200') {
            message.success(`${response.data.msg}`);
        } else {
            message.error(`${response.data.msg}`);
        }
        console.log(`${response.config.url}请求后回调`, response);
        return response.data;
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