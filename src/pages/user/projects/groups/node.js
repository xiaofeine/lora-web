import React from 'react';
import { render } from 'react-dom';
import { Layout, Popconfirm, Button, Transfer, Modal, Tag, message } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import { groNode, addNode, delNode, queryNode } from 'Api/groups';
import BasicTable from "Commons/table/basic";


const { Content } = Layout;

export default class GroNode extends React.Component{

    toAdd = () => {
        const { node } = this.state;
        queryNode(this.props.history, { groupId: node.id })
            .then((res) => {
                if (!!res) {
                    const classCNode = res.reduce((node, item) => {
                        node.push({
                            key: item.id,
                            title: item.devEui
                        });
                        return node;
                    }, []);
                    this.setState({ classCNode });
                }
            });
        this.setState({toAdd: true});
    }
    handleChange = (targetKeys) => {
        this.setState({ targetKeys});

    }
    handleSubmit = (values, req) => {
        const { targetKeys, node } = this.state;
        const param = {
            deviceIds: targetKeys,
            groupId: node.id
        };
        if (param.deviceIds.length>0) {
            Modal.confirm({
                title:'确定要提交吗？',
                onOk: ()=> {
                    if (!!values) {
                        req = {
                            ids: values
                        };
                    }
                    addNode(this.props.history, param)
                        .then((res) => {
                            if (!!res) {
                                message.success( '已提交！');
                                this.setState({ toAdd: false, targetKeys: [], classCNode: [] });
                                this.refs.node.getData();
                            }
                        });
                }
            })

        } else{
            message.error('请至少指派一个节点！')
        }
    }
    handleCancel =()=> {
        this.setState({ toAdd: false, add: false });
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
            onOk: ()=>{
                if(!!values){
                    req = {
                        ids: values
                    };
                }
                delNode(this.props.history, req)
                    .then((res)=>{
                        if(!!res){
                            message.success('已删除！');
                            this.refs.node.getData(0)
                        }else{
                            message.error({
                                title: '删除失败！'
                            });
                        }
                    }).catch(()=>{
                        console.log('catch back');
                })
            }
        })
    }

    state = {
        classCNode: [],
        targetKeys: [],
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
                href: '/user/group/node',
                text: '组播节点'
            }
        ],
        node: { id: sessionStorage.getItem('groupId') },
        groNodeTable: {
            RowKey: 'id',
            columns: [
                {
                    title: 'devEui',
                    dataIndex: 'devEui',
                    key: 'devEui'
                },
                {
                    title: '添加时间',
                    dataIndex: 'createdDate',
                    key: 'createdDate'
                },
                {
                    title: '操作',
                    dataIndex: 'address',
                    key: 'address',
                    render: (a, item, index) => {
                        return (
                            <div className="action-list" key={item.devEui + 'a' + index}>
                                    <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                }
            ],
            getData: groNode,
            selectButtons: [
                {
                    text: '删除',
                    handleClick: this.handleDelete
                }
            ],
            showButtons: true,
            buttonSettings: [
                {
                    text: '添加',
                    type: 'primary',
                    onClick: this.toAdd
                }
            ],
            searchFields: 'devEui',
            searchPlaceholder: '请输入devEui',
            history: this.props.history,
            page: 0,
            pageSize: 20,
            req: {
                groupId: sessionStorage.getItem('groupId')
            },
            toAdd: false,
            add: false
        }
    }
    render() {
        return(
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {sessionStorage.getItem('group_name') }
                        <Tag color="blue">{sessionStorage.getItem('project_name')}</Tag>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        <BasicTable ref="node" {...this.state.groNodeTable}/>
                    </div>
                    <Modal ref="toAdd"
                           visible={this.state.toAdd}
                           maskClosable={false}
                           title="添加组播节点"
                           width={600}
                           centered={true}
                           onCancel={this.handleCancel}
                           onOk={this.handleSubmit}>
                        <div className="node-title clearfix">
                            <h3>未选</h3>
                            <h3>已选</h3>
                        </div>
                        <div>
                            <Transfer
                                dataSource={this.state.classCNode}
                                showSearch
                                listStyle={{ height: 300 }}
                                operations={['指派', '取消']}
                                targetKeys={this.state.targetKeys}
                                render={item => `${item.title}`}
                                onChange={this.handleChange}
                                searchPlaceholder={'请输入搜索内容'}
                            />
                        </div>
                    </Modal>
                </div>
            </Content>
        )
    }
}