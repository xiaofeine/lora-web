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
import {queryGateway, gatewaysData, delGatewaysData, queryGatewaysData} from 'Api/gateway';

const {Content} = Layout;

export default class GateData extends React.Component {


    componentDidMount() {
        let id = !!this.state.data.id ? this.state.data.id : sessionStorage.getItem('gateway');
        queryGateway(this.props.history, id)
            .then((res) => {
                if (!!res) {
                    let breads = [
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
                            href: '/user/gateway/detail',
                            text: res.gatewayEui
                        },
                        {
                            href: '/user/gateway/gateData',
                            text: '查看数据'
                        }
                    ];
                    this.setState({data: {...res}, breads});
                }
            });
    }

    toDetail = (item) => {
        let req = item.type;
        let id = item.id;
        queryGatewaysData(this.props.history, id, req)
            .then((res) => {
                if (!!res) {
                    this.setState({gatewayDetail: {...res}, visible: true});
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
            title: '确定要删除这条数据吗？',
            onOk: () => {
                delGatewaysData(this.props.history, value)
                    .then((res) => {
                        if (!!res) {
                            Modal.success({
                                title: '已删除！',
                                onOk: () => {
                                    this.refs.gateData.getData(0);
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
        this.setState({tableSettings});
    };
    state = {
        visible: false,
        state: 'ONLINE',
        data: {},
        gatewayDetail: {},
        gatewayDetailVisible: false,
        breads: [],
        uploading: false,
        projectName: sessionStorage.getItem('project_name'),
        tableSettings: {
            id: 'gateData',
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
            scroll: 1270,
            getData: gatewaysData,
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
                    onClick: this.queryUp.bind(this, true),
                },
                {
                    text: '下行',
                    type: 'primary',
                    value: false,
                    onClick: this.queryUp.bind(this, false),
                },
            ],
            searchFields: 'devEui',
            searchPlaceholder: 'devEui',
            history: this.props.history,
            req: {
                gatewayEui: sessionStorage.getItem('gatewayEui'),
                upLink: '',
            },
            reqChange: true,
            rowClassName: (record) => {
                return record.type ? 'up-row' : 'down-row';
            }
        },
    }

    render() {
        const data = this.state.data;
        const dData = this.state.gatewayDetail;
        const keys = Object.keys(dData);
        keys.sort();
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {data.name}
                        <Tag color="blue">{this.state.projectName}</Tag>
                        <Tag
                            color={data.status == 'ONLINE' ? 'green' : 'red'}>{data.status == 'ONLINE' ? '在线' : '离线'}</Tag>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        <BasicTable ref="gateData" {...this.state.tableSettings}/>
                    </div>
                </div>
                <Modal
                    title="数据包详情"
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    footer={null}
                    width={880}
                >
                    <ul className="gateDetailTable clearfix">
                        {
                            keys.map((k, i) => {
                                if (k !== 'serverTimeMillis'&&k !== 'type') {
                                    return (
                                        <li key={i}>
                                            <span>{k}</span>
                                            <span className="con">{String(dData[k])}</span>
                                        </li>
                                    )
                                }
                            })
                        }
                    </ul>
                </Modal>
            </Content>
        )
    }
}