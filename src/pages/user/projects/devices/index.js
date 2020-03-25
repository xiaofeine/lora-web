/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import {Upload, Layout, Tabs, Modal, Button, Row, Col, Form, Input, Select, Icon, message} from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import BasicTable from 'Commons/table/basic';
import {getCode, domain} from 'Configs/utils';
import {getNodes, deleteNode, addABP, addOTAA, batchAdd, batchEnable} from 'Api/node';
import { getGateways, deleteGateway, addGateway, batchAddGateway, getRate } from 'Api/gateway';
import { queryProject } from 'Api/project';
import $ from 'jquery';

const {Content} = Layout;


export default class Devices extends React.Component {

    toDetail = (node) => {
        sessionStorage.setItem('node', node.id);
        sessionStorage.setItem('devEui', node.devEui);
        this.props.history.push('/user/node/detail', {state: node});
    }

    toGateDetail = ( gateway ) => {
        sessionStorage.setItem('gateway', gateway.id);
        sessionStorage.setItem('gatewayEui', gateway.gatewayEui);
        this.props.history.push('/user/gateway/detail', {data: gateway});
    }

	toEnable =(enable, item)=> {
		let req = {
			ids: [ item.id ],
			enable
		};
		this.handleEnable(enable, null, req);
	}

	handleEnable =(enable, values, req)=> {
		if (!!values) {
			req = {
				ids: values,
				enable
			};
		}
		let title = enable?'启用':'禁用';
		Modal.confirm({
			title: '确定要'+title+'吗？',
			onOk: ()=> {
				batchEnable(this.props.history, req)
					.then((res)=> {
						if (!!res) {
							message.success('已'+title+'！');
						} else {
							message.error( '操作失败！');
						}
					})
			}
		})
	}

	toDelete = (item) => {
		let req = {
			ids: [item.id],
		};

		this.handleDelete(null, req);
	}

	handleDelete=(values,req)=>{
		Modal.confirm({
			title: '确定要删除吗？',
			onOk: ()=> {
				if (!!values) {
					req = {
						ids: values
					};
				}
				deleteNode(this.props.history, req)
					.then((res) => {
						if (!!res) {
							message.success('已删除！');
							this.refs.nodes.getData(0);
						} else {
							message.error('删除失败！');
						}
					}).catch(() => {
					console.log('catch back');
				})
			}
		})
	}

    //deleteGateway

    toDeleteGateway = (item) => {
        let req = {
            ids: [item.id],
        };
        this.handleDeleteGateway(null, req);
    }

    handleDeleteGateway = (values, req) => {
        Modal.confirm({
            title: '确定要删除吗？',
            onOk: () => {
                if (!!values) {
                    req = {
                        ids: values
                    };
                }
                deleteGateway(this.props.history, req)
                    .then((res) => {
                        if (!!res) {
                            message.success('已删除！');
							 this.refs.gateways.getData(0);
                        } else {
                            message.error( '删除失败！');
                        }
                    }).catch(() => {
                    console.log('catch back');
                })
            }
        })
    }

    toAdd = () => {
        this.setState({toAdd: true});
    }

	toAddABP =()=> {
		let ABP = {
			devAddr: getCode(8),
			appsKey: getCode(32),
			nwksKey: getCode(32),
			devEui: getCode(16)
		};
		sessionStorage.setItem('abp', JSON.stringify(ABP));
		this.setState({ abp: true });
	}

	toAddOTAA =()=> {
		let OTAA = {
			appKey: getCode(32),
			devEui: getCode(16),
			appEui: getCode(16),
		};
		sessionStorage.setItem('otaa', JSON.stringify(OTAA));
		this.setState({ otaa: true });
	}

	toBatchAdd =()=> {
		this.setState({ batch: true });
	}

	addABP =()=> {
		this.refs.abp.validateFields((err, values)=> {
			if (!err) {
				Modal.confirm({
					title: '确定要添加吗？',
					onOk: ()=> {
						let req = {
							...values,
							devAddr: values.devAddr.replace(/-/g, ''),
							devEui: values.devEui.replace(/-/g, ''),
							nwksKey: values.nwksKey.replace(/-/g, ''),
							appsKey: values.appsKey.replace(/-/g, ''),
							projectId: sessionStorage.getItem('project'),
						};
						addABP(this.props.history, req)
							.then((res)=> {
								if (!!res) {
									message.success('已添加！');
									this.refs.nodes.getData(0);
									this.handleCancel();
								}
							});
					}
				})
			}
		})
	}

	addOTAA =()=> {
		this.refs.otaa.validateFields((err, values)=> {
			if (!err) {
				Modal.confirm({
					title: '确定要添加吗？',
					onOk: ()=> {
						let req = {
							...values,
							devEui: values.devEui.replace(/-/g, ''),
							appKey: values.appKey.replace(/-/g, ''),
							projectId: sessionStorage.getItem('project'),
						};
						addOTAA(this.props.history, req)
							.then((res)=> {
								if (!!res) {
									message.success('已添加！');
									this.refs.nodes.getData(0);
									this.handleCancel();
								}
							});
					}
				})
			}
		})
	}

	handleBatchAdd =()=> {
		this.setState({ uploading: true });
		batchAdd(this.props.history, this.state.batchData, this.state.fileList[0])
			.then((res)=> {
				if (!!res) {
					message.success('已导入！');
					this.refs.nodes.getData(0);
					this.handleCancel();
				} else {
					this.handleCancel();
				}
			})
	}

    handleGatewayAdd = () => {
        this.setState({uploading: true});
        batchAddGateway(this.props.history, this.state.batchData, this.state.fileList[0])
            .then((res) => {
                if (!!res) {
                   	message.success( '已导入！');
					this.refs.gateways.getData(0);
					this.handleCancel();
                } else {
                    this.handleCancel();
                }
            })
    }

    componentDidMount() {
		queryProject(this.props.history, sessionStorage.getItem('project'))
			.then((res)=> {
				if (!!res) {
					sessionStorage.setItem('project_appEui', res.appEui);
				}
			});
	}

    handleCancel = () => {
        this.setState({
            toAdd: false, add: false, abp: false,
            otaa: false, batch: false, gateway: false, uploading: false, fileList: [],
            batchData: {joinType: 'ABP', projectId: sessionStorage.getItem('project')}
        });
    }

    toAddGate = () =>{
        let GATEWAY = {
            gatewayEui: getCode(16),
        };
        sessionStorage.setItem('gateway', JSON.stringify(GATEWAY));
        this.setState({gateway: true});
	}
    addGateway = () => {
        this.refs.gateway.validateFields((err, values) => {
            if (!err) {
                Modal.confirm({
                    title: '确定要添加吗？',
                    onOk: () => {
                        let req = {
                            ...values,
                            gatewayEui: values.gatewayEui.replace(/-/g, ''),
                            projectId: sessionStorage.getItem('project'),
                        };
                        addGateway(this.props.history, req)
                            .then((res) => {
                                if (!!res) {
                                    message.success( '已添加！');
									this.refs.gateways.getData(0);
									this.handleCancel();
                                }
                            });
                    }
                })
            }
        })
    }
    toUpdate = () => {
        $("#system-item").addClass('ant-menu-item-selected');
        $("#projects-item").removeClass('ant-menu-item-selected');
        const updateGate = this.state.gatewayTable.req.projectId;
        this.props.history.push('/user/system', {data: updateGate});
    };
    toDebug = (item) => {
		sessionStorage.setItem('node', item.id);
		sessionStorage.setItem('devEui', item.devEui);
		this.props.history.push('/user/node/debug');
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
				href: '/user/project/devices',
				text: '设备管理'
			}
		],
		type: this.props.history.location.state?(this.props.history.location.state.type?this.props.history.location.state.type:'node'):'node',
		nodeTable: {
			id: 'node',
			rowKey: 'id',
			columns: [
				{
					title: 'devEui',
					dataIndex: 'devEui',
					key: 'devEui',
					render: (a, item, index)=> {
						return (
								<a key={item.devEui+'a'+index} href="javascript:;"
								   onClick={this.toDetail.bind(this, item)}>
									{item.devEui}
								</a>
						)
					}
				},
				{
					title: 'appEui',
					dataIndex: 'appEui',
					key: 'appEui',
				},
				{
					title: 'group',
					dataIndex: 'group',
					key: 'group',
				},
				{
					title: '设备类型',
					dataIndex: 'joinType',
					key: 'joinType',
					width:88,
				},
				{
					title: 'lwan版本',
					dataIndex: 'lorawanVersion',
					key: 'lorawanVersion',
                    width:94,
				},
				{
					title: 'cls版本',
					dataIndex: 'clazz',
					key: 'clazz',
					width:98,
				},
				{
					title: '创建时间',
					dataIndex: 'createdDate',
					key: 'createdDate',
				},
				{
					title: '操作',
					dataIndex: 'address',
					key: 'address',
					render: (a, item, index)=> {
						return (
							<div className="action-list" key={item.username+'a'+index}>
								<a href="javascript:;" onClick={this.toDetail.bind(this, item)}>查看</a>
								{
									item.adrEnable?
										<a href="javascript:;" onClick={this.toEnable.bind(this, false, item)}>禁用ADR</a>
										:
										<a href="javascript:;" onClick={this.toEnable.bind(this, true, item)}>启用ADR</a>
								}
								<a href="javascript:;" onClick={this.toDebug.bind(this, item)}>节点调试</a>
								<a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
							</div>
						)
					}
				},
			],
			getData: getNodes,
			selectButtons: [
				{
					text: '启用ADR',
					handleClick: this.handleEnable.bind(this, true),
				},
				{
					text: '禁用ADR',
					handleClick: this.handleEnable.bind(this, false),
				},
				{
					text: '删除',
					handleClick: this.handleDelete,
				}
			],
			showButtons: true,
			buttonSettings: [
				{
					text: '添加',
					type: 'primary',
					onClick: this.toAdd,
				},
			],
			searchFields: 'devEui',
			searchPlaceholder: '请输入devEui',
			history: this.props.history,
			req: {
				projectId: sessionStorage.getItem('project'),
			}
		},
		gatewayTable: {
			rowKey: 'id',
			id: 'gateway',
			columns: [

                {
                    title: '网关名称',
                    dataIndex: 'name',
                    key: 'name',
                    width:88,
                    render: (a, item, index)=> {
                        return (
							<a key={item.name+'a'+index} href="javascript:;"
							   onClick={this.toGateDetail.bind(this, item)}>
                                {item.name}
							</a>
                        )
                    }
                },
				{
					title: 'GatewayEui',
					dataIndex: 'gatewayEui',
					key: 'gatewayEui',
				},
				{
					title: 'macAddr',
                    dataIndex: 'macAddr',
                    key: 'macAddr',
                },
                {
                    title: '网关类型',
                    dataIndex: 'type',
                    key: 'type',
                },
                {
                    title: '固件版本',
                    dataIndex: 'version',
                    key: 'version',
                },
                {
                    title: '创建时间',
                    dataIndex: 'createdDate',
                    key: 'createdDate',
                },
                {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 80,
                    render: (a, item, index) => {
                        return (
                            <span key={item.username + index}>
								<span className={item.status === 'ONLINE' ? 'able-dot' : 'danger-dot'}>
								</span>
                                {item.status === 'ONLINE' ? '在线' : '离线'}
							</span>
                        )
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'address',
                    key: 'address',
                    render: (a, item, index) => {
                        return (
                            <div className="action-list" key={item.username + 'a' + index}>
                                <a href="javascript:;" onClick={this.toGateDetail.bind(this, item)}>查看</a>
								<a href="javascript:;" onClick={this.toDeleteGateway.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                },
            ],
            getData: getGateways,
            selectButtons: [
                {
                    text: '删除',
                    handleClick: this.handleDeleteGateway,
                }
            ],
            showButtons: true,
            buttonSettings: [
                {
                    text: '添加',
                    type: 'primary',
                    onClick: this.toAdd,
                },
                {
                    text: '固件升级',
                    type: 'primary',
                    onClick: this.toUpdate,
                },
            ],
            searchFields: 'gatewayEui,name',
            searchWidth:'220px',
            searchPlaceholder: '请输入网关名称/gatewayEui',
            history: this.props.history,
            req: {
                projectId: sessionStorage.getItem('project'),
            }
        },
        toAdd: false,
        add: false,
        abp: false,
        otaa: false,
        batch: false,
        gateway: false,
        uploading: false,
        batchData: {
            joinType: 'ABP',
            projectId: sessionStorage.getItem('project'),
        },
        fileList: [],
        coords:{
            longitude:120.3,
            latitude:30.43
        },
		rateList:[],
    }

    handleTab = (type) => {
        this.setState({type});
    }

    render() {
        const type = this.state.type;
        const layout = {
            labelCol: {
                xs: {span: 16},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 16},
                sm: {span: 20},
            }
        };
        const settings = {
            action: domain + 'api/v1/lorawan/devices/batchImport',
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token'),
            },
            data: this.state.batchData,
            beforeUpload: (file) => {
                this.setState(({fileList}) => ({
                    fileList: [file],
                }));
                return false;
            },
            onRemove: (file) => {
                this.setState({fileList: []});
            },
            fileList: this.state.fileList,
        };
        const batchData = this.state.batchData;
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {type === 'node' ? '节点管理' : '网关管理'}
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        <Tabs activeKey={type} onChange={this.handleTab}>
                            <Tabs.TabPane tab="节点" key="node">
                                <BasicTable ref="nodes" {...this.state.nodeTable}/>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="网关" key="gateway">
                                <BasicTable ref="gateways" {...this.state.gatewayTable}/>
                            </Tabs.TabPane>
                        </Tabs>
                    </div>
                </div>
                <Modal ref="toAdd"
                       centered
                       visible={this.state.toAdd && this.state.type === 'node'}
                       title="添加节点"
                       onCancel={this.handleCancel}
                       footer={null}>
                    <div>
                        <Row>
                            <Col span={6} offset={2}>
                                <Button type="primary" onClick={this.toAddABP}>添加ABP设备</Button>
                            </Col>
                            <Col span={6} offset={2}>
                                <Button type="primary" onClick={this.toAddOTAA}>添加OTAA设备</Button>
                            </Col>
                            <Col span={6} offset={2}>
                                <Button type="primary" onClick={this.toBatchAdd}>批量导入</Button>
                            </Col>
                        </Row>
                    </div>
                </Modal>
                <Modal ref="toAddABP"
                       centered
                       visible={this.state.abp && this.state.type === 'node'}
                       title="添加ABP节点"
                       maskClosable={false}
                       width={600}
                       onCancel={this.handleCancel}
                       onOk={this.addABP}
                >
                    <ABP ref="abp" key={new Date()}/>
                </Modal>
                <Modal ref="toAddOTAA"
                       centered
                       visible={this.state.otaa && this.state.type === 'node'}
                       title="添加OTAA节点"
                       maskClosable={false}
                       width={600}
                       onCancel={this.handleCancel}
                       onOk={this.addOTAA}
                >
                    <OTAA ref="otaa" key={new Date()}/>
                </Modal>
                <Modal ref="batch"
                       centered
                       visible={this.state.batch && this.state.type === 'node'}
                       title="批量导入"
                       maskClosable={false}
                       width={600}
					   onCancel={this.handleCancel}
                       footer={
                           [
                               <Button key="back" onClick={this.handleCancel}>取消</Button>,
                               <Button key="sub" type="primary"
                                       disabled={this.state.fileList.length < 1}
                                       loading={this.state.uploading} onClick={this.handleBatchAdd}>
                                   确定
                               </Button>,
                           ]
                       }
                >
                    <Form>
                        <Form.Item label="设备类型"
                                   required={true}
                                   {...layout}>
                            <Select value={batchData.joinType}
                                    onChange={(joinType) => {
                                        let batchData = {...this.state.batchData, joinType};
                                        this.setState({batchData});
                                    }}>
                                <Select.Option value="OTAA">OTAA</Select.Option>
                                <Select.Option value="ABP">ABP</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="频段规范" {...layout}>
                            <Input readOnly value={sessionStorage.getItem('band_name')}/>
                        </Form.Item>
                        <Form.Item label="上传文件"
                                   required {...layout}>
                            <Upload {...settings} ref="upload">
                                <Button>
                                    <Icon type="upload"/> 选择文件
                                </Button>
                            </Upload>
                        </Form.Item>
						<Form.Item label="导入模板" {...layout}>
							<a download href="./../../../../../static/assets/files/abp节点.xlsx">abp节点</a>
							<a style={{marginLeft: '5px'}} download href="./../../../../../static/assets/files/otaa节点.xlsx">otaa节点</a>
						</Form.Item>
                    </Form>
                </Modal>
                <Modal ref="toAddGateway"
                       visible={this.state.toAdd && this.state.type === 'gateway'}
                       title="添加网关"
                       centered
                       onCancel={this.handleCancel}
                       footer={null}>
                    <div>
                        <Row align="middle" justify="center" type="flex">
                            <Col span={9} offset={3}>
                                <Button type="primary" onClick={this.toAddGate}>添加网关</Button>
                            </Col>
                            <Col span={9} offset={3}>
                                <Button type="primary" onClick={this.toBatchAdd}>批量导入</Button>
                            </Col>
                        </Row>
                    </div>
                </Modal>
                <Modal ref="toAddGate"
                       centered
                       visible={this.state.gateway}
                       title="添加网关"
                       width={860}
                       handleMap={true}
                       onCancel={this.handleCancel}
                       onOk={this.addGateway}
                >
                    <GATEWAY ref="gateway" key={new Date()} coords={this.state.coords}/>
                </Modal>
                <Modal ref="batch"
                       centered
                       visible={this.state.batch && this.state.type !== 'node'}
                       title="批量导入网关"
					   onCancel={this.handleCancel}
                       width={600}
                       footer={
                           [
                               <Button key="back" onClick={this.handleCancel}>取消</Button>,
                               <Button key="sub" type="primary"
                                       disabled={this.state.fileList.length < 1}
                                       loading={this.state.uploading} onClick={this.handleGatewayAdd}>
                                   确定
                               </Button>
                           ]
                       }
                >
                    <Form>
                        <Form.Item label="频段规范" {...layout}>
                            <Input readOnly value={sessionStorage.getItem('band_name')}/>
                        </Form.Item>
                        <Form.Item label="上传文件"
                                   required {...layout}>
                            <Upload {...settings} ref="upload">
                                <Button>
                                    <Icon type="upload"/> 选择文件
                                </Button>
                            </Upload>
                        </Form.Item>
						<Form.Item label="导入模板" {...layout}>
							<a download href="./../../../../../static/assets/files/gateway.xlsx">网关</a>
						</Form.Item>
                    </Form>
                </Modal>
            </Content>
        )
    }
}

const OTAA = Form.create()((props) => {
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
            xs: {span: 16},
            sm: {span: 4},
        },
        wrapperCol: {
            xs: {span: 16},
            sm: {span: 20},
        }
    };
    const {devEui, appKey, appEui} = JSON.parse(sessionStorage.getItem('otaa'));
    return (
        <Form>
            <Form.Item label="devEUI" {...layout}>
                <Row gutter={8}>
                    <Col span={20}>
                        {
                            getFieldDecorator('devEui', {
                                rules: [{
                                    required: true, message: '请输入devEui！'
                                }, {
                                    pattern: /^[0-9a-fA-F]{16}$/, message: '请输入长度为16的十六进制值！'
                                }],
                                initialValue: devEui,
                            })(
                                <Input placeholder={devEui}/>
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'devEui', 16)}>换一换</Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item label="appEui" {...layout}>
                <Row gutter={8}>
                    <Col span={20}>
                        {
                            getFieldDecorator('appEui', {
                                rules: [{
                                    required: true, message: '请输入appEui！'
                                }, {
                                    pattern: /^[0-9a-fA-F]{16}$/, message: '请输入长度为16的十六进制值！'
                                }],
                                initialValue: appEui,
                            })(
                                <Input placeholder={appEui}/>
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
                                    required: true, message: '请输入appKey！'
                                }, {
                                    pattern: /^[0-9a-fA-F]{32}$/, message: '请输入长度为32的十六进制值！'
                                }],
                                initialValue: appKey,
                            })(
                                <Input placeholder={appKey}/>
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'appKey', 32)}>换一换</Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item label="频段规范" {...layout}>
                <Input readOnly value={sessionStorage.getItem('band_name')}/>
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
            <Form.Item label="fcntBits" {...layout}>
                {
                    getFieldDecorator('fcntBits', {
                        rules: [{
                            required: true, message: '请选择fcntBits！'
                        }]
                    })(
                        <Select placeholder="请选择fcntBits">
                            <Select.Option value="FCNT_16">FCNT_16</Select.Option>
                            <Select.Option value="FCNT_32">FCNT_32</Select.Option>
                        </Select>
                    )
                }
            </Form.Item>
            <Form.Item label="lwan版本" {...layout}>
                {
                    getFieldDecorator('lorawanVersion', {
                        rules: [{
                            required: true, message: '请选择lwan版本！'
                        }]
                    })(
                        <Select placeholder="请选择lwan版本">
                            <Select.Option value="LoRaWAN_1_0_1">LoRaWAN_1_0_1</Select.Option>
                            <Select.Option value="LoRaWAN_1_0_2">LoRaWAN_1_0_2</Select.Option>
                            <Select.Option value="LoRaWAN_1_1">LoRaWAN_1_1</Select.Option>
                        </Select>
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

const ABP = Form.create()((props) => {
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
            xs: {span: 16},
            sm: {span: 4},
        },
        wrapperCol: {
            xs: {span: 16},
            sm: {span: 20},
        }
    };
    const {devAddr, devEui, nwksKey, appsKey} = JSON.parse(sessionStorage.getItem('abp'));
    return (
        <Form>
            <Form.Item label="devAddr" {...layout}>
                {
                    getFieldDecorator('devAddr', {
                        rules: [{
                            required: true, message: '请输入devAddr！'
                        }, {
                            pattern: /^([0-9a-fA-F]{8})$/, message: '请输入长度为8的十六进制值！'
                        }],
                        initialValue: devAddr,
                    })(
                        <Input placeholder={devAddr}/>
                    )
                }
            </Form.Item>
            <Form.Item label="devEUI" {...layout}>
                <Row gutter={8}>
                    <Col span={20}>
                        {
                            getFieldDecorator('devEui', {
                                rules: [{
                                    required: true, message: '请输入devEui！'
                                }, {
                                    pattern: /^([0-9a-fA-F]{16})$/, message: '请输入长度为16的十六进制值！'
                                }],
                                initialValue: devEui,
                            })(
                                <Input placeholder={devEui}/>
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'devEui', 16)}>换一换</Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item label="nwksKey" {...layout}>
                <Row gutter={8}>
                    <Col span={20}>
                        {
                            getFieldDecorator('nwksKey', {
                                rules: [{
                                    required: true, message: '请输入nwksKey！'
                                }, {
                                    pattern: /^[0-9a-fA-F]{32}$/, message: '请输入长度为32的十六进制值！'
                                }],
                                initialValue: nwksKey,
                            })(
                                <Input placeholder={nwksKey}/>
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
                                    required: true, message: '请输入appsKey！'
                                }, {
                                    pattern: /^[0-9a-fA-F]{32}$/, message: '请输入长度为32的十六进制值！'
                                }],
                                initialValue: appsKey,
                            })(
                                <Input placeholder={appsKey}/>
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'appsKey', 32)}>换一换</Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item label="频段规范" {...layout}>
                <Input readOnly value={sessionStorage.getItem('band_name')}/>
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
            <Form.Item label="fcntBits" {...layout}>
                {
                    getFieldDecorator('fcntBits', {
                        rules: [{
                            required: true, message: '请选择fcntBits！'
                        }]
                    })(
                        <Select placeholder="请选择fcntBits">
                            <Select.Option value="FCNT_16">FCNT_16</Select.Option>
                            <Select.Option value="FCNT_32">FCNT_32</Select.Option>
                        </Select>
                    )
                }
            </Form.Item>
            <Form.Item label="lwan版本" {...layout}>
                {
                    getFieldDecorator('lorawanVersion', {
                        rules: [{
                            required: true, message: '请选择lwan版本！'
                        }]
                    })(
                        <Select placeholder="请选择lwan版本">
                            <Select.Option value="LoRaWAN_1_0_1">LoRaWAN_1_0_1</Select.Option>
                            <Select.Option value="LoRaWAN_1_0_2">LoRaWAN_1_0_2</Select.Option>
                            <Select.Option value="LoRaWAN_1_1">LoRaWAN_1_1</Select.Option>
                        </Select>
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

const GATEWAY = Form.create()((props) => {
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
            xs: {span: 16},
            sm: {span: 7},
        },
        wrapperCol: {
            xs: {span: 16},
            sm: {span: 17},
        }
    };
    const { gatewayEui } = JSON.parse(sessionStorage.getItem('gateway'));
    const handleMap = () => {
        let $pickMapBox = $("#pickMapBox");
        $pickMapBox.show();
        let map = new BMap.Map('pickMap');
        let point = new BMap.Point(Number(props.coords.longitude), Number(props.coords.latitude));
        map.centerAndZoom(point, 12);
        map.enableScrollWheelZoom(true);

        map.addEventListener("click", (e) => {
            map.clearOverlays();
            let marker = new BMap.Marker(e.point);
            map.addOverlay(marker);
            props.form.setFieldsValue({
                longitude: e.point.lng.toString(),
                latitude: e.point.lat.toString()
            });
        });
    };

    return (
        <div className="mapTcBox">
            <Form>
                <Form.Item {...layout}
                           label="网关名称">
                    {getFieldDecorator('name', {
                        rules: [
                            {required: true, message: '请输入网关名称!'},
                            {max: 30, min: 4, message: '支持中文、英文字母、数字和下划线，长度限制4~30'}
                        ],
                    })(
                        <Input placeholder="网关名称"/>
                    )}
                </Form.Item>
                <Form.Item label="GatewayEui" {...layout}>
                    <Row gutter={8}>
                        <Col span={18}>
                            {
                                getFieldDecorator('gatewayEui', {
                                    rules: [{
                                        required: true, message: '请输入GatewayEui'
                                    }, {
                                        pattern: /^[0-9a-fA-F]{16}$/, message: '请输入长度为16的十六进制值'
                                    }],
                                    initialValue: gatewayEui,
                                })(
                                    <Input placeholder={gatewayEui}/>
                                )
                            }
                        </Col>
                        <Col span={6}>
                            <Button onClick={handleChange.bind(this, 'gatewayEui', 16)}>换一换</Button>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item {...layout} label="网关类型">
                    {getFieldDecorator('type', {
                        rules: [
                            {required: true, message: '请选择网关类型!'},
                        ],
                    })(
                        <Select placeholder="请选择网关类型">
                            <Select.Option value="BASIC">BASIC</Select.Option>
                            <Select.Option value="PRO">PRO</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label="频段规范" {...layout}>
                    <Input readOnly value={sessionStorage.getItem('band_name')}/>
                </Form.Item>
                <Form.Item label="经度" {...layout}>
                    <Row gutter={8}>
                        <Col span={16}>
                            {
                                getFieldDecorator('longitude', {
                                    rules: [{
                                        required: true, message: '请输入经度'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            let re = /^[\-\+]?([0-8]?\d{1}|[0-8]?\d{1}\.\d{0,6}|90|90\.0{0,6})$/;
											if (!!value||re.test(value)) {
                                                callback();
                                            } else {
                                                callback(new Error('请输入正确的经度！'));
                                            }
                                        }
                                    }],
                                })(
                                    <Input placeholder='请输入或选择经度'/>
                                )
                            }
                        </Col>
                        <Col span={8}/>
                    </Row>
                </Form.Item>
                <Form.Item label="纬度" {...layout}>
                    <Row gutter={8}>
                        <Col span={16}>
                            {
                                getFieldDecorator('latitude', {
                                    rules: [{
                                        required: true, message: '请输入纬度'
                                    }, {max: 90, min: -90, message: '请输入正确的纬度'}],
                                })(
                                    <Input placeholder='请输入或选择纬度'/>
                                )
                            }
                        </Col>
                        <Col span={8}>
                            <Button onClick={handleMap.bind(this)}>拾取坐标</Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
            <div className="pickMapBox hide" id="pickMapBox">
                <div id="pickMap"
                     style={{width: '100%', height: '340px'}}>
                </div>
            </div>
        </div>
    );
});
