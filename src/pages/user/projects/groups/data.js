import React from 'react';
import { render } from 'react-dom';
import { Layout, Modal, Tag, message } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import BasicTable from "Commons/table/basic";
import { queryData, delData, viewData } from 'Api/groups';

const { Content } = Layout;

export default class GroData extends React.Component{
    toDetail = (item) =>{
        let req = {
            type: item.type,
            id: item.id,
        };
        viewData(this.props.history, req)
            .then((res) => {
                if(!!res) {
                    this.setState({ toDetail: true, currentRow: {...res} })
                }
            })
    }

    handleCancel = () =>{
        this.setState({ toDetail: false, currentRow: {} })
    }

    toDelete = (item) =>{
        let req = {
            ids: [item.id],
        };
        this.handleDelete(null, req);
    }

    handleDelete = (values, req) => {
        Modal.confirm({
            title: '确定要删除吗？',
            onOk: () => {
                if (!!values) {
                    req = {
                        ids: values
                    };
                }
                delData(this.props.history, req)
                    .then((res) => {
                        if (!!res) {
                            message.success('已删除！');
                            this.refs.data.getData(0);
                        } else {
                            message.error('删除失败！');
                        }
                    }).catch(() => {
                    console.log('catch back');
                })
            }
        })
    }

    state = {
        breads: [
            {
                href: 'dashboard',
                text: '首页'
            },
            {
                href: '/user/projects',
                text: '项目管理'
            },
            {
                href: '/user/project/detail',
                text: sessionStorage.getItem('project_name'),
            },
            {
                href: '/user/project/groups',
                text: '组播管理'
            },
            {
                href: '/user/group/detail',
                text: sessionStorage.getItem('group_name')
            },
            {
                href: '/user/group/data',
                text: '查看数据'
            }

        ],
        currentRow: {},
        groupsTable: {
            RowKey: 'id',
            columns: [
                {
                    title: 'gatewayEui',
                    dataIndex: 'gatewayEui',
                    key: 'gatewayEui'
                },
                {
                    title: 'devAddr',
                    dataIndex: 'devAddr',
                    key: 'devAddr'
                },
                {
                    title: 'freq',
                    dataIndex: 'freq',
                    key: 'freq',
                    width: 70
                },
                {
                    title: 'datr',
                    dataIndex: 'datr',
                    key: 'datr',
                    width: 112
                },
                {
                    title: 'fcnt',
                    dataIndex: 'fcnt',
                    key: 'fcnt',
                    width: 58
                },
                {
                    title: 'mType',
                    dataIndex: 'mtypeText',
                    key: 'mtypeText'
                },
                {
                    title: 'serverTime',
                    dataIndex: 'serverTime',
                    key: 'serverTime'
                },
                {
                    title: '操作',
                    dataIndex: 'address',
                    key: 'address',
                    render: (a, item, index) => {
                        return (
                            <div className="action-list" key={item.gatewayEui + 'a' + index}>
                                <a href="javascript:;" onClick={this.toDetail.bind(this, item)} >详情</a>
                                <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                }
            ],
            getData: queryData,
            selectButtons: [
                {
                    text: '删除',
                    handleClick: this.handleDelete
                }
            ],
            showButtons: true,
            searchFields: 'gatewayEui ',
            searchPlaceholder: '请输入gatewayEui',
            history: this.props.history,
            req: {
                groupId: sessionStorage.getItem('groupId')
            },
            toDetail: false
        },
    }
    render() {
        const currentRow  = this.state.currentRow;
        const keys = Object.keys(currentRow);
        keys.sort();
        return(
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {sessionStorage.getItem('group_name')}
                        <Tag color='blue' >{sessionStorage.getItem('project_name')}</Tag>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        {<BasicTable ref="data" {...this.state.groupsTable}/>}
                    </div>
                </div>
                <Modal ref="toDetail"
                       visible={this.state.toDetail}
                       maskClosable={false}
                       title="数据包详情"
                       width={880}
                       footer={null}
                       onCancel={this.handleCancel}>
                    <ul className="data-form clearfix">
                        {
                            keys.map((k, i)=> {
                                if (k !== 'serverTimeMillis' && k !== 'type' && k !== 'mtypeText') {
                                    return (
                                        <li key={i}>
                                            <span>{k}</span>
                                            <span className="con">{String(currentRow[k])}</span>
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