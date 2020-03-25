import React from 'react';
import {render} from 'react-dom';
import {Form, Layout, Input, Button, Checkbox, Select, Radio, Modal, message} from 'antd';

const {Header, Content, Footer} = Layout;

import {add} from 'Api/user';

const confirm = Modal.confirm;

class AddForm extends React.Component {

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
			if (!err) {
				const _this=this;
				confirm({
					title: '确定要添加吗？',
					onOk: ()=> {
						if (!err) {
							let req = {...values};
							add(_this.props.history, req)
								.then((res) => {
									if (!!res) {
										message.success('已添加！');
										this.props.history.push('/admin/users')
									} else {
										message.error('添加失败！');
									}
								}).catch(() => {
								console.log('catch back');
							})
						}
					}
				})
			}
        })
    }

    handleCancel = () => {
        this.props.history.push('/admin/users');
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次密码要一样哦!');
        } else {
            callback();
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    }

    render() {
        const {getFieldDecorator} = this.props.form;

        const {TextArea} = Input;
        const RadioGroup = Radio.Group;
        const CheckboxGroup = Checkbox.Group;

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
        return (
            <Content className="page-no-side">
                <div className="title">
                    添加用户
                </div>
                <div className="addForm">
                    <Form>
                        <Form.Item {...formItemLayout}
                                   label={(<span>登录账号&nbsp;</span>)}>
                            {getFieldDecorator('username', {
                                rules: [
                                    {required: true, message: '请输入账号!'},
                                    {max: 8, min: 4, message: '账号长度在4~8之间！'}
                                ],
                            })(
                                <Input size="large" placeholder="账户"/>
                            )}
                        </Form.Item>
                        <Form.Item {...formItemLayout}
                                   label={(<span>密码&nbsp;</span>)}>
                            {getFieldDecorator('password', {
                                rules: [
                                    {
                                        required: true, message: '请输入密码!'
                                    },
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
                                rules: [
                                    {
                                        required: true, message: '请输入密码!'
                                    },
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
                                rules: [
                                    {
                                        required: false, message: '请输入联系电话!'
                                    },
                                    {max: 11, min: 11, message: '11位手机号！'}
                                ],
                            })(
                                <Input size="large" type="tel" addonBefore={prefixSelector} placeholder="请输入手机号"/>
                            )}
                        </Form.Item>
                        <Form.Item {...formItemLayout}
                                   label={(<span>公司名称&nbsp;</span>)}>
                            {getFieldDecorator('company', {
                                rules: [
                                    {
                                        required: false, message: '请输入公司名称!'
                                    },
                                    {max: 30, min: 0, message: '长度在0~30之间！'}
                                ],
                            })(
                                <Input size="large" type="text" placeholder="请输入公司名称"/>
                            )}
                        </Form.Item>

                        <Form.Item {...formItemLayout}
                                   label={(<span>限制网关数量&nbsp;</span>)}>
                            {getFieldDecorator('gatewayLimit', {
                                rules: [
                                    {
                                        required: true, message: '请输入0~9999999的整数!'
                                    },
                                    {max: 7, min: 0, message: '长度在0~9999999之间！'}
                                ],
                            })(
                                <Input size="large" placeholder="请输入0~9999999的整数"/>
                            )}
                        </Form.Item>
                        <Form.Item {...formItemLayout}
                                   label={(<span>限制节点数量&nbsp;</span>)}>
                            {getFieldDecorator('deviceLimit', {
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
                                rules: [
                                    {
                                        required: false, message: '请输入公司名称!'
                                    },
                                    {max: 100, min: 0, message: '长度在0~100之间！'}
                                ],
                            })(
                                <TextArea rows={4} placeholder="请输入备注信息（0-100个字符）"/>
                            )}
                        </Form.Item>
                        <Form.Item>
                            <Button size="large" onClick={this.handleCancel}>返回列表页</Button>
                            <Button type="primary" size="large" onClick={this.handleSubmit}
                                    style={{marginLeft: 24}}>提交</Button>
                        </Form.Item>
                    </Form>
                </div>
            </Content>
        )
    }
}

const AddItem = Form.create({})(AddForm);
export default AddItem;