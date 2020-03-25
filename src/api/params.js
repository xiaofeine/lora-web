import callback from './ajax/callback';

/**
 * 网络参数列表
 **/
const queryParams = (history, data) => {
    return callback(history, `api/v1/lorawan/projects/${data.id}`, 'get')
}
/**
 * 编辑网络参数
 */
const editParams = (history, data) => {
    return callback(history, `api/v1/lorawan/projects/networkParam/${data.id}`, 'put', data)
}

export { queryParams, editParams }