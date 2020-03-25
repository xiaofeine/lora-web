/**
 * FileName: callback
 * Auth: Linn
 * Created at: 2017/9/7
 * Description:
 */
import { ajax } from 'jquery';
import { domain } from 'Configs/utils';
import { Modal, message } from 'antd';

const callback =(history, url, type, data={}, auth=true, alert=true, extraUrl='?')=> {
	if (type === 'get' && Object.keys(data).length > 0) {
		let keys = Object.keys(data);
		keys.map((k, i)=> {
			if (keys.length === i+1) {
				extraUrl = extraUrl + k + '=' + data[k];
			} else {
				extraUrl = extraUrl + k + '=' + data[k] +'&'
			}
		});
        url = url + extraUrl;
	}
	let httpback = new Promise((resolve, reject)=> {
		ajax({
			type: type,
			url: domain + url,
			data: type.toLowerCase()==='get'?null:JSON.stringify(data),
			contentType: 'application/json',
			timeout: 5000,
			async: true,
			beforeSend: (xhr)=> {
				if (auth) {
					xhr.setRequestHeader(
						'Authorization', 'Bearer '+sessionStorage.getItem('token')
					);
				}
			},
			success: (res)=> {
				resolve(res);
			},
			complete: (xml, textStatus)=> {
				if (textStatus === 'timeout') {
					reject('timeout');
				}
			},
			error: (xml, textStatus)=> {
				reject(xml);
			}
		})
	});
	return httpback.then((res)=> {
		if (!!res) {
			if (res.code === 8000) {
				return !!res.data?res.data:'success';
			} else {
				let title = res.msg || '请求出错';
				if (alert) {
					/*Modal.error({
						title: title,
					});*/
					message.error(title);
				}
				return null;
			}
		}
	}).catch((res)=> {
		if (alert) {
			if (res === 'timeout') {
				/*Modal.error({
					title: '请求超时',
				});*/
				message.error('请求超时');
			} else {
				//console.log('res.catch', res.status);
				switch (res.status) {
					case 401:
						if (auth) {
							Modal.error({
								title: '无权限或者登录已过期！',
								onOk: ()=> {
									sessionStorage.clear();
									window.history.pushState(null,null,'/login');
									window.history.go();
								}
							});
						} else {
							/*Modal.error({
								title: '用户名或密码错误',
								centered: true,
							});*/

							message.error('用户名或密码错误');
						}
						break;
					case 403:
						/*Modal.error({
							title: '禁止访问',
						});*/
						message.error('禁止访问');
						break;
					case 400:
						message.error('请求参数不合法');
						break;
					case 404:
						message.error('未找到资源');
						break;
					default:
						message.error('请求失败');
						break;
				}
			}
			return null;
		} else {
			return res;
		}
	});
}

export default callback;