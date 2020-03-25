/**
 * FileName: dashboard
 * Auth: Linn
 * Created at: 2018/8/9
 * Description:
 */
import callback from './ajax/callback';

/**
 * 根据Eui来查询网关或者节点
 * @param history
 * @param data
 */
const queryDevice = (history, data) => {
	return callback(history, 'api/v1/lorawan/projects/findDeviceOrGatewayByEui', 'get', data);
}

/*项目概况*/
const queryDashboard = (history, data) => {
    return callback(history, 'api/v1/users/survey', 'get', data);
}

const queryMap =(history, data)=> {
	return callback(history, 'api/v1/lorawan/gatewayList', 'get', data);
}

export {
	queryDevice, queryDashboard, queryMap,
}