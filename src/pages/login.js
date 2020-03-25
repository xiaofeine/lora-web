/**
 * FileName: login
 * Auth: Linn
 * Created at: 2018/7/31
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import { createCode } from 'Configs/utils';
import { login } from 'Api/user';

class LoginForm extends React.Component {

	state = {
		code: '获取验证码',
		loading: false,
	}

	getCode =()=> {
		let code = createCode(4);
		this.setState({ code });
	}

	handleCode =(rule, value, callback)=> {
		if (!value) {
			callback();
		}
		if (!!value &&(this.state.code.toLowerCase() === value.toLowerCase())) {
			callback()
		} else {
			callback('验证码不正确！')
		}
	}

	componentDidMount() {
		this.getCode();
	}

	handleSubmit =(e)=> {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.setState({ loading: true });
				let req = {...values};
				delete req.captcha;
				login(this.props.history, req)
					.then((res)=> {
						this.setState({ loading: false });
						if (!!res) {
							sessionStorage.setItem('role', res.role);
							sessionStorage.setItem('token', res.jwt);
							sessionStorage.setItem('name', req.username);
							if (res.role === 'ROLE_ROOT') {
								this.props.history.push('/admin/users');
							} else {
								this.props.history.push('/user/dashboard');
							}
						} else {
							this.getCode();
							this.props.form.resetFields(['captcha']);
						}
					}).catch(()=>{this.setState({ loading: false });this.getCode();this.props.form.resetFields(['captcha']);})
			}
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<div className="login-wrap">
				<div className="login-left">
				</div>
				<div className="login-right">
					<div className="login-logo">
					</div>
					<div className="login-form">
						<Form>
							<Form.Item
								hasFeedback={true}>
								{getFieldDecorator('username', {
									rules: [
										{ required: true, message: '请输入账号!' },
										{ max: 8, min: 4, message: '账号长度在4~8之间！'}
									],
								})(
									<Input size="large" prefix={<Icon type="user" />} placeholder="账户" />
								)}
							</Form.Item>
							<Form.Item
								hasFeedback={true}>
								{getFieldDecorator('password', {
									rules: [
										{
											required: true, message: '请输入密码!'
										},
										{ max: 16, min: 4, message: '密码长度在4~16之间！'}
									],
								})(
									<Input size="large" prefix={<Icon type="lock" />} type="password" placeholder="密码" />
								)}
							</Form.Item>
							<div className="clearfix">
								<Form.Item style={{width: '55%', float: 'left'}}
									hasFeedback={true}>
									{getFieldDecorator('captcha', {
										rules: [
											{
												required: true, message: '请输入验证码!'
											},
											{ validator: this.handleCode }
										],
									})(
										<Input size="large"
											   autoComplete="off"
											   prefix={<Icon type="mail" />}
											   type="captcha" placeholder="验证码" />
									)}
								</Form.Item>
								<Button size="large" style={{width: '40%', float: 'left', right: 0, marginLeft: '5%'}}
										onClick={this.getCode}>
									{this.state.code}
								</Button>
							</div>
							<Form.Item>
								<Button type="primary" size="large"
										loading={this.state.loading}
										htmlType="submit"
										onClick={this.handleSubmit} style={{width: '100%'}}>
									登 录
								</Button>
							</Form.Item>
						</Form>
					</div>
				</div>
			</div>
		)
	}
}

const Login = Form.create({})(LoginForm);
export default Login;