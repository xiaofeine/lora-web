import React from 'react';
import {render} from 'react-dom';
import {Form, Layout, Input, Button, Tag, Select, Breadcrumb, Modal, message} from 'antd';
import {queryUser, editUser} from 'Api/user';
import {Checkbox, Radio} from "antd/lib/index";


const confirm = Modal.confirm;
const {Content, Header} = Layout;

const {TextArea} = Input;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

class Detail extends React.Component {
    state = {
        user: {...this.props.history.location.state.user},
        edit: this.props.history.location.state.edit || false,
    }

    componentDidMount() {
        queryUser(this.props.history, this.state.user)
            .then((res) => {
                if (!!res) {
                    this.setState({user: res});
                }
            });
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次密码要一样!');
        } else {
            callback();
        }
    }

    toIndex = () => {
        this.props.history.push('/admin/users');
    }

    toEdit = () => {
        this.setState(() => ({
            edit: !this.state.edit
        }));
    }

    toDetail = () => {
        this.props.history.push('/admin/detail')
    }

    toIndex = () => {
        this.props.history.push('/admin/users');
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                confirm({
                    title: '确定要修改吗？',
                    onOk:() => {
                        if (!err) {
                            let req = {...values};
                            req.id = this.state.user.id;
                            editUser(this.props.history, req)
                                .then((res) => {
                                    if (!!res) {
                                        message.success('已修改！');
                                        this.setState({
                                            user: res,
                                            edit: !this.state.edit
                                        })
                                    } else {
                                        message.error(res.msg||'编辑失败!');
                                    }
                                }).catch(() => {
                                console.log('catch back');
                            })
                        }

                    }

                })
            }
        });
    }

    render() {
        const {getFieldDecorator,} = this.props.form;
        const user = this.state.user;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 7},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 17},
            },
        };
        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: '86',
        })(
            <Select style={{width: 70}}>
                <Option value="86">+86</Option>
                <Option value="87">+87</Option>
            </Select>
        );
        const coreNetworks = ['LoRaWAN', 'NB_IOT', 'Mesh'];
        let userChange;
        if (!this.state.edit){
            userChange = (
                <Button type="primary" onClick={this.toEdit} style={{float: 'right'}}>编辑</Button>
            )
        } else{
            userChange = (
                <Button type="primary" onClick={this.toEdit} style={{float: 'right'}}>详情</Button>
            )
        }
        let userMessage;
        if (!this.state.edit) {
            userMessage = (
                <div>
                    <div className="detail-con">
                        <ul className="detail-list clearfix">
                            <li>
                                <span className="list-name">账号：</span>
                                <span className="list-com">{user.username}</span>
                            </li>
                            <li>
                                <span className="list-name">联系人：</span>
                                <span className="list-com">{user.name}</span>
                            </li>
                            <li>
                                <span className="list-name">联系方式：</span>
                                <span className="list-com">{user.mobile}</span>
                            </li>
                            <li>
                                <span className="list-name">公司名称：</span>
                                <span className="list-com">{user.company}</span>
                            </li>
                            <li>
                                <span className="list-name">限制节点数量：</span>
                                <span className="list-com">{user.deviceLimit}</span>
                            </li>
                            <li>
                                <span className="list-name">限制网关数量：</span>
                                <span className="list-com">{user.gatewayLimit}</span>
                            </li>
                            <li>
                                <span className="list-name">核心网络：</span>
                                <span className="list-com">
                                    <em>
                                        {
                                            this.state.user.coreNetworks.map((val, index) => {
                                                return (
                                                    <Tag key={index} color="#108ee9">{val}</Tag>
                                                )
                                            })
                                        }
                                    </em>
                                </span>
                            </li>
                            <li>
                                <span className="list-name">创建时间：</span>
                                <span className="list-com">{user.createdDate}</span>
                            </li>
                            <li>
                                <span className="list-name">备注：</span>
                                <span className="list-com">{user.remark}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        } else {
            userMessage = (
                <div>
                    <div className="title" style={{padding: '24px 32px', fontSize: '16px', height: '24px', color: 'rgba(0,0,0,0.85)', lineHeight: '24px',}}>
                        编辑用户
                    </div>
                    <div className="addForm">
                        <Form>
                            <Form.Item {...formItemLayout}
                                       label={(<span>登录账号&nbsp;</span>)}>
                                {getFieldDecorator('username', {
                                    initialValue: String(user.username),
                                    rules: [
                                        {required: true, message: '请输入账号!'},
                                        {max: 8, min: 4, message: '账号长度在4~8之间！'}
                                    ],
                                })(
                                    <Input size="large" placeholder="账户" disabled={true} />
                                )}
                            </Form.Item>
                            <Form.Item {...formItemLayout}
                                       label={(<span>密码&nbsp;</span>)}>
                                {getFieldDecorator('password', {
                                    value: user.password,
                                    rules: [
                                        {max: 16, min: 4, message: '密码长度在4~16之间！'},
                                        {
                                            validator: this.validateToNextPassword,
                                        }
                                    ],
                                })(
                                    <Input size="large" type="password" placeholder="密码"/>
                                )}
                            </Form.Item>
                            <Form.Item {...formItemLayout}
                                       label={(<span>确认密码&nbsp;</span>)}>
                                {getFieldDecorator('rePassword', {
                                    value: user.rePassword,
                                    rules: [
                                        {max: 16, min: 4, message: '密码长度在4~16之间！'},
                                        {validator: this.compareToFirstPassword,}
                                    ],
                                })(
                                    <Input size="large" type="password" placeholder="确认密码"/>
                                )}
                            </Form.Item>
                            <Form.Item {...formItemLayout}
                                       label={(<span>联系人&nbsp;</span>)}>
                                {getFieldDecorator('name', {
                                    initialValue: String(user.name),
                                    rules: [
                                        {
                                            required: true, message: '请输入密码!'
                                        },
                                        {max: 16, min: 1, message: '长度在1~16之间！'}
                                    ],
                                })(
                                    <Input size="large" placeholder="请输入1~16位字符"/>
                                )}
                            </Form.Item>
                            <Form.Item {...formItemLayout}
                                       label={(<span>联系电话&nbsp;</span>)}>
                                {getFieldDecorator('mobile', {
                                    initialValue: user.mobile,
                                    rules: [
                                        {
                                            required: false, message: '请输入联系电话!'
                                        },
                                        {max: 11, min: 11, message: '请输入11位手机号！'}
                                    ],
                                })(
                                    <Input size="large" type="tel" addonBefore={prefixSelector} placeholder="请输入手机号"/>
                                )}
                            </Form.Item>
                            <Form.Item {...formItemLayout}
                                       label={(<span>公司名称&nbsp;</span>)}>
                                {getFieldDecorator('company', {
                                    initialValue: user.company,
                                    rules: [
                                        {
                                            required: false, message: '请输入公司名称!'
                                        },
                                        {max: 30, min: 1, message: '长度在0~30之间！'}
                                    ],
                                })(
                                    <Input size="large" type="text" placeholder="请输入公司名称"/>
                                )}
                            </Form.Item>

                            <Form.Item {...formItemLayout}
                                       label={(<span>限制网关数量&nbsp;</span>)}>
                                {getFieldDecorator('gatewayLimit', {
                                    initialValue: String(user.gatewayLimit),
                                    rules: [
                                        {
                                            required: true, message: '请输入0~9999999的整数!'
                                        },
                                        {max: 7, min: 1, message: '数值在0~9999999之间！'}
                                    ],
                                })(
                                    <Input size="large" placeholder="请输入0~9999999的整数"/>
                                )}
                            </Form.Item>
                            <Form.Item {...formItemLayout}
                                       label={(<span>限制节点数量&nbsp;</span>)}>
                                {getFieldDecorator('deviceLimit', {
                                    initialValue: String(user.deviceLimit),
                                    rules: [
                                        {
                                            required: true, message: '请输入0~9999999的整数!'
                                        },
                                        {max: 7, min: 0, message: '长度在0~9999999之间！'}
                                    ],
                                })(
                                    <Input size="large" type="num" placeholder="请输入0~9999999的整数"/>
                                )}
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="核心网络"
                            >
                                {getFieldDecorator('coreNetworks', {
                                    initialValue: user.coreNetworks,
                                    rules: [
                                        {
                                            required: true
                                        }
                                    ],
                                })(
                                    <CheckboxGroup options={coreNetworks}/>
                                )}
                            </Form.Item>
                            <Form.Item className="textarea" {...formItemLayout}
                                       label={(<span>备注&nbsp;</span>)}>
                                {getFieldDecorator('remark', {
                                    initialValue: user.remark,
                                    rules: [
                                        {
                                            required: false, message: '请输入公司名称!'
                                        },
                                        {max: 100, min: 0, message: '长度在0~100之间！'}
                                    ],
                                })(
                                    <TextArea rows={4} placeholder="请输入备注信息（0-100个字符）" />
                                )}
                            </Form.Item>
                            <Form.Item>
                                <Button size="large" onClick={this.toIndex}>返回列表页</Button>
                                <Button type="primary" size="large" onClick={this.handleSubmit}
                                        style={{marginLeft: 24}}>提交</Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            )
        }
        return (
            <Layout className="detail-box">
                <div className="detail-title">
                    <Breadcrumb >
                        <Breadcrumb.Item onClick={this.toIndex} style={{cursor: 'pointer'}}>用户管理</Breadcrumb.Item>
                        <Breadcrumb.Item>用户详情</Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{marginTop: '18px'}}>
                        <span className="title">用户详情 </span>
                        <span className="title" style={{paddingLeft: '15px'}}>{this.state.user.username}</span>
                        {userChange}
                    </div>
                </div>

                <Content>
                    {userMessage}
                </Content>
            </Layout>
        )
    }
}

export default Form.create()(Detail)

