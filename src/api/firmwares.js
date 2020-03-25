/**
 * FileName: firmwares
 * Auth: Zhoujianfei
 * Created at: 2018/8/22
 * Description:
 */
import callback from './ajax/callback';
import uploadBack from './ajax/upload';
import { domain } from 'Configs/utils';

/*获取固件列表*/
const getFirmWaresList = (history, data) => {
    const { projectId, ...newdata }=data;
    return callback(history, `api/v1/lorawan/firmwares`, 'get', newdata);
}

/*添加固件*/
const addFirmWares = (history, data, file) => {
    return uploadBack(history, 'api/v1/lorawan/firmwares', 'POST', data, file);
}

/*删除固件*/
const deleteFirmWares = (history, data) => {
    return callback(history, `api/v1/lorawan/firmwares/batchDelete`, 'DELETE', data);
}

/*获取固件升级列表*/
const getHistory = (history, data) => {
    return callback(history, `api/v1/lorawan/firmwareHistorys`, 'get', data);
}

/*删除固件历史记录*/
const deleteHisFirmWares = (history, data) => {
    return callback(history, `api/v1/lorawan/firmwareHistorys/batchDelete`, 'DELETE', data);
}

/*重新升级固件/api/v1/lorawan/gateways/updateAgain*/
const updateFirmWares = (history, data) => {
    return callback(history, `api/v1/lorawan/gateways/updateAgain`, 'POST', data);
}

/**
 * 频段列表
 */
const getBands = (history, data) => {
    return callback( history, `api/v1/lorawan/bands`, 'get', data)
}
/**
 * 删除频段
 */
const delBands = (history, data) => {
    return callback(history, `api/v1/lorawan/bands/${data}`, 'DELETE')
}
/**
 * 查找频段
 */
const queryBands = (history, data) => {
    return callback(history, `api/v1/lorawan/bands/${data.id}`, 'get', data)
}
/**
 * 重新导入频段
 */
const reAddBands = (history, data, file) => {
    return uploadBack(history, `api/v1/lorawan/bands/import`, 'POST', data, file)
}

export {
    getFirmWaresList, addFirmWares, deleteFirmWares, getHistory, deleteHisFirmWares, updateFirmWares, getBands,
delBands, queryBands, reAddBands
}