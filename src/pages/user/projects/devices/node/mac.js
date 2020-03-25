/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout, Tag, Button, Row, Col, Icon, Modal, Select, Form, Input, InputNumber, Switch, message } from 'antd';
import $ from 'jquery';
import { domain } from 'Configs/utils';
import LoraBread from 'Commons/breadcrumb/index';

import { getChannels, batchEnableChannels, sendMacs } from 'Api/node';
const { Content } = Layout;


export default class Mac extends React.Component {

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
                href: '/user/node/demand',
                text: 'MAC命令'
            },
        ],
        commands: {
        	'3': {
				cid: { value: 3 }, dataRate: null, chMask: null, chMaskCntl: null, nbTrans: null, txPower: null,
			},
        	'4': {
				cid: { value: 4	}, maxDutyCycle: null,
			},
        	'5': {
				cid: { value: 5 }, rx1DROffset: null, rx2DataRate: null, frequency: null,
			},
			'6': { cid: { value: 6 } },
			'7': {
				cid: { value: 7 }, chIndex: null, maxDR: null, minDR: null, frequency: null,
			},
			'8': {
				cid: { value: 8 }, delay: null,
			},
			'9': {
				cid: { value: 9 }, downlinkDwellTime: true, uplinkDwellTime: true, maxEIRP: null,
			},
			'A': {
				cid: { value: 10 }, chIndex: null, frequency: null,
			},
		},
        types: [
            {
                name: '0x03 LinkADDReq',
                value: '3',
            },
            {
                name: '0x04 DutyCycleReq',
                value: '4',
            },
            {
                name: '0x05 RXParamSetupReq',
                value: '5',
            },
            {
                name: '0x06 DevStatusReq',
                value: '6',
            },
            {
                name: '0x07 NewChannelReq',
                value: '7',
            },
            {
                name: '0x08 RXTimingSetupReq',
                value: '8',
            },
            {
                name: '0x09 TxParamSetupReq',
                value: '9',
            },
            {
                name: '0x0A DIChannelReq',
                value: 'A',
            },
        ],
        rules: {
        	cid: [{
				required: true, message: '请选择MAC指令',
			}],
			dataRate: [{
				required: true, message: '请输入dataRate',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			chMask: [{
				required: true, message: '请输入chMask',
			},{
				min: 0, max: 65535, type: 'number', message: '范围0-65535',
			}],
			chMaskCntl: [{
				required: true, message: '请输入chMaskCntl',
			},{
				min: 0, max: 7, type: 'number', message: '范围0-7',
			}],
			nbTrans: [{
				required: true, message: '请输入nbTrans',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			txPower: [{
				required: true, message: '请输入txPower',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			maxDutyCycle: [{
				required: true, message: '请输入maxDutyCycle',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			rx1DROffset: [{
				required: true, message: '请输入rx1DROffset',
			},{
				min: 0, max: 7, type: 'number', message: '范围0-7',
			}],
			rx2DataRate: [{
				required: true, message: '请输入rx1DROffset',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			chIndex: [{
				required: true, message: '请输入chIndex',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			frequency: [{
				required: true, message: '请输入frequency',
			},{
				min: 100000000, max: 999900000, type: 'number', message: '范围100000000-999900000',
			},{
        		validator: (rule, value, callback)=>{
        			if (!!value) {
        				let v = /^\d{4}0{5}$/.test(String(value));
        				if (v) {
        					callback();
						} else {
        					callback('不能被100000整除');
						}
					} else {
        				callback();
					}
				}
			}],
			maxDR: [{
				required: true, message: '请输入maxDR',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			minDR: [{
				required: true, message: '请输入minDR',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			delay: [{
				required: true, message: '请输入delay',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			maxEIRP: [{
				required: true, message: '请输入maxEIRP',
			},{
				min: 0, max: 15, type: 'number', message: '范围0-15',
			}],
			downlinkDwellTime: [{
				message: '请选择downlinkDwellTime', type: 'boolean'
			}],
			uplinkDwellTime: [{
				message: '请选择uplinkDwellTime', type: 'boolean'
			}],
		},
        placeholders: {
			dataRate: '0-15',
			chMask: '0-65535',
			chMaskCntl: '0-7',
			nbTrans: '0-15',
			txPower: '0-15',
			maxDutyCycle: '0-15',
			rx1DROffset: '0-7',
			rx2DataRate: '0-15',
			frequency: '100000000-999900000',
			chIndex: '0-15',
			maxDR: '0-15',
			minDR: '0-15',
			delay: '0-15',
			maxEIRP: '0-15',
		},
        items: [],
		item: {},
		list: [],
    }

    componentDidMount() {
		sessionStorage.setItem('mac_close', 'on');
		let url = domain.replace('http', 'ws') + 'api/v1/websocket/lorawan/command?Authorization=' + sessionStorage.getItem('token');
		this.createWebSocket(url);
	}

	componentWillUnmount() {
		sessionStorage.setItem('mac_close', 'close');
		this.state.socket.close();
	}

    toAdd =()=> {
    	let items = this.state.items;
    	items.push({ cid: undefined, command: {}});
    	this.setState({ items });
	}

	toClear =()=> {
    	this.setState({ list: [] });
	}

	handleChange =(index, item, value)=> {
    	let items = this.state.items;
    	item.command = {...item.command, ...value};
    	items[index] = item;
    	this.setState({ items });
	}

	handleDelete =(index)=> {
    	let items = this.state.items;
    	items.splice(index, 1);
    	this.setState({ items });
	}

	toSend =(index)=> {
		let item = this.state.items[index];
    	this.refs['form'+index].validateFields((err, values)=> {
    		if (!err) {
    			if (item.cid === '9') {
    				values.downlinkDwellTime = values.downlinkDwellTime===undefined?true:values.downlinkDwellTime;
    				values.uplinkDwellTime = values.uplinkDwellTime===undefined?true:values.uplinkDwellTime;
				}
    			let req = {
    				devEui: sessionStorage.getItem('devEui'),
					commands: [{...values, cid: item.cid}],
				};
    			this.handleSend(req);
			}
		})
	}

	toBatchSend =()=> {
    	let commands = [];
    	let validate = true;
    	let items = this.state.items;
    	for (let i=0; i<items.length; i++) {
			this.refs['form'+i].validateFields((err, values)=> {
				if (!err) {
					values.cid = items[i].cid;
					if (values.cid === '9') {
						values.downlinkDwellTime = values.downlinkDwellTime===undefined?true:values.downlinkDwellTime;
						values.uplinkDwellTime = values.uplinkDwellTime===undefined?true:values.uplinkDwellTime;
					}
					commands.push(values);
				} else {
					validate = false;
				}
			});
			if (!validate) {
				break;
			}
		}
		if (validate) {
    		let req = {
    			devEui: sessionStorage.getItem('devEui'),
				commands
			};
    		this.handleSend(req);
		}
	}

	handleSend =(req)=> {
    	Modal.confirm({
			title: '确定要下发吗？',
			onOk: ()=> {
				sendMacs(this.props.history, req)
					.then((res)=> {
						if (!!res) {
							message.success('已下发！');
                            this.pushList(undefined, 'true');
						}else{
                            message.error('下发失败！')
						}
					})
			}
		})
	}

    getForm =(type, index, item)=> {
		let command = item.command;
		let keys = Object.keys(command);
		let rules = this.state.rules;
		let placeholders = this.state.placeholders;
		switch (type) {
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case 'A':
				return (
					<Link key={'command'+index} index={index} keys={keys}
						  ref={'form'+index}
						  onChange={this.handleChange.bind(this, index, item)}
						  toDelete={this.handleDelete.bind(this, index)}
						  toSend={this.toSend.bind(this, index)}
						  command={command} rules={rules} placeholders={placeholders} />
				);
				break;
			default:
				return;
		}

    }

	handleSelect =(index, item, v)=> {
    	if (!!v) {
			item.cid = v;
			let commands = this.state.commands;
			let command = {...commands[v]};
			item.command = {...command};
			let items = this.state.items;
			items[index] = item;
			this.setState({ items });
		}
	}

	pushList =(data, wait)=> {
		let list = this.state.list;
		if (wait==='true') {
			list.push({
				code: 6,
				data: '调试等待',
				target: new Date(),
				serverTime: new Date().toJSON(),
			});
		} else {
			list.push(data);
		}
		this.setState({ list });
		$('.debug-box').scrollTop($('.debug-box')[0].scrollHeight);
	}

	createWebSocket =(url)=> {
		let socket ;
		let target = sessionStorage.getItem('node');
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
				if (!!data&& target === data.target) {
					this.pushList(data);
				}
			}
			socket.onclose = (e) => {
				if (sessionStorage.getItem('mac_close')==='close'||e.code===1008) {
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

    render() {
        const node = this.state.node;
        const items = this.state.items;
        const types = this.state.types;
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {sessionStorage.getItem('devEui')||node.devEui}
                        <Tag color="blue">{sessionStorage.getItem('project_name')}</Tag>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard mac">
						<div className="title">
							MAC命令
							<Button type="primary" onClick={this.toAdd}>添加命令行</Button>
						</div>
						<div className="list">
							{
								items.map((item, i)=> {
									return (
										<div key={item.cid+'m'+i}>
											<div className="item">
												<Select style={{ width: 250 }}
														value={item.cid}
														placeholder="请选择命令行"
														onChange={this.handleSelect.bind(this, i, item)}
												>
													{
														types.map((t)=> {
															return (
																<Select.Option key={t.value} value={t.value}>{t.name}</Select.Option>
															)
														})
													}
												</Select>
												{
													!!item.cid?
														this.getForm(item.cid, i, item)
														:null
												}
											</div>
											<div style={{background: 'rgba(232,232,232,1)', height: 1}}></div>
										</div>
									)
								})
							}
							{
								items.length < 1?
									null:
									<div style={{height: '20px', marginTop: '20px'}}>
										<Button style={{float: 'right'}} onClick={this.toBatchSend}>
											全部下发
										</Button>
									</div>
							}
						</div>
						<div className="">
							调试数据如下:
							<Button type="primary" style={{ float: 'right' }}
									onClick={this.toClear}>清除</Button>
						</div>
						<Form style={{ marginTop: 20 }}>
							<Form.Item>
								<div className="debug-box" style={{ marginLeft: 100 }}>
									{
										this.state.list.map((l, index)=> {
											let title = l.serverTime+ ': ';
											let content = l.code===9?l.data:JSON.stringify(l.data);
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
						</Form>
                    </div>
                </div>
            </Content>
        )
    }
}

const Link = Form.create({
	onFieldsChange(props, changedFields) {
		props.onChange(changedFields);
	},
	mapPropsToFields(props) {
		let data = {};
		if (props.keys.length > 1) {
			props.keys.map((k)=> {
				if (k !== 'cid') {
					data[k] = Form.createFormField({
						...props.command[k]
					});
				}
			})
		}
		return data;
	},
})((props)=> {
	const {getFieldDecorator} = props.form;
	const keys = props.keys;
	const rules = props.rules;
	const placeholders = props.placeholders;
	return (
		<Form layout="inline">
			{
				keys.map((k, i)=> {
					if (k === 'downlinkDwellTime' || k === 'uplinkDwellTime') {
						return (
							<Form.Item label={k} key={k+'3'+i}>
								{
									getFieldDecorator(k, {
										rules: rules[k]
									})(
										<Switch checkedChildren="true"
												defaultChecked={true}
												unCheckedChildren="false" />
									)
								}
							</Form.Item>
						)
					} else {
						if (k !== 'cid') {
							return (
								<Form.Item label={k} key={k+'3'+i}>
									{
										getFieldDecorator(k, {
											rules: rules[k]
										})(
											<InputNumber placeholder={placeholders[k]}/>
										)
									}
								</Form.Item>
							)
						}
					}
				})
			}
			{
				<Form.Item>
					<div className="action-mac" style={{lineHeight:'39px'}}>
						<a href="javascript:;" onClick={props.toSend}>下发</a>
						<a href="javascript:;" onClick={props.toDelete}>删除</a>
					</div>
				</Form.Item>
			}
		</Form>
	)
})
