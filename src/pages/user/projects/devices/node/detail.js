/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout, Tag, Button, Row, Col, Radio, Form, Input, Select, Modal, InputNumber, Switch, message } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import { getCode } from 'Configs/utils';

import { queryNode, editNode, getBands } from 'Api/node';
const { Content } = Layout;


export default class NodeDetail extends React.Component {

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
			}
		],
		node: {
			id: sessionStorage.getItem('node'),
			uplinkUserTotalData: 0,
			downlinkUserTotalData: 0,
			uplinkTotalTOA: 0,
			downlinkTotalTOA: 0,
			uplinkTotalEmptyData: 0,
			downlinkTotalEmptyData: 0,
		},
		edit: false,
		type: null,
		bands: [],
	}

	componentDidMount() {
		queryNode(this.props.history, this.state.node)
			.then((res)=> {
				if (!!res) {
					this.setState({ node: {...res}, origin: {...res}, type: res.joinType,
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
							}
						]
					});
				}
			});
		getBands(this.props.history)
			.then((res)=> {
				if (!!res) {
					this.setState({ bands: res });
				}
			})
	}

	toEdit =()=> {
		this.setState({
			edit: true,
		});
	}

	toCancel =()=> {
		this.setState({
			edit: false,
			node: {...this.state.origin},
		});
	}

	toSub =()=> {
		let node = this.state.node;
		if (this.state.type === 'OTAA') {
			this.refs.otaa.validateFields((err, data)=> {
				if (!err) {
					let req = {
						id: node.id,
						bandId: node.bandId,
						devEui: node.devEui,
						...data
					};
					editNode(this.props.history, req)
						.then((res)=> {
							if (!!res) {
                                message.success('已修改！');
                                this.setState({
                                    edit: false,
                                    node: {...node, ...res}
                                })
							}else{
								message.error('修改失败')
							}
						});
				}
			})
		} else {
			this.refs.abp.validateFields((err, data)=> {
				if (!err) {
					let req = {
						id: node.id,
						bandId: node.bandId,
						devEui: node.devEui,
						...data
					};
					editNode(this.props.history, req)
						.then((res)=> {
							if (!!res) {
								message.success('已修改！');
                                this.setState({
                                    edit: false,
                                    node: {...node, ...res}
                                })
							}else{
								message.error('修改失败')
							}
						});
				}
			})
		}

	}

	getProperNum =(n)=> {
		if (n < 1024) {
			return [n, 'B'];
		} else if ( n < 1000*1024) {
			return [(n/1024).toFixed(1), 'KB'];
		} else if ( n < 1000*1048576) {
			return [(n/1048576).toFixed(1), 'MB'];
		} else if ( n < 1000*1073741824) {
			return [(n/1073741824).toFixed(1), 'GB'];
		} else {
			return [(n/(1073741824*1024)).toFixed(1), 'TB'];
		}
	}

	render() {
		let node = this.state.node;
		let upEm = this.getProperNum(node.uplinkTotalEmptyData);
		let downEm = this.getProperNum(node.downlinkTotalEmptyData);
		let upTo = this.getProperNum(node.uplinkUserTotalData);
		let downTo = this.getProperNum(node.downlinkUserTotalData);
		return (
			<Content>
				<div className="detail-bread">
					<LoraBread history={this.props.history} breads={this.state.breads}/>
					<div className="title">
						{node.devEui||sessionStorage.getItem('devEui')}
						<Tag color="blue">{node.projectName}</Tag>
					</div>
					{
						this.state.edit?
							null
							:
							<div className="button">
								<Button type="primary" onClick={this.toEdit}>编辑</Button>
							</div>
					}
				</div>
				<Modal ref="toEditOTAA"
					   centered
					   visible={this.state.edit && this.state.type === 'OTAA'}
					   title="编辑OTAA节点"
					   maskClosable={false}
					   width={800}
					   onCancel={this.toCancel}
					   onOk={this.toSub}
				>
					<OTAA ref="otaa" node={this.state.node} bands={this.state.bands} key={new Date()}/>
				</Modal>
				<Modal ref="toEditABP"
					   centered
					   visible={this.state.edit && this.state.type === 'ABP'}
					   title="编辑ABP节点"
					   maskClosable={false}
					   width={800}
					   onCancel={this.toCancel}
					   onOk={this.toSub}
				>
					<ABP ref="abp" node={this.state.node} bands={this.state.bands} key={new Date()}/>
				</Modal>
				<div className="content-detail gatewayDetail">
					<Row gutter={24}>
						<Col className="gutter-row" span={8}>
							<div className="gutter-box dashboard flexBox">
								<div className="text">
									<p>空口数据总量(上行/下行)</p>
									<h3>{upEm[0]}<sub>{upEm[1]}</sub>
									/{downEm[0]}<sub>{downEm[1]}</sub></h3>
								</div>
							</div>
						</Col>
						<Col className="gutter-row" span={8}>
							<div className="gutter-box dashboard flexBox">
								<div className="text">
									<p>用户数据总量(上行/下行)</p>
									<h3>{upTo[0]}<sub>{upTo[1]}</sub>
										/{downTo[0]}<sub>{downTo[1]}</sub></h3>
								</div>
							</div>
						</Col>
						<Col className="gutter-row" span={8}>
							<div className="gutter-box dashboard flexBox">
								<div className="text">
									<p>总TOA占用时间(上行/下行)</p>
									<h3>{node.uplinkTotalTOA.toFixed(2)}<sub>h</sub>/
										{node.downlinkTotalTOA.toFixed(2)}<sub>h</sub></h3>
								</div>
							</div>
						</Col>
					</Row>
					<div className="dashboard detail">
						<div className="item">
							<h2 className="title">基本属性</h2>
							<ul className="clearfix">
								<li style={{width: '100%'}}>
									<span className="name">DevAddr：</span>
									<span className="con">{node.devAddr}</span>
								</li>
								<li className="small" style={{width: '50%'}}>
									<span className="name">NwkSKey：</span>
									<span className="con">{node.nwksKey}</span>
								</li>
								<li style={{width: '50%'}}>
									<span className="name">APPSkey：</span>
									<span className="con">{node.appsKey}</span>
								</li>
								{
									node.joinType !== 'OTAA'?
										null
										:
										<div>
											<li style={{width: '50%'}}>
												<span className="name">AppKey：</span>
												<span className="con">{node.appKey}</span>
											</li>
											<li style={{width: '50%'}}>
												<span className="name">AppEui：</span>
												<span className="con">{node.appEui}</span>
											</li>
										</div>
								}
								<li>
									<span className="name">Device Eui：</span>
									<span className="con">{node.devEui}</span>
								</li>
								<li>
									<span className="name">cls类型：</span>
									<span className="con">{node.clazz}</span>
								</li>
								<li>
									<span className="name">设备类型：</span>
									<span className="con">{node.joinType}</span>
								</li>
								<li>
									<span className="name">lwan版本：</span>
									<span className="con">{node.lorawanVersion}</span>
								</li>
								<li>
									<span className="name">fcntBits：</span>
									<span className="con">{node.fcntBits}</span>
								</li>
								<li>
									<span className="name">上行数据保留条数：</span>
									<span className="con">{node.nodeUpLinkRetain}</span>
								</li>
								<li>
									<span className="name">下行数据保留条数：</span>
									<span className="con">{node.nodeDownLinkRetain}</span>
								</li>
								<li>
									<span className="name">ADR：</span>
									<span className="con">{String(node.adrEnable)}</span>
								</li>
								<li>
									<span className="name">频段名称：</span>
									<span className="con">{node.bandName}</span>
								</li>
								<li>
									<span className="name">ADR Ack Limit：</span>
									<span className="con">{node.adrAckLimit}</span>
								</li>
								<li>
									<span className="name">Frame Count(Up)： </span>
									<span className="con">{node.fcntUp}</span>
								</li>
								<li>
									<span className="name">Frame Count(Down)：</span>
									<span className="con">{node.fcntDown}</span>
								</li>
								<li>
									<span className="name">Join Accept Delay1(ms)：</span>
									<span className="con">{node.joinAcceptDelay1}</span>
								</li>
								<li>
									<span className="name">Join Accept Delay2(ms)：</span>
									<span className="con">{node.joinAcceptDelay2}</span>
								</li>
								<li>
									<span className="name">Max Duty Cycle：</span>
									<span className="con">{node.maxDutyCycle}</span>
								</li>
								<li>
									<span className="name">Max Frame Count Gap：</span>
									<span className="con">{node.maxFCntGap}</span>
								</li>
								<li>
									<span className="name">Receive Delay1 (ms)：</span>
									<span className="con">{node.receiveDelay1}</span>
								</li>
								<li>
									<span className="name">Receive Delay2 (ms)：</span>
									<span className="con">{node.receiveDelay2}</span>
								</li>
								<li>
									<span className="name">RX1 Datarate Offset：</span>
									<span className="con">{node.rx1DROffset}</span>
								</li>
								<li>
									<span className="name">RX2 Frequency(Hz)：</span>
									<span className="con">{node.rx2Freq}</span>
								</li>
								<li>
									<span className="name">RX2 Datarate：</span>
									<span className="con">{node.rx2DR}</span>
								</li>
								<li>
									<span className="name">group：</span>
									<span className="con">{node.group}</span>
								</li>
								<li>
									<span className="name">创建时间：</span>
									<span className="con">{node.createdDate}</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</Content>
		)
	}
}


const OTAA = Form.create({
	mapPropsToFields(props) {
		return {
			adrEnable: Form.createFormField({
				...props.node.adrEnable,
				value: props.node.adrEnable,
			}),
			modeEnum: Form.createFormField({
				...props.node.modeEnum,
				value: props.node.modeEnum,
			}),
			appsKey: Form.createFormField({
				...props.node.appsKey,
				value: props.node.appsKey,
			}),
			nwksKey: Form.createFormField({
				...props.node.nwksKey,
				value: props.node.nwksKey,
			}),
			clazz: Form.createFormField({
				...props.node.clazz,
				value: props.node.clazz,
			}),
			appKey: Form.createFormField({
				...props.node.appKey,
				value: props.node.appKey,
			}),
			appEui: Form.createFormField({
				...props.node.appEui,
				value: props.node.appEui,
			}),
			bandId: Form.createFormField({
				...props.node.bandId,
				value: props.node.bandId,
			}),
			nodeUpLinkRetain: Form.createFormField({
				...props.node.nodeUpLinkRetain,
				value: props.node.nodeUpLinkRetain,
			}),
			nodeDownLinkRetain: Form.createFormField({
				...props.node.nodeDownLinkRetain,
				value: props.node.nodeDownLinkRetain,
			}),
			group: Form.createFormField({
				...props.node.group,
				value: props.node.group,
			}),
		};
	},
})((props) => {
	const handleChange = (key, num) => {
		let data = {};
		data[key] = getCode(num);
		props.form.setFieldsValue({
			...data
		});
	}
	const { getFieldDecorator } = props.form;
	const layout = {
		labelCol: {
			xs: {span: 20},
			sm: {span: 6},
		},
		wrapperCol: {
			xs: {span: 12},
			sm: {span: 18},
		}
	};
	const bands = props.bands;
	return (
		<Form>
			<Form.Item label="adr是否开启" {...layout}>
				{
					getFieldDecorator('adrEnable', {
						rules: [{
							required: true, message: '请选择adr是否开启！',
						}],
						valuePropName: 'checked'
					},)(
						<Switch />
					)
				}
			</Form.Item>
			<Form.Item label="下行窗口" {...layout}>
				{
					getFieldDecorator('modeEnum', {
						rules: [{
							required: true, message: '请选择下行窗口！',
						}]
					},)(
						<Radio.Group>
							<Radio value="DEFAULT_MODE">auto</Radio>
							<Radio value="RX1_MODE">RX1</Radio>
							<Radio value="RX2_MODE">RX2</Radio>
						</Radio.Group>
					)
				}
			</Form.Item>
			<Form.Item label="nwkSKey" {...layout}>
				<Row gutter={8}>
					<Col span={20}>
						{
							getFieldDecorator('nwksKey', {
								rules: [ {
									pattern: /^[0-9a-fA-F]{32}$/, message: '请输入长度为32的十六进制值！'
								}]
							})(
								<Input placeholder={'请输入nwksKey'}/>
							)
						}
					</Col>
					<Col span={4}>
						<Button onClick={handleChange.bind(this, 'nwksKey', 32)}>换一换</Button>
					</Col>
				</Row>
			</Form.Item>
			<Form.Item label="appsKey" {...layout}>
				<Row gutter={8}>
					<Col span={20}>
						{
							getFieldDecorator('appsKey', {
								rules: [{
									pattern: /^[0-9a-fA-F]{32}$/, message: '请输入长度为32的十六进制值！'
								}],
							})(
								<Input placeholder={'请输入appsKey'}/>
							)
						}
					</Col>
					<Col span={4}>
						<Button onClick={handleChange.bind(this, 'appsKey', 32)}>换一换</Button>
					</Col>
				</Row>
			</Form.Item>
			<Form.Item label="appEui" {...layout}>
				<Row gutter={8}>
					<Col span={20}>
						{
							getFieldDecorator('appEui', {
								rules: [ {
									required: true, pattern: /^[0-9a-fA-F]{16}$/, message: '请输入长度为16的十六进制值！'
								}]
							})(
								<Input placeholder={'请输入appEui!'}/>
							)
						}
					</Col>
					<Col span={4}>
						<Button onClick={handleChange.bind(this, 'appEui', 16)}>换一换</Button>
					</Col>
				</Row>
			</Form.Item>
			<Form.Item label="appKey" {...layout}>
				<Row gutter={8}>
					<Col span={20}>
						{
							getFieldDecorator('appKey', {
								rules: [{
									required: true, message: '请输入appKey!'
								}, {
									pattern: /^[0-9a-fA-F]{32}$/, message: '请输入长度为32的十六进制值!'
								}],
							})(
								<Input placeholder="请输入appKey"/>
							)
						}
					</Col>
					<Col span={4}>
						<Button onClick={handleChange.bind(this, 'appKey', 32)}>换一换</Button>
					</Col>
				</Row>
			</Form.Item>
			<Form.Item label="cls类型" {...layout}>
				{
					getFieldDecorator('clazz', {
						rules: [{
							required: true, message: '请选择cls类型！'
						}]
					})(
						<Select placeholder="请选择cls类型">
							<Select.Option value="CLASS_A">CLASS_A</Select.Option>
							<Select.Option value="CLASS_B">CLASS_B</Select.Option>
							<Select.Option value="CLASS_C">CLASS_C</Select.Option>
						</Select>
					)
				}
			</Form.Item>
			<Form.Item label="频段规范" {...layout}>
				{
					getFieldDecorator('bandId', {
						rules: [{
							required: true, message: '请选择频段规范！'
						}]
					})(
						<Select placeholder="请选择频段规范">
							{
								bands.map((b, i)=> {
									return (
										<Select.Option key={i} value={b.id}>{b.name}</Select.Option>
									)
								})
							}
						</Select>
					)
				}
			</Form.Item>
			<Form.Item label="节点上行保留条数" {...layout}>
				{
					getFieldDecorator('nodeUpLinkRetain', {
						rules: [{
							required: true, min: 1, max: 1000,
							type: 'number', message: '请输入1-1000的节点上行保留条数！',
						}],
					})(
						<InputNumber placeholder="请输入节点上行保留条数"/>
					)
				}
			</Form.Item>
			<Form.Item label="节点下行保留条数" {...layout}>
				{
					getFieldDecorator('nodeDownLinkRetain', {
						rules: [{
							required: true, message: '请输入1-1000的节点下行保留条数！',
							min: 1, max: 1000, type: 'number',
						}],
					})(
						<InputNumber placeholder="请输入节点下行保留条数"/>
					)
				}
			</Form.Item>
			<Form.Item label="group" {...layout}>
				{
					getFieldDecorator('group')(
						<Input placeholder="请输入group"/>
					)
				}
			</Form.Item>
		</Form>
	);
});

const ABP = Form.create({
	mapPropsToFields(props) {
		return {
			adrEnable: Form.createFormField({
				...props.node.adrEnable,
				value: props.node.adrEnable,
			}),
			modeEnum: Form.createFormField({
				...props.node.modeEnum,
				value: props.node.modeEnum,
			}),
			appsKey: Form.createFormField({
				...props.node.appsKey,
				value: props.node.appsKey,
			}),
			nwksKey: Form.createFormField({
				...props.node.nwksKey,
				value: props.node.nwksKey,
			}),
			clazz: Form.createFormField({
				...props.node.clazz,
				value: props.node.clazz,
			}),
			bandId: Form.createFormField({
				...props.node.bandId,
				value: props.node.bandId,
			}),
			nodeUpLinkRetain: Form.createFormField({
				...props.node.nodeUpLinkRetain,
				value: props.node.nodeUpLinkRetain,
			}),
			nodeDownLinkRetain: Form.createFormField({
				...props.node.nodeDownLinkRetain,
				value: props.node.nodeDownLinkRetain,
			}),
			group: Form.createFormField({
				...props.node.group,
				value: props.node.group,
			}),
		};
	},
})((props) => {
	const handleChange = (key, num) => {
		let data = {};
		data[key] = getCode(num);
		props.form.setFieldsValue({
			...data
		});
	}
	const {getFieldDecorator} = props.form;
	const layout = {
		labelCol: {
			xs: {span: 20},
			sm: {span: 6},
		},
		wrapperCol: {
			xs: {span: 12},
			sm: {span: 18},
		}
	};
	const bands = props.bands;
	return (
		<Form>
			<Form.Item label="adr是否开启" {...layout}>
				{
					getFieldDecorator('adrEnable', {
						rules: [{
							required: true, message: '请选择adr是否开启！',
						}],
						valuePropName: 'checked'
					},)(
						<Switch />
					)
				}
			</Form.Item>
			<Form.Item label="下行窗口" {...layout}>
				{
					getFieldDecorator('modeEnum', {
						rules: [{
							required: true, message: '请选择下行窗口！',
						}]
					},)(
						<Radio.Group>
							<Radio value="DEFAULT_MODE">auto</Radio>
							<Radio value="RX1_MODE">RX1</Radio>
							<Radio value="RX2_MODE">RX2</Radio>
						</Radio.Group>
					)
				}
			</Form.Item>
			<Form.Item label="appsKey" {...layout}>
				<Row gutter={8}>
					<Col span={20}>
						{
							getFieldDecorator('appsKey', {
								rules: [{
									required: true, message: '请输入appsKey！',
								},{
									pattern: /^[0-9a-fA-F]{32}$/, message: '请输入长度为32的十六进制值！'
								}],
							})(
								<Input placeholder="请输入appsKey"/>
							)
						}
					</Col>
					<Col span={4}>
						<Button onClick={handleChange.bind(this, 'appsKey', 32)}>换一换</Button>
					</Col>
				</Row>
			</Form.Item>
			<Form.Item label="nwksKey" {...layout}>
				<Row gutter={8}>
					<Col span={20}>
						{
							getFieldDecorator('nwksKey', {
								rules: [{
									required: true, message: '请输入nwksKey！',
								}, {
									pattern: /^[0-9a-fA-F]{32}$/, message: '请输入长度为32的十六进制值！'
								}],
							})(
								<Input placeholder="请输入nwksKey"/>
							)
						}
					</Col>
					<Col span={4}>
						<Button onClick={handleChange.bind(this, 'nwksKey', 32)}>换一换</Button>
					</Col>
				</Row>
			</Form.Item>
			<Form.Item label="cls类型" {...layout}>
				{
					getFieldDecorator('clazz', {
						rules: [{
							required: true, message: '请选择cls类型！'
						}]
					})(
						<Select placeholder="请选择cls类型">
							<Select.Option value="CLASS_A">CLASS_A</Select.Option>
							<Select.Option value="CLASS_B">CLASS_B</Select.Option>
							<Select.Option value="CLASS_C">CLASS_C</Select.Option>
						</Select>
					)
				}
			</Form.Item>
			<Form.Item label="频段规范" {...layout}>
				{
					getFieldDecorator('bandId', {
						rules: [{
							required: true, message: '请选择频段规范！'
						}]
					})(
						<Select>
							{
								bands.map((b, i)=> {
									return (
										<Select.Option key={i} value={b.id}>{b.name}</Select.Option>
									)
								})
							}
						</Select>
					)
				}
			</Form.Item>
			<Form.Item label="节点上行保留条数" {...layout}>
				{
					getFieldDecorator('nodeUpLinkRetain', {
						rules: [{
							required: true, type: 'number', message: '请输入1-1000的节点上行保留条数',
							min: 1, max: 1000,
						}],
					})(
						<InputNumber />
					)
				}
			</Form.Item>
			<Form.Item label="节点下行保留条数" {...layout}>
				{
					getFieldDecorator('nodeDownLinkRetain', {
						rules: [{
							required: true, min: 1, max: 1000, message: '请输入1-1000的节点下行保留条数', type: 'number',
						}],
					})(
						<InputNumber />
					)
				}
			</Form.Item>
			<Form.Item label="group" {...layout}>
				{
					getFieldDecorator('group')(
						<Input placeholder="请输入group"/>
					)
				}
			</Form.Item>
		</Form>
	);
});