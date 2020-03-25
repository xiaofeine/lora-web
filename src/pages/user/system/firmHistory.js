/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import {Layout, Tabs, Popconfirm, Modal, Button, Row, Col, message} from 'antd';

const {Content} = Layout;
import BasicTable from 'Commons/table/basic';
import {getHistory, deleteHisFirmWares, updateFirmWares} from 'Api/firmwares'

export default class FirmHistory extends React.Component {

    toUpdate = (item) => {
        let req = {
            ids: [item.id],
        };
        updateFirmWares(this.props.history, req)
            .then((res) => {
                if (!!res) {
                    message.success('已提交！');
                } else {
                    message.error({
                        title: '重新升级失败',
                    });
                }
            }).catch(() => {
            console.log('catch back');
        })
    };

    toDelete = (item) => {
        let req = {
            ids: [item.id],
        };
        this.handleDelete(null, req);
    };

	toBatchUpdate =(values, req) => {
	    if (!!values) {
	        req = {
	            ids: values,
            };
        }

		Modal.confirm({
			title: '确定要升级吗？',
			onOk: () => {
				updateFirmWares(this.props.history, req)
					.then((res) => {
						if (!!res) {
							message.success('已提交，等待网关升级重启！');
						} else {
                            message.error({
								title: '提交失败',
							});
						}
					}).catch(() => {
					console.log('catch back');
				})
			}
		})
    }

    handleDelete = (values, req) => {
        if (!!values) {
            req = {
                ids: values
            };
        }

        Modal.confirm({
            title: '确定要删除吗？',
            onOk: () => {
                deleteHisFirmWares(this.props.history, req)
                    .then((res) => {
                        if (!!res) {
                            message.success({
                                title: '已删除',
                            });
                            this.refs.success.getData(0);
                            this.refs.fail.getData(0);
                        } else {
                            message.error({
                                title: '删除失败！'
                            });
                        }
                    }).catch(() => {
                    console.log('catch back');
                })
            }
        })
    };

    state = {
        type: !!this.props.history.location.state?this.props.history.location.state.type:'success',
        successTable: {
            id: 'success',
            rowKey: 'id',
            success: true,
            columns: [
                {
                    title: 'gatewayEui',
                    dataIndex: 'gatewayEui',
                    key: 'gatewayEui',
                },
                {
                    title: '文件名称',
                    dataIndex: 'filename',
                    key: 'filename',
                },
                {
                    title: '版本号',
                    dataIndex: 'version',
                    key: 'version',
                },
                {
                    title: '状态',
                    dataIndex: 'success',
                    key: 'success',
                    width: 100,
                    render: (a, item, index) => {
                        return (
                            <span key={item.success + 'index'}>
								<span className={item.success ? 'able-dot' : 'disable-dot'}>
								</span>
                                {item.success ? 'success' : 'fail'}
							</span>
                        )
                    }
                },
                {
                    title: '升级时间',
                    dataIndex: 'createdDate',
                    key: 'createdDate',
                },
                {
                    title: '操作',
                    dataIndex: 'address',
                    key: 'address',
                    render: (a, item, index) => {
                        return (
                            <div className="action-list" key={item.username + 'a' + index}>
                                <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                },
            ],
            getData: getHistory,
            selectButtons: [
                {
                    text: '删除',
                    handleClick: this.handleDelete,
                }
            ],
            showButtons: true,
            buttonSettings: [],
            searchFields: 'gatewayEui',
            searchPlaceholder: '请输入gatewayEui',
            history: this.props.history,
            req: {
                success: true,
            }
        },
        failTable: {
            id: 'fail',
            rowKey: 'id',
            success: false,
            columns: [
                {
                    title: 'gatewayEui',
                    dataIndex: 'gatewayEui',
                    key: 'gatewayEui',
                },
                {
                    title: '文件名称',
                    dataIndex: 'filename',
                    key: 'filename',
                },
                {
                    title: '版本号',
                    dataIndex: 'version',
                    key: 'version',
                },
                {
                    title: '状态',
                    dataIndex: 'success',
                    key: 'success',
                    width: 80,
                    render: (a, item, index) => {
                        return (
                            <span key={item.success + 'index'}>
								<span className={item.success ? 'able-dot' : 'disable-dot'}>
								</span>
                                {item.success ? 'success' : 'fail'}
							</span>
                        )
                    }
                },
                {
                    title: '升级时间',
                    dataIndex: 'createdDate',
                    key: 'createdDate',
                },
                {
                    title: '操作',
                    dataIndex: 'address',
                    key: 'address',
                    render: (a, item, index) => {
                        return (
                            <div className="action-list" key={item.username + 'a' + index}>
                                <a href="javascript:;" onClick={this.toUpdate.bind(this, item)}>重新升级</a>
                                <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                },
            ],
            getData: getHistory,
            selectButtons: [
                {
					text: '批量升级',
					handleClick: this.toBatchUpdate,
                },
                {
                    text: '删除',
                    handleClick: this.handleDelete,
                }
            ],
            showButtons: true,
            buttonSettings: [],
            searchFields: 'gatewayEui',
            searchPlaceholder: '请输入gatewayEui',
            history: this.props.history,
            req: {
                success: false,
            }
        }
    };

    handleTab = (type) => {
        this.setState({type});
    };

    render() {
        const type = this.state.type;
        return (
            <Content className="content-detail firmHistory">
                <div className="dashboard">
                    <div className="title">
                        固件管理
                    </div>
                    <Tabs activeKey={type} onChange={this.handleTab}>
                        <Tabs.TabPane tab="成功记录" key="success">
                            <BasicTable ref="success" {...this.state.successTable}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="失败记录" key="fail">
                            <BasicTable ref="fail" {...this.state.failTable}/>
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </Content>
        )
    }
}