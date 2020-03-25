/**
 * FileName: debug
 * Auth: Linn
 * Created at: 2018/9/4
 * Description:
 */

import React from 'react';
import { render } from 'react-dom';
import {
	Layout, Form, Tag, Button, Row, Col, Icon, Tabs,
	Radio, AutoComplete, Input, Checkbox, Modal, Transfer, message, notification
} from 'antd';
import $ from 'jquery';
import { domain } from 'Configs/utils';
import LoraBread from 'Commons/breadcrumb/index';
const { Content } = Layout;
import { queryNode, nodeDebug } from 'Api/node';

class NodeDebug extends React.Component {

	state = {
		breads: [
			{
				href: 'dashboard',
				text: '首页',
			},
			{
				href: '/user/projects',
				text: '项目管理',
			},
			{
				href: '/user/project/detail',
				text: sessionStorage.getItem('project_name'),
			},
			{
				href: '/user/project/devices',
				text: '设备管理'
			},
			{
				href: '/user/node/detail',
				text: sessionStorage.getItem('devEui')
			},
			{
				href: '/user/node/debug',
				text: '节点调试'
			}
		],
		node: { id: sessionStorage.getItem('node') },
		clazz: 'CLASS_A',
		data: {
			id: sessionStorage.getItem('node'),
			hexData: false,
			data: null,
			auto: false,
			priority: false,
			modeEnum: 'DEFAULT_MODE',
			clazz: 'CLASS_A',
		},
		auto: false,
		list: [],
		type: 'A',
		socket: null,
	}

	componentDidMount() {
		queryNode(this.props.history, this.state.node)
			.then((res)=> {
				if (!!res) {
					let data = {...this.state.data};
					this.setState({ data, node: {...res}, clazz: res.clazz, joinType: res.joinType,
						breads: [
							{
								href: 'dashboard',
								text: '首页',
							},
							{
								href: '/user/projects',
								text: '项目管理',
							},
							{
								href: '/user/project/detail',
								text: res.projectName,
							},
							{
								href: '/user/project/devices',
								text: '设备管理'
							},
							{
								href: '/user/node/detail',
								text: res.devEui
							},
							{
								href: '/user/node/debug',
								text: '节点调试'
							}
						]
					});
				}
			});
		sessionStorage.setItem('debug_close', 'on');
		let url = domain.replace('http', 'ws') + 'api/v1/websocket/lorawan/downlink?Authorization=' + sessionStorage.getItem('token');
		this.createWebSocket(url);
	}

	componentWillUnmount() {
		sessionStorage.setItem('debug_close', 'close');
		this.state.socket.close();
	}

	handleTab =(type)=> {
		let data = {
			id: sessionStorage.getItem('node'),
			hexData: false,
			data: null,
			auto: false,
			priority: false,
			modeEnum: 'DEFAULT_MODE',
			clazz: 'CLASS_'+type,
		};
		this.props.form.resetFields();
		this.setState({ type, data, list: [] });
	}

	createWebSocket =(url)=> {
		let socket ;
		let target = this.state.node.id;
		try {
			if ('WebSocket' in window) {
				socket = new WebSocket(url);
			} else if ('MozWebSocket' in window) {
				socket = new MozWebSocket(url);
			} else {
				socket = new SockJS(url);
			}
			socket.onopen = () => {
				console.log('on open', new Date());
			}
			socket.onmessage = (e) => {
				let data = JSON.parse(e.data);
				if (!!data && target === data.target) {
					if (data.code === 4 && data.data.fcnt !== -1) {
						//上行数据！查看是否有自动发送，有的话，开始自动回复
						if (this.state.auto) {
							this.toSubmit(true, data);
						}
					}
					if (data.code === 11) {
						let key = new Date();
						notification['error']({
							key: key,
							message: '下发消息字符串过长',
							duration: null,
						});
					}
					this.pushList(data);
				}
			}
			socket.onclose = (e) => {
				if (sessionStorage.getItem('debug_close')==='close'||e.code===1008) {
					console.log('truly close')
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

	handleChange = (key, e)=> {
		let data = this.state.data;
		data[key] = e.target.value;
		this.setState({ data });
	}

	handleCheck =(e)=> {
		this.setState({ auto: e.target.checked });
	}

	pushList =(data, wait)=> {
		let list = this.state.list;
		if (wait==='true') {
			if (this.state.type != 'C') {
				list.push({
					code: 6,
					data: '调试等待',
					target: new Date(),
					serverTime: new Date().toJSON(),
				});
			}
		} else {
			list.push(data);
		}
		this.setState({ list });
		$('.debug-box').scrollTop($('.debug-box')[0].scrollHeight);
	}

	toClear =()=> {
		this.setState({ list: [] });
	}

	toCancel =()=> {
		this.setState({ auto: false });
		this.props.form.setFieldsValue({auto: false});
	}

	toSubmit =(a, data)=> {
		this.props.form.validateFields((err, values)=> {
			if (!err) {
				let req = {...this.state.data, ...values};
				delete req.auto;
				nodeDebug(this.props.history, req)
					.then((res)=> {
						if (!!res) {
							if (!a) {
                                message.success('已提交！');
							}
							this.pushList(data, 'true');
						}else{
							message.error('提交失败')
						}
					});
			}
		});
	}

	handleText =(e)=> {
		let data = this.state.data;
		data.data = e.target.value;
		this.setState({ data });
	}

	render() {
		const option = [
			{label: '字符串', value: false},
			{label: '16进制', value: true},
		];
		const clazz = this.state.clazz;
		const data = this.state.data;
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 4},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 20},
			},
		};
		const type = this.state.type;
		return (
			<Content>
				<div className="detail-bread">
					<LoraBread history={this.props.history} breads={this.state.breads}/>
					<div className="title">
						{this.state.node.devEui||sessionStorage.getItem('devEui')}
						<Tag color="blue">{sessionStorage.getItem('project_name')}</Tag>
					</div>
				</div>
				<div className="content-detail">
					<div className="dashboard">
						<Form ref="form">
							<Tabs activeKey={type} onChange={this.handleTab}>
								<Tabs.TabPane tab="CLASS A" key="A">
								</Tabs.TabPane>
								{
									clazz === 'CLASS_B'?
										<Tabs.TabPane tab="CLASS B" key="B">
										</Tabs.TabPane>
										:
										null
								}
								{
									clazz === 'CLASS_C'?
										<Tabs.TabPane tab="CLASS C" key="C">
										</Tabs.TabPane>
										:
										null
								}
							</Tabs>
							<div className="content-detail">
								<Form.Item label="节点调试" {...formItemLayout}>
									{getFieldDecorator('hexData', {
										initialValue: data.hexData,
									})(
										<Radio.Group options={option}/>
									)}
								</Form.Item>
								<Form.Item label="下行窗口" {...formItemLayout}>
									{getFieldDecorator('modeEnum', {
										initialValue: data.modeEnum,
									})(
										<Radio.Group>
											<Radio value="DEFAULT_MODE">auto</Radio>
											<Radio value="RX1_MODE">RX1</Radio>
											<Radio value="RX2_MODE">RX2</Radio>
										</Radio.Group>
									)}
								</Form.Item>
								<Form.Item {...formItemLayout} style={{ marginLeft: 160 }}>
									{getFieldDecorator('data', {
										rules: [
											{
												validator: (rule, value, callback) => {
													if (!!value) {
														let str = value.replace(/\s/g, '');
														if (!!str) {
															callback();
														} else {
															callback(new Error('请输入调试内容！'));
														}
													} else {
														callback(new Error('请输入调试内容！'));
													}
												}
											}
										],
									})(
										<Input.TextArea
											disabled={this.state.auto}
											onChange={this.handleText}
											style={{ width: 468, height: 88, background:'rgba(245,245,245,1)'}}
											placeholder="请输入调试内容"	/>
									)}
								</Form.Item>
								{
									type === 'A'?
										<Row className="debug">
											<Col span="8">
												<Form.Item style={{ marginLeft: 160 }}>
													{getFieldDecorator('auto', {
														valuePropName: 'checked',
														value: this.state.auto,
													})(
														<Checkbox
															disabled={!this.state.data.data||!this.state.data.data.replace(/\s/g, '')}
																  onChange={this.handleCheck}>
															自动回复
														</Checkbox>
													)}
												</Form.Item>

											</Col>
											<Col span="12">
												<Form.Item>
													{getFieldDecorator('priority', {
														initialValue: data.priority,
													})(
														<Checkbox>
															优先
														</Checkbox>
													)}
												</Form.Item>
											</Col>

										</Row>
										:
										null
								}
								<Form.Item style={{ marginLeft: 160 }}>
									{
										this.state.auto?
											<Button onClick={this.toCancel}>取消</Button>
											:
											<Button type="primary"
													disabled={this.state.auto}
													onClick={this.toSubmit.bind(this, false, undefined)}>
												提交
											</Button>
									}
								</Form.Item>
								<Modal ref="toSubmit"
									   visible={this.state.toSubmit}
									   title="组播-选择网关"
									   width={600}
									   onCancel={this.handleCancel}
									   onOk={this.handleSubmit}>
									<div className="node-title clearfix">
										<h3>未选</h3>
										<h3>已选</h3>
									</div>
									<div>
										<Transfer
											dataSource={this.state.classDebug}
											showSearch
											listStyle={{
												height: 300,
											}}
											operations={['指派', '取消']}
											targetKeys={this.state.targetKeys}
											render={item => `${item.title}`}
											onChange={this.handleChange}
											searchPlaceholder={'请输入'}
										/>
									</div>
								</Modal>
								<Form.Item {...formItemLayout} label="调试数据如下">
									<Button type="primary" onClick={this.toClear} style={{ float: 'right' }}>
										清除
									</Button>
								</Form.Item>
								<Form.Item>
									<div className="debug-box" style={{ marginLeft: 160 }}>
										{
											this.state.list.map((l, index)=> {
												console.log(l,'list')
												let title = l.serverTime+ ': ';
												let content = l.code===6?l.data:JSON.stringify(l.data);
												let className = l.code===4?'up':'down';
												return (
													<div className="item" key={l.target+index}>
														<span className="title">{title}</span>
														<span className={className}>
															{content}
														</span>
													</div>
												)
											})
										}
									</div>
								</Form.Item>
							</div>
						</Form>
					</div>
				</div>
			</Content>
		)
	}
}

export default Form.create()(NodeDebug);