/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout, Popconfirm, Button, Form, Input, Modal, Row, Col, message } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import BasicTable from "Commons/table/basic";
import { getCode, domain } from 'Configs/utils';
import { queryGroups, addGroup, delGroup } from 'Api/groups';


const { Content } = Layout;
const confirm = Modal.confirm;

export default  class Groups extends React.Component {

     toAdd = () => {
         let GRO = {
             addr: getCode(8),
             appsKey: getCode(32),
             nwksKey: getCode(32)
         };
         sessionStorage.setItem('gro', JSON.stringify(GRO));
         this.setState({ gro: true, toAdd: true });
     }

     handleCancel = () => {
         this.setState({ toAdd: false, gro: false });
     }


    toDetail = (item) => {
        sessionStorage.setItem('groupId', item.id);
        sessionStorage.setItem('group_name', item.name);
        this.props.history.push(`/user/group/detail`, { data: item });
    }
    toNode = (item) => {
        sessionStorage.setItem('groupId', item.id);
        sessionStorage.setItem('group_name', item.name);
        this.props.history.push('/user/group/node', { data: item })
    }

     addGroups =()=> {
         this.refs.gro.validateFields((err, values)=> {
             if (!err) {
                 Modal.confirm({
                     title: '确定要添加吗？',
                     onOk: ()=> {
                         let req = {
                             ...values,
                             addr: values.addr.replace(/-/g, ''),
                             nwksKey: values.nwksKey.replace(/-/g, ''),
                             appsKey: values.appsKey.replace(/-/g, ''),
                             projectId: sessionStorage.getItem('project')
                         };
                         addGroup(this.props.history, req)
                             .then((res)=> {
                                 if (!!res) {
                                     message.success('已添加！');
                                     this.refs.data.getData(0);
                                     this.handleCancel();
                                 }
                             });
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

    handleDelete = (values, req) => {
        confirm({
            title: '确定要删除吗？',
            onOk: ()=>{
                if (!!values) {
                    req = {
                        ids: values
                    };
                }
                delGroup(this.props.history, req)
                    .then((res) => {
                        if (!!res) {
                            message.success('已删除！');
                            this.refs.data.getData(0);

                        } else {
                            message.success('删除失败！');
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
             }
         ],
         groupsTable: {
             RowKey: 'id',
             columns: [
                 {
                     title: '组播名',
                     dataIndex: 'name',
                     key: 'name',
                     render: (a, item, index) => {
                         return (
                             <div key={item.name + 'a' + index}>
                                 <a href="javascript:;" onClick={this.toDetail.bind(this, item)}>{item.name}</a>
                             </div>
                         )
                     }
                 },
                 {
                     title: 'addr',
                     dataIndex: 'addr',
                     key: 'addr'
                 },
                 {
                     title: 'rx2DR',
                     dataIndex: 'rx2DR',
                     key: 'rx2DR'
                 },
                 {
                     title: 'rx2Freq',
                     dataIndex: 'rx2Freq',
                     key: 'rx2Freq'
                 },
                 {
                     title: 'fport',
                     dataIndex: 'fport',
                     key: 'fport'
                 },
                 {
                     title: '节点数',
                     dataIndex: 'deviceSize',
                     key: 'deviceSize',
                     render: (a, item, index) => {
                         return (
                             <div key={item.deviceSize + 'a' + index}>
                                 <a href="javascript:;" onClick={this.toNode.bind(this, item)}>{item.deviceSize}</a>
                             </div>
                         )
                     }
                 },
                 {
                     title: '创建时间',
                     dataIndex: 'createdDate',
                     key: 'createdDate'
                 },
                 {
                     title: '操作',
                     dataIndex: 'address',
                     key: 'address',
                     render: (a, item, index) => {
                         return (
                             <div className="action-list" key={item.name + 'a' + index}>
                                 <a href="javascript:;" onClick={this.toDetail.bind(this, item)}>查看</a>
                                     <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                             </div>
                         )
                     }
                 }
             ],
             getData: queryGroups,
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
             searchFields: 'name',
             searchPlaceholder: '请输入组播名',
             history: this.props.history,
             req: {
                 projectId: sessionStorage.getItem('project')
             },
             // add: false,
         },
         toAdd: false,
         gro: false,
         data: {},
     }


    render() {
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        组播管理
                        {/*<span style={{marginLeft: '10px'}}>{sessionStorage.getItem('project_name')}</span>*/}
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        <BasicTable ref="data" {...this.state.groupsTable}/>
                    </div>
                    <Modal ref="toAddGroups"
                           visible={this.state.gro}
                           title="添加组播节点"
                           maskClosable={false}
                           width={600}
                           centered={true}
                           onCancel={this.handleCancel}
                           onOk={this.addGroups}>
                        <div>
                           <Gro ref="gro" key={new Date()} />
                        </div>
                    </Modal>
                </div>
            </Content>
        )
    }
}
const Gro = Form.create()((props)=>{
    const { getFieldDecorator } = props.form;
    const handleChange =(key, num)=> {
        let data = {};
        data[key] = getCode(num);
        props.form.setFieldsValue({
            ...data
        });
    }
    const layout = {
        labelCol: {
            xs: { span: 16 },
            sm: { span: 5 }
        },
        wrapperCol: {
            xs: { span: 16 },
            sm: { span: 19 }
        }
    };
    const { nwksKey, appsKey, addr } = JSON.parse(sessionStorage.getItem('gro'));
    return (
        <Form>
            <Form.Item {...layout}
                       label={(<span>组播名称&nbsp;</span>)}>
                {getFieldDecorator('name', {
                    rules: [
                        {required: true, message: '请输入组播名称!'},
                        {max: 8, min: 4, message: '长度在4~30位之间，支持中文、英文字母、数字和下划线！'}
                    ],
                })(
                    <Input placeholder="请输入组播名称"/>
                )}
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
                                <Input placeholder={nwksKey} />
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'nwksKey', 32)} >换一换</Button>
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
                                <Input placeholder={appsKey} />
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'appsKey', 32)} >换一换</Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item label="addr" {...layout}>
                <Row gutter={8}>
                    <Col span={20}>
                        {
                            getFieldDecorator('addr', {
                                rules: [{
                                    required: true, message: '请输入addr'
                                }, {
                                    pattern: /^[0-9a-fA-F]{8}$/, message: '请输入长度为8的十六进制值！'
                                }],
                                initialValue: addr,
                            })(
                                <Input placeholder={addr}/>
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'addr', 8)} >换一换</Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span style={{marginRight: '5px'}}>rx2DR&nbsp;</span>)}>
                {getFieldDecorator('rx2DR', {
                    rules: [
                        {
                            required: true, message: '请输入rx2DR！'
                        }
                    ],
                })(
                    <Input  placeholder="请输入rx2DR"/>
                )}
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span>rx2Freq&nbsp;</span>)}>
                {getFieldDecorator('rx2Freq', {
                    rules: [
                        {
                            required: true, message: '请输入rx2Freq!'
                        }
                    ],
                })(
                    <Input  placeholder="请输入rx2Freq"/>
                )}
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span>fport&nbsp;</span>)}>
                {getFieldDecorator('fport', {
                    rules: [
                        {
                            required: true, message: '请输入fport!'
                        }
                    ],
                })(
                    <Input  placeholder="请输入fport"/>
                )}
            </Form.Item>
        </Form>
    );
});


