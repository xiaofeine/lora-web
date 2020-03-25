import callback from "./ajax/callback";

/**
 * 组播管理列表
 */
const queryGroups = (history, data) => {
    return callback(history, `api/v1/lorawan/groups`, 'get', data);
}

/**
 *组播管理列表添加
 */
const addGroup = (history, data) => {
    return callback(history, `api/v1/lorawan/groups`, 'post', data);
}

/**
 * 组播管理列表删除
 */
const delGroup = (history, data) =>{
    return callback(history, `api/v1/lorawan/groups/batchDelete`, 'DELETE', data);
}

/**
 * 组播管理列表查看
 */
const queryGroup = (history, data) =>{
    return callback(history, `api/v1/lorawan/groups/${data.id}`, 'GET', data);
}
/**
 * 组播详情编辑
 */
const editGroup = (history, data) =>{
    return callback(history, `api/v1/lorawan/groups/${data.id}`, 'POST', data);
}
/**
 * 组播节点列表
 */
const groNode = (history, data ) => {
    return callback(history, `api/v1/lorawan/groupDevices`, 'get', data);
}

/**
 * 组播节点添加
 */
const addNode = (history, data) => {
    return callback (history, `api/v1/lorawan/groupDevices`, 'POST', data)
}
/**
 * 组播节点删除
 */
const delNode = (history, data) => {
    return callback(history, `api/v1/lorawan/groupDevices/batchDelete`, 'DELETE', data)
}
/**
 * 查找ClassC节点列表
 */
const queryNode = (history, data) => {
    return callback(history, `api/v1/lorawan/devices/classC`, 'get', data)
}


/**
 *查看数据列表
 */
const queryData = (history, data) => {
    return callback(history, `api/v1/lorawan/groupDatas`, 'get', data)
}

/**
 * 查看数据详情
 */
const viewData = (history, data) => {
    return callback(history, `api/v1/lorawan/groupDatas/${data.id}`, 'GET' ,data)
}
/**
 * 查看数据删除
 */
const delData = (history, data) => {
    return callback (history, `api/v1/lorawan/groupDatas/batchDelete`, 'DELETE', data)
}

/**
 * 组播调试
 */
const groDebug = ( history, data ) => {
    return callback (history, `api/v1/lorawan/debug/multicast`, 'POST', data)
}

/**
 * 最优下行网关列表
 */
const debugList = (history, data) => {
    return callback (history, `api/v1/lorawan/groups/gateways`, 'get', data)
}
/**
 * 项目下网关列表
 */
const debugProList = (history, data) => {
    return callback (history, `api/v1/lorawan/projects/onlineGateways`, 'get', data)
}


export { queryGroups, addGroup, delGroup, queryGroup, editGroup, groNode, addNode, queryData,
    delNode, delData, viewData, queryNode, groDebug, debugList, debugProList }