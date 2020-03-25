/**
 * FileName: admin
 * Auth: Linn
 * Created at: 2018/8/3
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import {
	Link,
	NavLink,
	Switch,
	Redirect
} from 'react-router-dom';
import { Layout, Menu, Icon, Modal, Button, Form, Input, Popconfirm } from 'antd';
import { edit } from 'Api/user';

const { Header } = Layout;
const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;

export default class AdminHeader extends React.Component {

	state = {
		active: 'users',
		active2: '123',
		visible: false,
		fields: {
			username: {
				value: sessionStorage.getItem('name'),
			},
			password: {
				value: null,
			},
			confirmPassword: {
				value: null,
			}
		},
		pop: false,
	}

	handleChange =(changeFields)=> {
		console.log('changeFields', changeFields);
		this.setState(({fields})=>({
			fields: {...fields, ...changeFields},
		}));
	}

	handleClick =(e)=> {
		this.setState({active2:'123'});
		if (e.item.props.name === 'out') {
			sessionStorage.clear();
			this.props.history.push('/login');
		} else {
			this.showModal();
		}
	}

	showModal =()=> {
		this.setState({ visible: true });
	}

	toSubmit =()=> {
		let user = this.state.fields;
		let history = this.props.history;
		this.refs.edit.validateFields((err, values) => {
			if (!err) {
				confirm({
					title: '确定要修改密码吗？',
					content: '修改密码后，需要重新登录',
					style: {
						centered: true
					},
					onOk() {
						let req = {
							password: user.password.value,
						}
						return edit(history, req)
							.then((res)=> {
								if (!!res) {
									Modal.success({
										title: '已修改！',
										content: '请返回重新登录',
										centered: true,
										onOk: ()=> {
											sessionStorage.clear();
											history.push('/login');
										},
										onCancel: ()=> {
											sessionStorage.clear();
											history.push('/login');
										}
									})
								}
							}).catch(()=>{})
					},
					onCancel() {
					},
				});
			}
		});

	}

	handleCancel =()=> {
		this.refs.edit.resetFields(['password', 'confirmPassword']);
		this.setState({ visible: false });
	}

	handleMenu =()=> {
		let history = this.props.history;
		if (history.location.pathname != '/admin/users') {
			this.props.history.push('/admin/users');
		}
	}

	render() {
		let fields = this.state.fields;
		return (
			<Header className="header">
				<div className="header-logo"></div>
				<Menu
					theme="dark"
					mode="horizontal"
					defaultSelectedKeys={['users']}
					onClick={this.handleMenu}
					style={{ lineHeight: '64px', background: 'none',
						fontSize: '16px',
						float: 'left', paddingLeft: '144px' }}
				>
					<Menu.Item key="users">用户管理</Menu.Item>
				</Menu>
				<Menu
					theme="dark"
					mode="horizontal"
					selectedKeys={[this.state.active2]}
					onClick={this.handleClick}
					style={{ lineHeight: '64px', background: 'none',
						fontSize: '16px',
						float: 'right', paddingRight: '0px' }}
				>
					<SubMenu title={<span><Icon type="user" />{sessionStorage.getItem('name')}</span>}>
						<Menu.Item name="edit">个人中心</Menu.Item>
						<Menu.Item name="out">退出</Menu.Item>
					</SubMenu>
				</Menu>
				<Modal
					title="个人中心"
					centered={true}
					visible={this.state.visible}
					onOk={this.toSubmit}
					onCancel={this.handleCancel}
				>
					<Edit ref="edit" {...fields} onChange={this.handleChange}/>
				</Modal>
			</Header>
		)
	}
}

const Edit = Form.create({
	onFieldsChange(props, changedFields) {
		props.onChange(changedFields);
	},
	mapPropsToFields(props) {
		return {
			username: Form.createFormField({
				...props.username,
				value: props.username.value,
			}),
			password: Form.createFormField({
				...props.password,
				value: props.password.value,
			}),
			confirmPassword: Form.createFormField({
				...props.confirmPassword,
				value: props.confirmPassword.value,
			}),
		};
	},
	onValuesChange(_, values) {
		console.log(values);
	},
})((props) => {
	const { getFieldDecorator } = props.form;

	const handleConfirm = (rule, value, callback)=> {
		if (value === props.password.value) {
			callback();
		} else {
			callback('两次密码不一致！')
		}
	}
	return (
		<Form layout="horizontal">
			<Form.Item label="登录账号">
				{getFieldDecorator('username')(
					<Input size="large" readOnly />
				)}
			</Form.Item>
			<Form.Item label="密码"
					   hasFeedback={true}>
				{getFieldDecorator('password', {
					rules: [
						{
							required: true, message: '请输入密码!'
						},
						{ max: 16, min: 4, message: '密码长度在4~16之间！'}
					],
				})(
					<Input size="large" type="password" placeholder="请输入" />
				)}
			</Form.Item>
			<Form.Item label="确认密码"
					   hasFeedback={true}>
				{getFieldDecorator('confirmPassword', {
					rules: [
						{
							required: true, message: '请输入确认密码!'
						},
						{ validator: handleConfirm }
					],
				})(
					<Input size="large" type="password" placeholder="请输入" />
				)}
			</Form.Item>
		</Form>
	);
});