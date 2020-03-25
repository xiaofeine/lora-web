
/**
 * FileName: project
 * Auth: Linn
 * Created at: 2018/8/14
 * Description:
 */

import callback from './ajax/callback';

/**
 * 项目列表
 */
const queryProjects = (history, data) => {
	return callback(history, 'api/v1/lorawan/projects', 'get', data );
}
/**
 * 项目列表(不分页)
 */
const getProjects = (history, data) => {
	return callback(history, 'api/v1/lorawan/projectList', 'get');
}

/**
 * 删除项目
 */
const deleleProject = (history, data) => {
	return callback(history, `api/v1/lorawan/projects/${data.id}`, 'delete');
}

/**
 * 添加项目
 */
const addProject = (history, data) => {
	return callback(history, `api/v1/lorawan/projects`, 'post', data);
}

/**
 * 获取频段列表
 */
const getBands = (history) => {
	return callback(history, `api/v1/lorawan/bandsList`, 'GET');
}

/**
 * 编辑项目
 */
const editProject = (history, data) => {
    return callback(history, `api/v1/lorawan/projects/${data.id}`, 'PUT', data);
}

/**
 * 查询单个项目详情
 */
const queryProject = (history, data) => {
	return callback(history, `api/v1/lorawan/projects/${data}`, 'GET');
}

/**
 * 有效数据包统计/网关在线率统计 日期
 */
const getBaseDay =(history, data) => {
	return callback(history, 'api/v1/lorawan/projects/baseDataDay', 'post', data);
}

/**
 * 有效数据包统计/网关在线率统计 时刻
 */
const getBaseHour =(history, data) => {
	return callback(history, 'api/v1/lorawan/projects/baseDataHour', 'get', data);
}

/**
 * 有效数据包统计/网关在线率统计 时刻s
 */
const getBaseHours =(history, data) => {
	return callback(history, 'api/v1/lorawan/projects/baseDataHours', 'get', data);
}

/**
 * 频点统计 日期
 */
const getFreqDay =(history, data) => {
	return callback(history, 'api/v1/lorawan/projects/freqDay', 'post', data);
}

/**
 * 频点统计 时刻s
 */
const getFreqHours =(history, data) => {
	return callback(history, 'api/v1/lorawan/projects/freqHour', 'get', data);
}

/**
 * 速率统计 日期
 */
const getSDay =(history, data) => {
	return callback(history, 'api/v1/lorawan/projects/datrDay', 'post', data);
}

/**
 * 速率统计 时刻s
 */
const getSHours =(history, data) => {
	return callback(history, 'api/v1/lorawan/projects/datrHour', 'get', data);
}

export {
	queryProjects, deleleProject, getBands, addProject, editProject, queryProject,
	getProjects,
	getBaseDay, getBaseHours, getBaseHour,
	getFreqDay, getFreqHours,
	getSDay, getSHours,
}