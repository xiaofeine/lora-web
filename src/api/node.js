/**
 * FileName: node
 * Auth: Linn
 * Created at: 2018/8/16
 * Created at: 2018/9/14
 * Description:
 */
import callback from './ajax/callback';
import uploadBack from './ajax/upload';
import { ajax } from 'jquery';
import { domain } from 'Configs/utils';

/**
 * 节点列表
 */
const getNodes = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices', 'get', data );
}

/**
 * 节点数据列表
 */
const getNodeDatas = (history, data) => {
	return callback(history, 'api/v1/lorawan/datas/devices', 'get', data );
}

/**
 * 添加ABP节点
 */
const addABP = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/addABP', 'post', data );
}

/**
 * 添加OTAA节点
 */
const addOTAA = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/addOTAA', 'post', data );
}

/**
 * 查询节点
 */
const queryNode = (history, data) => {
	return callback(history, `api/v1/lorawan/devices/${data.id}`, 'get' );
}

/**
 * 查询节点数据
 */
const queryNodeData = (history, data) => {
	return callback(history, `api/v1/lorawan/datas/${data.id}`, 'get', data );
}

/**
 * 删除节点
 */
const deleteNode = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/batchDelete', 'delete', data );
}

/**
 * 删除节点数据
 */
const delNodeDatas = (history, data) => {
	return callback(history, 'api/v1/lorawan/datas/batchDelete', 'delete', data );
}

/**
 * 修改节点
 */
const editNode = (history, data) => {
	return callback(history, `api/v1/lorawan/devices/${data.id}`, 'put', data );
}

/**
 * 节点调试
 */
const nodeDebug = (history, data) => {
	return callback(history, 'api/v1/lorawan/debug/downlink', 'post', data );
}

/**
 * 批量导入
 */
const batchAdd = (history, data, file) => {
	return uploadBack(history, 'api/v1/lorawan/devices/batchImport','POST', data, file);
}

/**
 * 启用/禁用
 */
const batchEnable = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/batchEnableADR', 'patch', data);
}

/**
 * 启用/禁用信道
 */
const batchEnableChannels = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/channels/batchEnable', 'patch', data);
}

/**
 * 获取信道列表
 */
const getChannels = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/channels', 'get', data);
}

/**
 * 获取class-c节点列表
 */
const getClassC = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/classC', 'get', data);
}


/**
 * MAC命令下发
 */
const sendMacs = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/macCommand', 'post', data);
}


/**
 * 频段列表
 */
const getBands = (history, data) => {
	return callback(history, 'api/v1/lorawan/bandsList', 'get');
}

/**
 * 上行概况
 */
const getUplinkData = (history, data) => {
	return callback(history, 'api/v1/lorawan/devices/uplinkDataStatistic/'+data.id, 'get', undefined, undefined, false);
}

/**
 * 上行下行帧数1小时
 */
const getBaseHour = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/baseDataHour', 'get', data, undefined, alert);
}

/**
 * 上行下行帧数12/24小时
 */
const getBaseHours = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/baseDataHours', 'get', data, undefined, alert);
}

/**
 * 上下行帧数自定义时间
 */
const getBaseDay = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/baseDataDay', 'post', data, undefined, alert);
}

/**
 * Rssi小时/12/24
 */
const getRssiHour = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/uplinkRssiHour', 'get', data, undefined, alert);
}

/**
 * Rssi自定义时间
 */
const getRssiDay = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/uplinkRssiDay', 'post', data, undefined, alert);
}

/**
 * SNR小时/12/24
 */
const getSnrHour = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/uplinkSnrHour', 'get', data, undefined, alert);
}

/**
 * SNR自定义时间
 */
const getSnrDay = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/uplinkSnrDay', 'post', data, undefined, alert);
}

/**
 * 上行TOA/成功率
 */
const getSToa = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/uplinkToaAndSuccess', 'get', data, undefined, alert);
}

/**
 * 上行速率统计 日期
 */
const getSpeedDay = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/uplinkDatrDay', 'post', data, undefined, alert);
}

/**
 * 上行速率统计 时刻
 */
const getSpeedHour = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/statistic/uplinkDatrHour', 'get', data, undefined, alert);
}

/**
 * 上行帧速率
 */
const getUpDatr = (history, data, alert=false) => {
	return callback(history, 'api/v1/lorawan/devices/uplinkFrameDatr', 'get', data, undefined, alert);
}

/**
 * 信道上行
 */
const getUpFreq = (history, data)=> {
	return callback(history, 'api/v1/lorawan/devices/statistic/upFreq', 'get', data);
}

/**
 * 信道下行
 */
const getDownFreq = (history, data)=> {
	return callback(history, 'api/v1/lorawan/devices/statistic/downFreq', 'get', data);
}

export {
	getNodes, queryNode, addABP, addOTAA, deleteNode, editNode, batchAdd, batchEnable, nodeDebug,
	getChannels, batchEnableChannels,
	getClassC, sendMacs, getBands,
	getNodeDatas, delNodeDatas, queryNodeData,
	getUplinkData,
	getBaseDay, getBaseHour, getBaseHours,
	getRssiHour, getRssiDay,
	getSnrHour, getSnrDay,
	getSToa,
	getSpeedDay, getSpeedHour,
	getUpDatr,
	getUpFreq, getDownFreq,
}


