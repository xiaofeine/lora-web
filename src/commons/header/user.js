/**
 * FileName: admin
 * Auth: Linn
 * Created at: 2018/8/3
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import {
	Link,
	NavLink,
	Switch,
	Redirect
} from 'react-router-dom';
import $ from 'jquery';
import { Layout, Menu, Icon, Modal, notification,
	Button, Form, Input, Popconfirm, Select } from 'antd';
import { domain } from 'Configs/utils';
import { edit } from 'Api/user';
import { queryDevice } from 'Api/dashboard';

const { Header } = Layout;
const FormItem = Form.Item;
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const confirm = Modal.confirm;
const Option = Select.Option;
const InputGroup = Input.Group;

export default class UserHeader extends React.Component {

	getActive =()=> {
		let href = this.props.history.location.pathname;
		switch (href) {
			case '/user/dashboard':
				return 'dashboard';
				break;
			case '/user/files':
				return 'files';
				break;
			case '/user/system':
			case '/user/system/bands':
			case '/user/system/firmHistory':
				return 'system';
				break;
            case '/user/404':
                return '';
                break;
            case '/user/500':
                return '';
                break;
			default:
				return 'projects';
				break;
		}
	}

	state = {
		active: this.getActive(),
		active2: '123',
		visible: false,
        filesVisible: false,
		fields: {
			username: {
				value: sessionStorage.getItem('name'),
			},
			password: {
				value: null,
			},
			confirmPassword: {
				value: null,
			}
		},
		pop: false,
		search: false,
		req: {
			type: 'node',
			value: null,
		},
		socket: {
			close: function () {
				
			}
		},
	}

	componentDidMount() {
		let url = domain.replace('http', 'ws') + 'api/v1/websocket/lorawan/gateway?Authorization=' + sessionStorage.getItem('token');
		this.createWebSocket(url);
		$(document).click((e)=> {
			let o = e.target;
			if(o.nodeName != 'svg' && $(o).closest('#header-search').length==0 && $(o).closest('#search-node').length==0 && $(o).closest('#search-gateway').length==0) {
				this.setState({ search: false });
			}
		});
	}

	componentWillUnmount() {
		sessionStorage.setItem('close', 'close');
		this.state.socket.close();
	}

	handleJump =(key, url, gateway)=> {
		sessionStorage.setItem('gateway', gateway.id);
		sessionStorage.setItem('gateway_name', gateway.gatewayEui);
		if (url.indexOf('History') > -1) {
			this.props.history.push(url, {type: 'fail'});
			$('.ant-menu-item-selected').each((a, b)=>{
				if (b.id=='projects-item') {
					b.classList.remove('ant-menu-item-selected');
				}
			});
			$('#system-item').addClass(' ant-menu-item-selected');
		} else {
			this.props.history.push(url);
		}

		notification.close(key);
	}

	createWebSocket =(url)=> {
		let socket ;
		try {
			if ('WebSocket' in window) {
				socket = new WebSocket(url);
			} else if ('MozWebSocket' in window) {
				socket = new MozWebSocket(url);
			} else {
				socket = new SockJS(url);
			}
			socket.onopen = (e) => {
				console.log('on open', new Date());
			}
			socket.onmessage = (e) => {
				let data = JSON.parse(e.data);
				if (!!e.data) {
					let code = data.code;
					let gateway = data.data.gatewayEui;
					let id = data.data.id;
					let name = data.data.name;
					let succeed = !!data.data.succeed;
					let type = !!succeed?'success':'error';
					let key = gateway + new Date();
					let ob = data.data;
                    let path = data.data.path;
                    let logday = data.data.logday;
					switch (code) {
						case 0:
							notification['success']({
								message: '网关上线',
								description: (
									<div>
										<div>{name}</div>
										<div>{gateway}</div>
									</div>
								),
								duration: 3,
							});
							break;
						case 1:
							notification['error']({
								key: key,
								message: '网关离线',
								description: (
									<div>
										<div>{name}</div>
										<div>{gateway}
											<Button onClick={this.handleJump.bind(this, key, '/user/gateway/detail', ob)}>
												查看
											</Button>
										</div>
									</div>
								),
								duration: null,
							});
							break;
						case 2:
							succeed?
								notification[type]({
									message: '网关配置成功',
									description: (
										<div>
											<div>{name}</div>
											<div>{gateway}</div>
										</div>
									),
									duration: 3,
								}):
								notification[type]({
									key: key,
									message: '网关配置失败',
									description: (
										<div>
											<div>{name}</div>
											<div>{gateway}
												<Button onClick={this.handleJump.bind(this, key, '/user/gateway/config', ob)}>查看</Button>
											</div>
										</div>
									),
									duration: null,
								})
							;
							this.setState({readClass:true});
							break;
						case 3:
							succeed?
								notification[type]({
									message: '网关升级成功',
									description: (
										<div>
											<div>{name}</div>
											<div>{gateway}</div>
										</div>
									),
									duration: 3,
								})
								:
								notification[type]({
									key: key,
									message: '网关升级失败',
									description: (
										<div>
											<div>{name}</div>
											<div>{gateway}
												<Button onClick={this.handleJump.bind(this, key, '/user/system/firmHistory', ob)}>查看</Button>
											</div>
										</div>
									),
									duration: null,
								})
							;
							break;
                        case 8:
                            succeed?
                                notification[type]({
                                    message: '读取配置成功',
                                    description: (
										<div>
											<div>{name}</div>
											<div>{gateway}
												<a style={{float:'right'}}
												   download
												   href={`${requestUrl}api/v1/lorawan/gateways/downloadConfig?Authorization=${sessionStorage.getItem('token')}&id=${id}`}>下载</a>
											</div>
										</div>
                                    ),
                                    duration: null,
                                })
                                :
                                notification[type]({
                                    key: key,
                                    message: '读取配置失败',
                                    description: (
										<div>
											<div>{name}</div>
											<div>{gateway}</div>
										</div>
                                    ),
                                    duration: 3,
                                })
                            ;
                            break;
                        case 12:
                            succeed?
                                notification[type]({
                                    message: '读取日志成功',
                                    description: (
										<div>
											<div>{logday}</div>
											<div>
												<a style={{float:'right'}}
												   download onClick={()=>notification.close(key)}
												   href={`${requestUrl}api/v1/lorawan/gateways/downloadLog?Authorization=${sessionStorage.getItem('token')}&filename=${logday}&path=${path}`}>下载</a>
											</div>
										</div>
                                    ),
                                    duration: null,
                                    key: key,
                                    onClose: close,
                                })
                                :
                                notification[type]({
                                    key: key,
                                    message: '读取日志失败',
                                    description: (
										<div>
											<div>{logday}</div>
										</div>
                                    ),
                                    duration: 3,
                                })
                            ;
                            break;
						default:
							break;
					}
				}
			}
			socket.onerror =(e)=> {
				console.log('error', e)
			}
			socket.onclose = (e ) => {
				if (sessionStorage.getItem('close')==='close'||e.code === 1008) {
				} else {
					this.reconnect(url)
				}

			}
			this.setState({ socket });
		} catch (e) {
			this.reconnect(url);
			}
		}

	reconnect =(url, lockReconnect)=> {
		if(lockReconnect) return;
		lockReconnect = true;
		//没连接上会一直重连，设置延迟避免请求过多
		setTimeout( ()=> {
			console.log('connecting');
			this.createWebSocket(url);
			lockReconnect = false;
		}, 2000);
	}

	handleSelect =(value)=> {
		console.log('value');
	}

	handleChange =(changeFields)=> {
		this.setState(({fields})=>({
			fields: {...fields, ...changeFields},
		}));
	}

	handleClick =(e)=> {
		this.setState({active2:'123'});
		if (e.item.props.name === 'out') {
			sessionStorage.clear();
			this.props.history.push('/login');
		} else {
			this.showModal();
		}
	}

	handleMenu =(e)=> {
		this.setState({ active: e.key });
		this.props.history.push('/user/'+e.key);
	}

	showModal =()=> {
        this.setState({ visible: true });
    }

    showFiles =()=> {
        this.setState({ filesVisible: true });
    }

	toSubmit =()=> {
		let user = this.state.fields;
		let history = this.props.history;
		this.refs.edit.validateFields((err, values) => {
			if (!err) {
				confirm({
					title: '确定要修改密码吗？',
					content: '修改密码后，需要重新登录',
					style: {
						centered: true
					},
					onOk() {
						let req = {
							password: user.password.value,
						}
						return edit(history, req)
							.then((res)=> {
								if (!!res) {
									Modal.success({
										title: '已修改！',
										content: '请返回重新登录',
										centered: true,
										onOk: ()=> {
											sessionStorage.clear();
											history.push('/login');
										},
										onCancel: ()=> {
											sessionStorage.clear();
											history.push('/login');
										}
									})
								}
							}).catch(()=>{})
					},
					onCancel() {
					},
				});
			}
		});

	}

	handleCancel =()=> {
		this.setState({ visible: false, filesVisible: false, search: false, req: { type: 'node', value: null } });
	}

	toSearch =()=> {
		this.setState({ search: true });
	}

	handleSearchChange =(key, value)=> {
		let req = this.state.req;
		req[key] = key==='type'?value:value.target.value;
		this.setState({ req });
	}

	handleSearch =(e)=> {
		e.preventDefault();
		let data = {...this.state.req};
		let req = {
			eui: data.value,
			nodeType: data.type==='gateway'?data.type.toUpperCase():'DEVICE',
		};
		queryDevice(this.props.history, req)
			.then((res)=> {
				if (!!res && res !== 'success') {
					if (data.type === 'gateway') {
						sessionStorage.setItem('gateway', res.id);
					} else {
						sessionStorage.setItem('node', res.id)
					}
					this.props.history.push(`/user/${data.type}/detail`, { data: res });
				} else {
					Modal.error({
						title: '未找到设备',
					});
				}
			});
	}

	componentDidUpdate(prevProps, prevState) {
		let active = this.getActive();
		if (active != prevState.active) {
			this.setState({ active });
		}
	}

	render() {
		let fields = this.state.fields;
		return (
			<Header className="header" style={{ padding: 0 }}>
				<div className="header-logo" style={{ marginLeft: '50px' }}></div>
				<Menu
					theme="dark"
					mode="horizontal"
					selectedKeys={[this.state.active]}
					onClick={this.handleMenu}
				>
					<MenuItem id="dashboard-item" key="dashboard">概况</MenuItem>
					<MenuItem id="projects-item" key="projects">项目管理</MenuItem>
					<MenuItem id="system-item" key="system">系统管理</MenuItem>
				</Menu>
				<span type="primary" onClick={this.showFiles} style={{ background: 'transparent', border: 0, fontSize:'16px', color:'rgba(255, 255, 255, 0.65)', marginLeft:'20px', cursor: 'pointer'}}>操作文档</span>
				{
					!this.state.search?
						<div id="header-right" className="header-right" style={{ marginRight: '50px' }}>
							<Select defaultValue="lorawan"
									style={{ width: 130, paddingRight: 28, display: 'none' }}
									disabled
									onChange={this.handleSelect}>
								<Option value="lorawan">lorawan</Option>
							</Select>
							<Icon type="search" onClick={this.toSearch}
								  style={{ cursor: 'pointer', color: 'rgba(255,255,255,1)'}} />
							<Menu
								theme="dark"
								mode="horizontal"
								selectedKeys={[this.state.active2]}
								onClick={this.handleClick}
								className="header-user"
							>
								<SubMenu title={<span><Icon type="user" />{sessionStorage.getItem('name')}</span>}>
									<Menu.Item name="edit">个人中心</Menu.Item>
									<Menu.Item name="out">退出</Menu.Item>
								</SubMenu>
							</Menu>
						</div>:
						<div id="header-search" className="header-right header-search">
							<InputGroup className="input-group" size="large" compact={false}>
								<Input value={this.state.req.value}
									   placeholder={this.state.req.type==='node'?'devEui':'gatewayEui'}
									   style={{ paddingLeft: '80px', paddingRight: '50px' }}
									   onChange={this.handleSearchChange.bind(this, 'value')}
									   onPressEnter={this.handleSearch}/>
								<Select defaultValue={this.state.req.type}
										size="large"
										id="search"
										onChange={this.handleSearchChange.bind(this, 'type')}>
									<Option id="search-node" value="node">节点</Option>
									<Option id="search-gateway" value="gateway">网关</Option>
								</Select>
							</InputGroup>
							<Icon type="close-circle" onClick={this.handleCancel} />
						</div>
				}
				<Modal
					title="个人中心"
					centered={true}
					visible={this.state.visible}
					onOk={this.toSubmit}
					onCancel={this.handleCancel}
				>
					<Edit ref="edit" {...fields} onChange={this.handleChange}/>
				</Modal>
				<Modal
					title="操作文档"
					centered={true}
					visible={this.state.filesVisible}
					onCancel={this.handleCancel}
					footer={null}
				>
					<div className="centerTc">
						<h3>LoRaWAN文档</h3>
						<Button type="primary" onClick={this.handleCancel} href="https://senthink.gitbook.io/wireless-cloud-platform-manual" target="_blank" >LoRaWAN物联网平台操作手册</Button>
						<Button type="primary" onClick={this.handleCancel} href="https://senthink.gitbook.io/wireless-cloud-platform-development-document/" target="_blank" >LoRaWAN物联网平台开发文档</Button>
					</div>
				</Modal>
			</Header>
		)
	}
}

const Edit = Form.create({
	onFieldsChange(props, changedFields) {
		props.onChange(changedFields);
	},
	mapPropsToFields(props) {
		return {
			username: Form.createFormField({
				...props.username,
				value: props.username.value,
			}),
			password: Form.createFormField({
				...props.password,
				value: props.password.value,
			}),
			confirmPassword: Form.createFormField({
				...props.confirmPassword,
				value: props.confirmPassword.value,
			}),
		};
	},
	onValuesChange(_, values) {
		console.log(values);
	},
})((props) => {
	const { getFieldDecorator } = props.form;

	const handleConfirm = (rule, value, callback)=> {
		if (value === props.password.value) {
			callback();
		} else {
			callback('两次密码不一致！');
		}
	}
	return (
		<Form layout="horizontal">
			<Form.Item label="登录账号">
				{getFieldDecorator('username')(
					<Input size="large" readOnly />
				)}
			</Form.Item>
			<Form.Item label="密码"
					   hasFeedback={true}>
				{getFieldDecorator('password', {
					rules: [
						{
							required: true, message: '请输入密码!'
						},
						{ max: 16, min: 4, message: '密码长度在4~16之间！'}
					],
				})(
					<Input size="large" type="password" placeholder="请输入" />
				)}
			</Form.Item>
			<Form.Item label="确认密码"
					   hasFeedback={true}>
				{getFieldDecorator('confirmPassword', {
					rules: [
						{
							required: true, message: '请输入确认密码!'
						},
						{ validator: handleConfirm }
					],
				})(
					<Input size="large" type="password" placeholder="请输入" />
				)}
			</Form.Item>
		</Form>
	);
});