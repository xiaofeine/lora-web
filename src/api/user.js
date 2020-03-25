/**
 * FileName: user
 * Auth: Linn
 * Created at: 2018/8/3
 * Description:
 */
import callback from './ajax/callback';


/**
 * 登录接口
 * @param history
 * @param data
 */
const login = (history, data) => {
	return callback(history, 'api/v1/auth/login', 'POST', data, false);
}


/**
 * 修改密码接口
 * @param history
 * @param data
 */
const edit = (history, data) => {
	return callback(history, 'api/v1/users/changePassword', 'PATCH', data);
}

/**
 * 获取用户列表
 */
const getList = (history, data) => {
	return callback(history, `api/v1/users`, 'get', data, true, false);
}

/**
 * 添加用户
 */
const add = (history, data) => {
    return callback(history, 'api/v1/auth/register', 'POST', data );
}

/**
 * 删除用户
 */
const delUser = (history, data) => {
    return callback(history, 'api/v1/users/batchDelete', 'DELETE', data );
}

/**
 * 用户详情 查看
 */
const queryUser = (history, data) => {
    return callback(history, `api/v1/users/${data.id}`, 'GET' );
}

/**
 *用户详情 编辑
 */

const editUser = (history, data) => {
    return callback(history, `api/v1/users/${data.id}`, 'PUT', data);
}

/**
 * 启用和禁用 用户
 */
const batchEnable = (history, data) => {
    return callback(history, 'api/v1/users/batchEnable', 'PATCH', data );
}

/**
 * 固定视角
 */
const fixMap =(history, data)=> {
	return callback(history, 'api/v1/users/updateMapSite', 'POST', data);
}

/**
 * 获取系统配置时间
 */
const getTime =(history) => {
	return callback(history, 'api/v1/system/param', 'get');
}

export {
	login, edit, getList, add, delUser, batchEnable, queryUser, editUser,
	fixMap, getTime
}

