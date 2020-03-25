/**
 * FileName: gateway
 * Auth: Linn
 * Created at: 2018/8/16
 * Description:
 */
import callback from './ajax/callback';
import uploadBack from './ajax/upload';

/**
 * 网关列表
 */
const getGateways = (history, data) => {
	return callback(history, 'api/v1/lorawan/gateways', 'get', data );
}

/**
 * 添加网关
 */
const addGateway = (history, data) => {
	return callback(history, 'api/v1/lorawan/gateways', 'post', data );
}

/**
 * 查询网关
 */
const queryGateway = (history, data) => {
	return callback(history, `api/v1/lorawan/gateways/${data}`, 'GET' );
}
/**
 * 查询网关-json
 */
const queryGatewayJson = (history, data) => {
    return callback(history, `api/v1/lorawan/gateways/message/${data}`, 'GET' );
}

/**
 * 删除网关
 */
const deleteGateway = (history, data) => {
	return callback(history, 'api/v1/lorawan/gateways/batchDelete', 'delete', data );
}

/**
 * 查找频段
 */
const getBand = (history, data) => {
    return callback(history, `api/v1/lorawan/bands/${data}`, 'GET');
}

/*重启网关*/
const resetGateway = (history, data) => {
    return callback(history, `api/v1/lorawan/gateways/reset/${data.id}`, 'POST');
}

/*网关升级时查找进行指派的项目和网关列表*/
const getUpdate = (history) => {
    return callback(history, `api/v1/lorawan/gateways/findProjectAndGateway`, 'GET');
}

/*网关升级*/
const toUpdate = (history,data) => {
    return callback(history, `api/v1/lorawan/gateways/update`, 'POST', data);
}



/*网关配置上传文件*/
const configAddFile = (history, data, file) => {
    return uploadBack(history, 'api/v1/lorawan/gateways/config','PATCH', data, file);
}

/*网关配置下发*/
const configLss= (history, data) => {
    return callback(history, `api/v1/lorawan/gateways/config?id=${data}`,'POST');
}

/*网关配置设置网络功率*/
const configNetPower = (history, data) => {
    return callback(history, `api/v1/lorawan/gateways/${data.id}`, 'POST', data);
}

/*网关配置-读取配置*/
const configRead= (history, data) => {
    return callback(history, `api/v1/lorawan/gateways/readConfig?id=${data}`,'GET');
}

/**
 * 批量导入网关
 */
const batchAddGateway = (history, data, file) => {
    return uploadBack(history, 'api/v1/lorawan/gateways/batchImport','POST', data, file);
}

/*网关-查看数据*/
const gatewaysData = (history, data) => {
    return callback(history, 'api/v1/lorawan/datas/gateways', 'get', data);
}

/*网关-查看数据-删除*/
const delGatewaysData = (history, data) => {
    return callback(history, 'api/v1/lorawan/datas/batchDelete', 'delete', data );
}

/*网关-查看数据-详情*/
const queryGatewaysData = (history, data, req ) => {
    return callback(history, `api/v1/lorawan/datas/${data}?type=${req}`, 'get' );
}

/*网关-上行频率详情*/
const queryFreq = (history, data ) => {
    return callback(history, `api/v1/lorawan/gateways/uplinkChannels/${data}`, 'GET' );
}

/*网关-编辑网关*/
const editGateway = (history, data ) => {
    return callback(history, `api/v1/lorawan/gateways/edit/${data.id}`, 'POST', data );
}

/**
 * 上行下行帧数1小时
 */
const getBaseHour = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/baseDataHour', 'get', data, undefined, alert);
}

/**
 * 上行下行帧数12/24小时
 */
const getBaseHours = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/baseDataHours', 'get', data, undefined, alert);
}

/**
 * 上下行帧数自定义时间
 */
const getBaseDay = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/baseDataDay', 'post', data, undefined, alert);
}

/**
 * 上行频点1/12/24小时
 */
const getFreqHours = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/upFreqHour', 'get', data, undefined, alert);
}
/**
 * 上行频点自定义时间
 */
const getFreqDay = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/upFreqDay', 'post', data, undefined, alert);
}

/**
 * 下行频点1/12/24小时
 */
const getDFreqHours = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/downFreqHour', 'get', data, undefined, alert);
}
/**
 * 下行频点自定义时间
 */
const getDFreqDay = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/downFreqDay', 'post', data, undefined, alert);
}
/**
 * 获取网关速率列表
 */
const getRate = (history, data) => {
    return callback(history, 'api/v1/lorawan/gateways/dataRateList', 'get', data);
}

/**
 * 上行频点1/12/24小时
 */
const getDatrHours = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/uplinkDatrHour', 'get', data, undefined, alert);
}
/**
 * 上行频点自定义时间
 */
const getDatrDay = (history, data, alert=false) => {
    return callback(history, 'api/v1/lorawan/gateways/statistic/uplinkDatrDay', 'post', data, undefined, alert);
}
/*网关-查看数据-网关日志*/
const queryGatewaysLog = (history, data ) => {
    return callback(history, `api/v1/lorawan/gateways/logList?id=${data}`, 'get' );
}

// /*网关-查看数据-网关日志-下发读取网关日志列表*/
// const queryLog = (history, data ) => {
//     return callback(history, `api/v1/lorawan/gateways/readLogInfoList?id=${data}`, 'get' );
// }

/*网关-查看数据-网关日志-单个读取*/
const readLog = (history, data ) => {
    console.log(data)
    if(!!data.logday){
        return callback(history, `api/v1/lorawan/gateways/log?id=${data.id}&logType=${data.logType}&logday=${data.logday}`, 'get' );
    }else{
        return callback(history, `api/v1/lorawan/gateways/log?id=${data.id}&logType=${data.logType}`, 'get' );
    }

}
export {
    editGateway, getGateways, queryGateway, addGateway, deleteGateway, getBand, getUpdate, toUpdate, configAddFile, configLss, resetGateway, queryGatewayJson, batchAddGateway, configNetPower, gatewaysData, delGatewaysData, queryGatewaysData, queryFreq, configRead,
    getBaseDay, getBaseHour, getBaseHours, getFreqHours, getFreqDay, getRate, getDatrHours, getDatrDay, getDFreqHours, getDFreqDay, queryGatewaysLog, readLog
}
