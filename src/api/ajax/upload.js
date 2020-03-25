/**
 * FileName: upload
 * Auth: Linn
 * Created at: 2018/8/23
 * Description:
 */
import { ajax } from 'jquery';
import { domain } from 'Configs/utils';
import { Modal, message } from 'antd';

const uploadBack =(history, url, type, data, file)=> {
	let formData = new FormData();
	formData.append('file', file);
	let keys = Object.keys(data);
	keys.map((k)=> {
		formData.append(k, data[k]);
	});
	let httpback = new Promise((resolve, reject)=> {
		ajax({
			type: type,
			url: domain + url,
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: (xhr)=> {
				xhr.setRequestHeader(
					'Authorization', 'Bearer '+sessionStorage.getItem('token')
				);
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
					message.error(title);
				}
				return null;
			}
		}
	}).catch((res)=> {
		if (alert) {
			if (res === 'timeout') {
				message.error('请求超时');
			} else {
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
							message.error('用户名或密码错误');
						}
						break;
					case 403:
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

export default uploadBack;