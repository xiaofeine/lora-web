/**
 * FileName: app
 * Auth: Linn
 * Created at: 2018/8/16
 * Description:
 */
import callback from './ajax/callback';
import uploadBack from './ajax/upload';
import { ajax } from 'jquery';
import { domain } from 'Configs/utils';

/**
 * HTTP列表
 */
const getHTTPs = (history, data) => {
    return callback(history, 'api/v1/lorawan/httpEndpoints', 'get', data );
}

/**
 * 添加HTTP
 */
const addHTTP = (history, data) => {
    return callback(history, 'api/v1/lorawan/httpEndpoints', 'post', data );
}

/**
 * 删除HTTP
 */
const deleteHTTP = (history, data) => {
    return callback(history, 'api/v1/lorawan/httpEndpoints/batchDelete', 'delete', data );
}

/**
 * 修改HTTP
 */
const editHTTP = (history, data) => {
    return callback(history, `api/v1/lorawan/httpEndpoints/${data.id}`, 'put', data );
}

/**
 * MQTT列表
 */
const getMQTTs = (history, data) => {
    return callback(history, 'api/v1/lorawan/mqttEndpoints', 'get', data );
}

/**
 * 添加HTTP
 */
const addMQTT = (history, data) => {
    return callback(history, 'api/v1/lorawan/mqttEndpoints', 'post', data );
}

/**
 * 删除HTTP
 */
const deleteMQTT = (history, data) => {
    return callback(history, 'api/v1/lorawan/mqttEndpoints/batchDelete', 'delete', data );
}

/**
 * 修改HTTP
 */
const editMQTT = (history, data) => {
    return callback(history, `api/v1/lorawan/mqttEndpoints/${data.id}`, 'put', data );
}


export {
    getHTTPs, addHTTP, editHTTP, deleteHTTP,
    getMQTTs, addMQTT, editMQTT, deleteMQTT,
}