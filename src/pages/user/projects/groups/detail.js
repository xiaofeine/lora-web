import React from 'react';
import { render } from 'react-dom';
import { Layout,  Button, Input, message} from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import copy from 'copy-to-clipboard';
import { queryGroup, editGroup } from  'Api/groups';
import {Form, Radio, Modal, Tag, Row, Col } from "antd/lib/index";
import {getCode, domain} from 'Configs/utils';

const RadioGroup = Radio.Group;
const { Content } = Layout;
const confirm = Modal.confirm;
message.config({
    top: 200,
    duration: 2,
    maxCount: 2,
});

export default class GroDetail extends React.Component{
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
                text: sessionStorage.getItem('project_name')
            },
            {
                href: '/user/project/groups',
                text: '组播管理'
            },
            {
                href: '/user/group/detail',
                text: sessionStorage.getItem('group_name')
            }
        ],
        data: {
            id: sessionStorage.getItem('groupId'),
            currentRow: {}
        },
        detail: false,
        toEdit: false,
        radioOption: true,
        radioValue: '是',
    }

    toEdit = () => {
        let DETAIL = {
            addr: getCode(8),
            appsKey: getCode(32),
            nwksKey: getCode(32)
        };
        sessionStorage.setItem('detail', JSON.stringify(DETAIL));
        this.setState({ detail: true, toEdit: true });
    }
    handleCancel = () => {
        this.setState({ toEdit: false, detail: false, });
    }

    editDetail =()=> {
        this.refs.detail.validateFields((err, values)=> {
            if (!err) {
                Modal.confirm({
                    title: '确定要编辑吗？',
                    onOk: ()=> {
                        let req = {
                            ...values,
                            addr: values.addr.replace(/-/g, ''),
                            nwksKey: values.nwksKey.replace(/-/g, ''),
                            appsKey: values.appsKey.replace(/-/g, ''),
                            groupId: sessionStorage.getItem('groupId')
                        };
                        let data = this.state.data;
                        req.id = this.state.data.id;
                        editGroup(this.props.history, req)
                            .then((res)=> {
                                if (!!res) {
                                    this.setState({
                                        data: Object.assign({}, data,{...res}),
                                        edit: !this.state.edit
                                    })
                                    message.success('已编辑！')
                                    this.handleCancel();
                                }else {
                                    Modal.error({
                                        title: '编辑失败！'
                                    })
                                }
                            }).catch(() => {
                            console.log('catch back');
                        })
                    }
                })
            }
        })
    }

    toCopy = (type) => {
        copy(this.state.data[type]);
        message.success('已复制');
    }

    componentDidMount() {
        queryGroup(this.props.history, this.state.data)
            .then((res) => {
                if (!!res) {
                    this.setState({ data: res });
                }
            });
    }


    render() {
        const data = this.state.data;
        const liDiv = (name, value) => {
            return (
                <li key={name}>
                    <span className="list-name">{name}：</span>
                    <span className="list-com">{value}</span>
                </li>
            )
        }

        return(
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {sessionStorage.getItem('group_name')}
                        <Tag color="blue">{sessionStorage.getItem('project_name')}</Tag>
                    </div>
                    <div className="button">
                        <Button type="primary" onClick={this.toEdit}>编辑</Button>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard" style={{paddingBottom: '0px'}}>
                        <ul className="item-detail-list">
                            <li>
                                <i className="iconfont icon-jdsl"></i>
                                <div className="text-con">
                                    <p>节点数量</p>
                                    <h3>{data.deviceSize}</h3>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="dashboard">
                        <div className="title">组播详情</div>
                        <ul className="detail-list clearfix " style={{ marginTop: '24px' }}>
                            {liDiv ("组播名称", data.name)}
                            <li>
                                <span className="list-name">是否加密：</span>
                                <span className="list-com">
                                    <em className={data.encryption == true ? 'able-dot' : 'disable-dot'}>
								    </em>
                                    {data.encryption == true ? '是' : '否'}
                                </span>
                            </li>
                            <li>
                                <span className="list-name">signToken：</span>
                                <span className="list-com">{data.signToken}</span>
                                    <a onClick={this.toCopy.bind(this, "signToken")}
                                       style={{'fontSize': '16px', 'marginLeft': '20px'}}>复制</a>
                            </li>
                            <li className={data.encryption == true ? 'show' : 'hide'}>
                                <span className="list-name">secretKey：</span>
                                <span className="list-com">{data.secretKey}</span>
                                <a onClick={this.toCopy.bind(this, "secretKey")}
                                   style={{'fontSize': '16px', 'marginLeft': '20px'}}>复制</a>
                            </li>
                            <li>
                                <span className="list-name">appsKey：</span>
                                <span className="list-com">{data.appsKey}</span>
                                <a onClick={this.toCopy.bind(this, "nwksKey")}
                                   style={{'fontSize': '16px', 'marginLeft': '20px'}}>复制</a>
                            </li>
                            <li>
                                <span className="list-name">nwksKey：</span>
                                <span className="list-com">{data.nwksKey}</span>
                                <a onClick={this.toCopy.bind(this, "nwksKey")}
                                   style={{'fontSize': '16px', 'marginLeft': '20px'}}>复制</a>
                            </li>
                            {liDiv ("addr", data.addr)}
                            {liDiv ("rx2DR", data.rx2DR)}
                            {liDiv ("rx2Freq", data.rx2Freq)}
                            {liDiv ("fport", data.fport)}
                            {liDiv ("fcntDown", data.fcntDown)}
                            {liDiv ("创建时间", data.createdDate)}
                        </ul>
                    </div>
                    <Modal ref="toEditDetail"
                           visible={this.state.detail}
                           title="编辑组播"
                           maskClosable={false}
                           width={600}
                           centered={true}
                           onCancel={this.handleCancel}
                           onOk={this.editDetail}>
                        <div>
                            <Detail ref='detail' key={new Date()} data={this.state.data}/>
                        </div>
                    </Modal>
                </div>
            </Content>
        )
    }
}

const Detail = Form.create()((props)=>{
    const data = props.data;
    const { nwksKey, appsKey, addr } = JSON.parse(sessionStorage.getItem('detail'));
    const { getFieldDecorator } = props.form;
    const handleChange =(key, num)=> {
        let currentRow = {};
        currentRow[key] = getCode(num);
        props.form.setFieldsValue({
            ...currentRow
        });
    }
    const option = [{
        label: '是',
        value: true
    },{
        label: '否',
        value: false
    }]
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
    return (
        <Form>
            <Form.Item {...layout}
                       label={(<span>组播名称&nbsp;</span>)}>
                {getFieldDecorator('name', {
                    initialValue: String(data.name),
                    rules: [
                        {required: true, message: '请输入组播名称!'},
                        {max: 8, min: 4, message: '长度在4~30位之间，支持中文、英文字母、数字和下划线！'}
                    ],
                })(
                    <Input placeholder="请输入组播名称"/>
                )}
            </Form.Item>
            <Form.Item
                {...layout}
                label="是否加密"
            >
                {getFieldDecorator('encryption', {
                    initialValue: Boolean(data.encryption),
                    rules: [
                        {
                            required: true
                        }
                    ],
                })(
                    <RadioGroup options={option} name="encryption"/>
                )}
            </Form.Item>
            <Form.Item
                label="appsKey" {...layout}>
                <Row gutter={8}>
                    <Col span={20}>
                        {
                            getFieldDecorator('appsKey', {
                                rules: [{
                                    required: true, message: '请输入appsKey！'
                                }, {
                                    pattern: /^([0-9a-fA-F]{4}-){7}[0-9a-fA-F]{4}$/, message: '请输入长度为32的十六进制值！'
                                }],
                                initialValue: String(data.appsKey).replace(/(.{4})/g, '$1-').substring(0, 39),
                                normalize: (value, prev) => {
									if (prev === value+'-') {
										value = value.substring(0, value.length-1);
									}
                                    let string = value.replace(/-/g, '').replace(/\s+/g, '');
                                    return string.length===32?string.replace(/(.{4})/g, '$1-').substring(0, 39):string.replace(/(.{4})/g, '$1-');
                                }
                            })(
                                <Input placeholder="请输入appsKey" />
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'appsKey', 32)} >换一换</Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item
                label="nwksKey" {...layout}>
                <Row gutter={8}>
                    <Col span={20}>
                        {
                            getFieldDecorator('nwksKey', {
                                rules: [{
                                    required: true, message: '请输入nwksKey！'
                                }, {
                                    pattern: /^([0-9a-fA-F]{4}-){7}[0-9a-fA-F]{4}$/, message: '请输入长度为32的十六进制值！'
                                }],
                                initialValue: String(data.nwksKey).replace(/(.{4})/g, '$1-').substring(0, 39),
                                normalize: (value, prev) => {
									if (prev === value+'-') {
										value = value.substring(0, value.length-1);
									}
                                    let string = value.replace(/-/g, '').replace(/\s+/g, '');
                                    return string.length===32?string.replace(/(.{4})/g, '$1-').substring(0, 39):string.replace(/(.{4})/g, '$1-');
                                }
                            })(
                                <Input placeholder="请输入nwksKey" />
                            )
                        }
                    </Col>
                    <Col span={4}>
                        <Button onClick={handleChange.bind(this, 'nwksKey', 32)} >换一换</Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item label="addr" {...layout}>
                <Row gutter={8}>
                    <Col span={20}>
                        {
                            getFieldDecorator('addr', {
                                rules: [{
                                    required: true, message: '请输入addr！'
                                }, {
                                    pattern: /^([0-9a-fA-F]{2}-){3}[0-9a-fA-F]{2}$/, message: '请输入长度为8的十六进制值！'
                                }],
                                initialValue: String(data.addr).replace(/(.{2})/g, '$1-').substring(0, 11),
                                normalize: (value, prev) => {
									if (prev === value+'-') {
										value = value.substring(0, value.length-1);
									}
                                    let string = value.replace(/-/g, '').replace(/\s+/g, '');
                                    return string.length===8?string.replace(/(.{2})/g, '$1-').substring(0, 11):string.replace(/(.{2})/g, '$1-');
                                }
                            })(
                                <Input placeholder="请输入addr"/>
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
                    initialValue: String(data.rx2DR),
                    rules: [
                        {
                            required: true, message: '请输入rx2DR!'
                        }
                    ],
                })(
                    <Input  placeholder="请输入rx2DR！"/>
                )}
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span>rx2Freq&nbsp;</span>)}>
                {getFieldDecorator('rx2Freq', {
                    initialValue: String(data.rx2Freq),
                    rules: [
                        {
                            required: true, message: '请输入rx2Freq!'
                        }
                    ],
                })(
                    <Input  placeholder="请输入rx2Freq！"/>
                )}
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span>fport&nbsp;</span>)}>
                {getFieldDecorator('fport', {
                    initialValue: String(data.fport),
                    rules: [
                        {
                            required: true, message: '请输入fport!'
                        }
                    ],
                })(
                    <Input  placeholder="请输入fport！"/>
                )}
            </Form.Item>
        </Form>
    );
});