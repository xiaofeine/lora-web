/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Upload, Layout, Tabs, Switch, Modal, Button, Row, Col, Form, Input, Select, Icon, message } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import BasicTable from 'Commons/table/basic';
import { getHTTPs, addHTTP, editHTTP, deleteHTTP,
    getMQTTs, addMQTT, editMQTT, deleteMQTT, } from 'Api/app';
const { Content } = Layout;


export default class Apps extends React.Component {

    toEdit = (item, type) => {
        if (type==='http') {
            this.setState({
                httpData: item,
                toEdit: true,
            });
        } else {
            this.setState({
                mqttData: item,
                toEdit: true
            });
        }
    }

    toDelete = (item) => {
        let req = {
            ids: [item.id],
        };
        this.handleDelete(null, req);
    }

	handleDelete=(values,req)=>{
		let fun = this.state.type==='http'?deleteHTTP:deleteMQTT;
		let table = this.state.type==='http'?this.refs.https:this.refs.mqtts;
		Modal.confirm({
			title: '确定要删除吗？',
			onOk: ()=> {
				if (!!values) {
					req = {
						ids: values
					};
				}
				fun(this.props.history, req)
					.then((res) => {
						if (!!res) {
							message.success('删除成功!');
							table.getData(0);
						} else {
							message.error('删除失败！');
						}
					}).catch(() => {
					console.log('catch back');
				})
			}
		})
	}

	toAdd =()=> {
		this.setState({ toAdd: true });
	}

	handleCancel =()=> {
		this.setState({ toAdd: false, add: false, toEdit: false,
		});
	}

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
                href: '/user/project/apps',
                text: '应用接口'
            }
        ],
        type: 'http',
        toAdd: false,
        toEdit: false,
        add: false,
        projectId: sessionStorage.getItem('project'),
        httpCount: 0,
        mqttCount: 0,
        httpTable: {
            id: 'http',
            rowKey: 'id',
            columns: [
                {
                    title: 'url',
                    dataIndex: 'url',
                    key: 'url',
                },
                {
                    title: '是否加密',
                    dataIndex: 'encryption',
                    key: 'encryption',
                    render: (a, item, index)=> !!item.encryption?'是':'否'
                },
                {
                    title: 'signToken',
                    dataIndex: 'signToken',
                    key: 'signToken',
                },
                {
                    title: 'secretKey',
                    dataIndex: 'secretKey',
                    key: 'secretKey',
                },
                {
                    title: '创建时间',
                    dataIndex: 'createdDate',
                    key: 'createdDate',
                },
                {
                    title: '操作',
                    dataIndex: 'id',
                    key: 'id',
                    render: (a, item, index)=> {
                        return (
                            <div className="action-list" key={item.id+'a'+index}>
                                <a href="javascript:;" onClick={this.toEdit.bind(this, item, 'http')}>编辑</a>
                                <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                },
            ],
            getData: getHTTPs,
            selectButtons: [
                {
                    text: '删除',
                    handleClick: this.handleDelete,
                }
            ],
            showButtons: true,
            buttonSettings: [
                {
                    text: '添加HTTP接口',
                    type: 'primary',
                    onClick: this.toAdd,
                },
            ],
            searchFields: 'url',
            searchPlaceholder: '请输入url',
            history: this.props.history,
            req: {
                projectId: sessionStorage.getItem('project'),
            }
        },
        mqttTable: {
            id: 'mqtt',
            rowKey: 'id',
            columns: [
                {
                    title: '主机',
                    dataIndex: 'brokerHost',
                    key: 'brokerHost',
                },
                {
                    title: '端口',
                    dataIndex: 'port',
                    key: 'port',
                },
                {
                    title: '用户名',
                    dataIndex: 'username',
                    key: 'username',
                },
                {
                    title: '密码',
                    dataIndex: 'password',
                    key: 'password',
                },
                {
                    title: '订阅主题',
                    dataIndex: 'subTopic',
                    key: 'subTopic',
                },
                {
                    title: '创建时间',
                    dataIndex: 'createdDate',
                    key: 'createdDate',
                },
                {
                    title: '操作',
                    dataIndex: 'id',
                    key: 'id',
                    render: (a, item, index)=> {
                        return (
                            <div className="action-list" key={item.id+'a'+index}>
                                <a href="javascript:;" onClick={this.toEdit.bind(this, item, 'mqtt')}>编辑</a>
                                <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                },
            ],
            getData: getMQTTs,
            selectButtons: [
                {
                    text: '删除',
                    handleClick: this.handleDelete,
                }
            ],
            showButtons: true,
            buttonSettings: [
                {
                    text: '添加MQTT接口',
                    type: 'primary',
                    onClick: this.toAdd,
                },
            ],
            searchFields: 'brokerHost',
            searchPlaceholder: '请输入主机',
            history: this.props.history,
            req: {
                projectId: sessionStorage.getItem('project'),
            }
        },
        http: {
            projectId: sessionStorage.getItem('project'),
            url: null,
        },
        httpData: {},
        mqttData: {},
    }

    handleTab =(type)=> {
        this.setState({ type });
    }

	handleHTTP =()=> {
		this.refs.http.validateFields((err, data)=> {
			if (!err) {
				let req = {
					...data, projectId: sessionStorage.getItem('project')
				};
				Modal.confirm({
					title: '确定要添加吗？',
					onOk: ()=> {
						addHTTP(this.props.history, req)
							.then((res)=> {
								if (!!res) {
                                    message.success('已添加！');
                                    this.refs.https.getData(0);
									this.setState({
										toAdd: false
									})
								} else {
                                    message.error(res.msg||'添加失败!');
								}
							})
					}
				})
			}
		})
	}

	handleEditHTTP =()=> {
		this.refs.editHttp.validateFields((err, data)=> {
			if (!err) {
				let req = {
					...data, id: this.state.httpData.id
				};
				Modal.confirm({
					title: '确定要修改吗？',
					onOk: ()=> {
						editHTTP(this.props.history, req)
							.then((res)=> {
								if (!!res) {
                                    message.success('已修改！');
                                    this.refs.https.getData(0);
									this.setState({
										toEdit: false
									})
								} else {
                                    message.error(res.msg||'修改失败!');
								}
							})
					}
				})
			}
		})
	}

	handleEditMQTT =()=> {
		this.refs.editMqtt.validateFields((err, data)=> {
			if (!err) {
				let req = {
					...data, id: this.state.mqttData.id
				};
				Modal.confirm({
					title: '确定要修改吗？',
					onOk: ()=> {
						editMQTT(this.props.history, req)
							.then((res)=> {
								if (!!res) {
									message.success('已修改！');
                                    this.refs.mqtts.getData(0);
									this.setState({
										toEdit: false
									})
								} else {
                                    message.error(res.msg||'修改失败!');
								}
							})
					}
				})
			}
		})
	}

	handleMQTT =()=> {
		this.refs.mqtt.validateFields((err, data)=> {
			if (!err) {
				let req = {
					...data, projectId: sessionStorage.getItem('project')
				};
				Modal.confirm({
					title: '确定要添加吗？',
					onOk: ()=> {
						addMQTT(this.props.history, req)
							.then((res)=> {
                                if (!!res) {
                                    message.success('已添加！');
                                    this.refs.mqtts.getData(0);
                                    this.setState({
                                        toEdit: false
                                    })
                                } else {
                                    message.error(res.msg||'添加失败!');
                                }
							})
					}
				})
			}
		})
	}

	render() {
		const type = this.state.type;
		return (
			<Content>
				<div className="detail-bread">
					<LoraBread history={this.props.history} breads={this.state.breads}/>
					<div className="title">
						{type==='http'?'HTTP':'MQTT'}
					</div>
				</div>
				<div className="content-detail">
					<div className="dashboard">
						<Tabs activeKey={type} onChange={this.handleTab}>
							<Tabs.TabPane tab="HTTP" key="http">
								<BasicTable ref="https" {...this.state.httpTable}/>
							</Tabs.TabPane>
							<Tabs.TabPane tab="MQTT" key="mqtt">
								<BasicTable ref="mqtts" {...this.state.mqttTable}/>
							</Tabs.TabPane>
						</Tabs>
					</div>
				</div>
				<Modal ref="toAdd"
					   centered
					   visible={this.state.toAdd&&this.state.type==='http'}
					   title="添加HTTP接口"
					   onOk={this.handleHTTP}
					   onCancel={this.handleCancel}>
					<div>
						<HTTP ref="http" key={new Date()}/>
					</div>
				</Modal>
				<Modal ref="toEdit"
					   centered
					   visible={this.state.toEdit&&this.state.type==='http'}
					   title="编辑HTTP接口"
					   onOk={this.handleEditHTTP}
					   onCancel={this.handleCancel}>
					<div>
						<EditHTTP ref="editHttp" {...this.state.httpData} key={new Date()}/>
					</div>
				</Modal>
				<Modal ref="toAddMQTT"
					   centered
					   visible={this.state.toAdd&&this.state.type==='mqtt'}
					   title="添加MQTT接口"
					   onOk={this.handleMQTT}
					   onCancel={this.handleCancel}>
					<div>
						<MQTT ref="mqtt" key={new Date()}/>
					</div>
				</Modal>
				<Modal ref="toEditMQTT"
					   centered
					   visible={this.state.toEdit&&this.state.type==='mqtt'}
					   title="编辑MQTT接口"
					   onOk={this.handleEditMQTT}
					   onCancel={this.handleCancel}>
					<div>
						<EditMQTT ref="editMqtt" {...this.state.mqttData} key={new Date()}/>
					</div>
				</Modal>
			</Content>
		)
	}
}

const EditMQTT = Form.create({
	mapPropsToFields(props) {
		return {
			brokerHost: Form.createFormField({
				...props.brokerHost,
				value: props.brokerHost,
			}),
			port: Form.createFormField({
				...props.port,
				value: props.port,
			}),
			username: Form.createFormField({
				...props.username,
				value: props.username,
			}),
			password: Form.createFormField({
				...props.password,
				value: props.password,
			}),
			subTopic: Form.createFormField({
				...props.subTopic,
				value: props.subTopic,
			}),
		};
	},
})((props)=>{
	const { getFieldDecorator } = props.form;
	const layout = {
		labelCol: {
			xs: { span: 16 },
			sm: { span: 5 },
		},
		wrapperCol: {
			xs: { span: 16 },
			sm: { span: 19 },
		}
	};
	return (
		<Form>
			<Form.Item label="主机" {...layout}>
				{
					getFieldDecorator('brokerHost', {
						rules: [{
							required: true, message: '请输入主机！'
						}, {
							pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/,
							message: '请输入正确的主机！'
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入主机"/>
					)
				}
			</Form.Item>
			<Form.Item label="端口" {...layout}>
				{
					getFieldDecorator('port', {
						rules: [{
							required: true, message: '请输入端口！'
						}, {
							validator: (rule, value, callback) => {
								const reg = /^\d+(\.\d+)?$/;
								if (!reg.test(value)&&!!value) {
									callback(new Error('端口号只能是数字！'));
								} else if (value && (value > 65535 || value < 1)) {
									callback('端口号范围1~65535！');
								} else {
									callback();
								}
							}
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入端口"/>
					)
				}
			</Form.Item>
			<Form.Item label="用户名" {...layout}>
				{
					getFieldDecorator('username', {
						rules: [{
							/*required: true, */message: '请输入正确的用户名！', whitespace: true,
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入用户名"/>
					)
				}
			</Form.Item>
			<Form.Item label="密码" {...layout}>
				{
					getFieldDecorator('password', {
						rules: [{
							/*required: true, */message: '请输入正确的密码！', whitespace: true,
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入密码"/>
					)
				}
			</Form.Item>
			<Form.Item label="订阅主题" {...layout}>
				{
					getFieldDecorator('subTopic', {
						rules: [{
							required: true, message: '请输入正确的订阅主题！', whitespace: true,
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入订阅主题"/>
					)
				}
			</Form.Item>
		</Form>
	);
});

const EditHTTP = Form.create({
	mapPropsToFields(props) {
		return {
			url: Form.createFormField({
				...props.url,
				value: props.url,
			}),
			encryption: Form.createFormField({
				...props.encryption,
				value: props.encryption,
			}),
		};
	},
})((props)=>{
	const { getFieldDecorator } = props.form;
	const layout = {
		labelCol: {
			xs: { span: 16 },
			sm: { span: 5 },
		},
		wrapperCol: {
			xs: { span: 16 },
			sm: { span: 19 },
		}
	};
	return (
		<Form>
			<Form.Item label="URL" {...layout}>
				{
					getFieldDecorator('url', {
						rules: [{
							required: true, message: '请输入正确的url！', type: 'url'
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入url"/>
					)
				}
			</Form.Item>
			<Form.Item label="是否加密" {...layout}>
				{
					getFieldDecorator('encryption', {
						rules: [{
							required: true, message: '请选择是否加密！', type: 'boolean'
						}],
					})(
						<Switch checkedChildren="是"
								unCheckedChildren="否"
								defaultChecked={props.encryption} />
					)
				}
			</Form.Item>
		</Form>
	);
});

const MQTT = Form.create()((props)=>{
	const { getFieldDecorator } = props.form;
	const layout = {
		labelCol: {
			xs: { span: 16 },
			sm: { span: 5 },
		},
		wrapperCol: {
			xs: { span: 16 },
			sm: { span: 19 },
		}
	};
	return (
		<Form>
			<Form.Item label="主机" {...layout}>
				{
					getFieldDecorator('brokerHost', {
						rules: [{
							required: true, message: '请输入主机！',
						}, {
							pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$ /,
							message: '请输入正确的主机'
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入主机"/>
					)
				}
			</Form.Item>
			<Form.Item label="端口" {...layout}>
				{
					getFieldDecorator('port', {
						rules: [{
							required: true, message: '请输入端口号!',
						}, {
							validator: (rule, value, callback) => {
								const reg = /^\d+(\.\d+)?$/;
								if (!reg.test(value)&&!!value) {
									callback(new Error('端口号只能是数字！'));
								} else if (value && (value > 65535 || value < 1)) {
									callback('端口号范围1~65535！');
								} else {
									callback();
								}
							}
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入端口号"/>
					)
				}
			</Form.Item>
			<Form.Item label="用户名" {...layout}>
				{
					getFieldDecorator('username', {
						rules: [{
							message: '请输入正确的用户名!', whitespace: true,
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入用户名"/>
					)
				}
			</Form.Item>
			<Form.Item label="密码" {...layout}>
				{
					getFieldDecorator('password', {
						rules: [{
							message: '请输入正确的密码！', whitespace: true,
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入密码"/>
					)
				}
			</Form.Item>
			<Form.Item label="订阅主题" {...layout}>
				{
					getFieldDecorator('subTopic', {
						rules: [{
							required: true, message: '请输入正确的订阅主题！', whitespace: true,
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入订阅主题"/>
					)
				}
			</Form.Item>
		</Form>
	);
});

const HTTP = Form.create()((props)=>{
	const { getFieldDecorator } = props.form;
	const layout = {
		labelCol: {
			xs: { span: 16 },
			sm: { span: 4 },
		},
		wrapperCol: {
			xs: { span: 16 },
			sm: { span: 20 },
		}
	};
	return (
		<Form>
			<Form.Item label="URL" {...layout}>
				{
					getFieldDecorator('url', {
						rules: [{
							required: true, message: '请输入正确的url！', type: 'url'
						}],
					})(
						<Input autocompeleted="off" placeholder="请输入url"/>
					)
				}
			</Form.Item>
		</Form>
	);
});
