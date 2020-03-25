/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/8
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Menu, Icon, Layout, Button } from 'antd';
const { Sider } = Layout;

export default class Sidebar extends React.Component {
	static defaultProps = {
		menus: [
			{
				href: '/user/project/detail',
				icon: 'left-xmxq',
				text: '项目详情',
			},
			{
				href: '/user/project/devices',
				icon: 'left-sbgl',
				text: '设备管理',
			},
			{
				href: '/user/project/groups',
				icon: 'left-zbgl',
				text: '组播管理',
			},
			{
				href: '/user/project/apps',
				icon: 'left-yyjk',
				text: '应用接口',
			},
			{
				href: '/user/project/analysis',
				icon: 'left-sjjk',
				text: '数据分析',
			},
			{
				href: '/user/project/params',
				icon: 'left-wlcs',
				text: '网络参数',
			},
		],
		//from: '/user/projects',
	}

	state = {
		active: this.props.history && this.props.history.location.pathname,
	}

	getMenus =()=> {
		return this.props.menus.map((m)=> {
			return (
				<Menu.Item key={m.href}>
					<i className={`iconLeft ${m.icon}`}></i>
					<span>{m.text}</span>
				</Menu.Item>
			);
		});
	}

	handleMenu =(e)=> {
		this.setState({ active: e.key });
		this.props.history.push(e.key);
	}

	handleBack =()=> {
		let state = this.props.state;
		if (state) {
			this.props.history.push(this.props.from, {...state});
		} else {
			this.props.history.push(this.props.from);
		}
	}

	render() {
		const menus = this.getMenus();
		return (
			<Sider theme="light">
				{
					!!this.props.from?
						<div className="sider-back">
							<Button onClick={this.handleBack} size="large">
								<Icon type="arrow-left" />
								返回列表
							</Button>
						</div>
						:null
				}
				<Menu
					mode="inline"
					onClick={this.handleMenu}
					defaultSelectedKeys={[this.state.active]}
					style={{ height: '100%' }}
				>
					{
						menus
					}
				</Menu>
			</Sider>
		)
	}
}