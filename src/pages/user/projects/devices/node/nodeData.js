/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import {Layout, Tag, Popconfirm, Badge, Modal} from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import BasicTable from 'Commons/table/basic';
import { queryNode, deleteNode, getNodeDatas, delNodeDatas, queryNodeData } from 'Api/node';

const {Content} = Layout;

export default class NodeData extends React.Component {

    componentDidMount() {
		queryNode(this.props.history, this.state.node)
			.then((res)=> {
				if (!!res) {
					this.setState({ node: {...res},
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
								href: '/user/node/data',
								text: '查看数据'
							},
						]
					});
				}
			});
    }

    toDetail = (item) => {
        let req = {
            type: item.type,
            id: item.id,
        };
        queryNodeData(this.props.history, req)
            .then((res) => {
                if (!!res) {
                    this.setState({ data: {...res}, visible: true});
                }
            });
    };
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }
    toDelete = (item) => {
        let req = [{
            id: item.id,
            type: item.type
        }];
        this.handleDelete(null, req);
    };

    handleDelete = (keys, rows) => {
        const value = rows.map(item => ({id: item.id, type: item.type}));
        Modal.confirm({
            title: '确定要删除吗？',
            onOk: () => {
                delNodeDatas(this.props.history, value)
                    .then((res) => {
                        if (!!res) {
                            Modal.success({
                                title: '已删除！',
                                onOk: () => {
                                    this.refs.nodeData.getData(0);
                                }
                            });
                        } else {
                            Modal.error({
                                title: '删除失败！',
                            });
                        }
                    }).catch(() => {
                    console.log('catch back');
                })
            }
        })
    }

	queryUp = (uplink) => {
		let tableSettings = {...this.state.tableSettings};
		let req = tableSettings.req;
		if (uplink === req.uplink) {
			req.uplink = '';
		} else {
			req.uplink = uplink;
		}
		tableSettings.req = req;
		tableSettings.page = 0;
		this.setState({ tableSettings });
	};

    state = {
		breads: [],
        visible: false,
        projectName: sessionStorage.getItem('project_name'),
        tableSettings: {
            id: 'nodeData',
            rowKey: 'id',
            columns: [
                {
                    title: 'gatewayEui',
                    dataIndex: 'gatewayEui',
                    key: 'gatewayEui',
					width: 150,
                },
                {
                    title: 'devEui',
                    dataIndex: 'devEui',
                    key: 'devEui',
					width: 100,
                },
                {
                    title: 'freq',
                    dataIndex: 'freq',
                    key: 'freq',
					width: 100,
                },
                {
                    title: 'datr',
                    dataIndex: 'datr',
                    key: 'datr',
					width: 100,
                },
                {
                    title: 'rssi',
                    dataIndex: 'rssi',
                    key: 'rssi',
                    width: 80,
                },
                {
                    title: 'lsnr',
                    dataIndex: 'lsnr',
                    key: 'lsnr',
                    width: 80,
                },
                {
                    title: 'fcnt',
                    dataIndex: 'fcnt',
                    key: 'fcnt',
                    width: 80,
                },
                {
                    title: 'mType',
                    dataIndex: 'mtypeText',
                    key: 'mtypeText',
					width: 100,
                },
                {
                    title: '类型',
                    dataIndex: 'type',
                    key: 'type',
                    width: 100,
                    render: (a, item, index) => {
                        return (
                            <span key={item.id + 'index'}>
                                <Badge status={item.type ? 'success' : 'warning'}/>
                                {item.type ? '上行' : '下行'}
							</span>
                        )
                    }
                },
                {
                    title: 'serverTime',
                    dataIndex: 'serverTime',
                    key: 'serverTime',
					width: 200,
                },
                {
                    title: '操作',
                    dataIndex: 'address',
                    key: 'address',
					width: 100,
                    render: (a, item, index) => {
                        return (
                            <div className="action-list" key={item.id + 'a' + index}>
                                <a href="javascript:;" onClick={this.toDetail.bind(this, item)}>详情</a>
                                <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                },
            ],
            getData: getNodeDatas,
            selectButtons: [
                {
                    text: '删除',
                    handleClick: this.handleDelete,
                }
            ],
            showButtons: true,
            buttonSettings: [
                {
                    text: '上行',
                    type: 'primary',
                    onClick: this.queryUp.bind(this,true),
                },
                {
                    text: '下行',
                    type: 'primary',
                    value: false,
                    onClick: this.queryUp.bind(this,false),
                },
            ],
            searchFields: 'gatewayEui',
            searchPlaceholder: 'gatewayEui',
            history: this.props.history,
            req: {
                devEui: sessionStorage.getItem('devEui'),
				uplink: '',
            },
			reqChange: true,
			rowClassName: (record)=> {
                return record.type?'up-row':'down-row';
            },
			scroll: {x: 1270}
        },
        node: { id: sessionStorage.getItem('node') },
        data: {},
    }

    render() {
        const node = this.state.node;
        const { data, payloadData, serverTimeMillis, type, mtypeText, ...rest }  = this.state.data;
		const keys = Object.keys(rest);
		keys.sort();
		const odd = keys.length%2 === 1;
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {node.devEui}
                        <Tag color="blue">{node.projectName}</Tag>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        <BasicTable ref="nodeData" {...this.state.tableSettings}/>
                    </div>
                </div>
                <Modal
                    title="数据包详情"
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    footer={null}
                    width={880}
                >
                    <ul className="nodeDetailTable clearfix">
                        {
                            keys.map((k, i)=> {
                            	if (odd && i === keys.length-1) {
                            		return (
										<li key={i} style={{ width: '100%', background: '#e2e2e2'}}>
											<span className="name" style={{width: '16%'}}>{k}</span>
											<span className="con" style={{width: '84%'}}>{String(rest[k])}</span>
										</li>
									)
								}
								return (
									<li key={i}>
										<span className="name">{k}</span>
										<span className="con">{String(rest[k])}</span>
									</li>
								)
                            })
                        }
						<li style={{ width: '100%', background: '#e2e2e2'}}>
							<span className="name" style={{width: '16%'}}>data</span>
							<span className="con" style={{width: '84%'}}>{data}</span>
						</li>
						<li style={{ width: '100%', background: '#e2e2e2'}}>
							<span className="name" style={{width: '16%'}}>payloadData</span>
							<span className="con" style={{width: '84%'}}>{payloadData}</span>
						</li>
                    </ul>
                </Modal>
            </Content>
        )
    }
}