
/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/7/31
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import {
	BrowserRouter as Router,
	Route,
	Link,
	NavLink,
	Switch,
	Redirect
} from 'react-router-dom';
import { Layout } from 'antd';
import Login from 'Pages/login';
import AdminHeader from 'Commons/header/admin';
import UserHeader from 'Commons/header/user';
import Sidebar from 'Commons/sidebar/index';
import LoraFooter from 'Commons/footer/index';

import Users from 'Pages/admin/index';
import AddItem from "../pages/admin/add";
import Detail from 'Pages/admin/detail';


import Dashboard from 'Pages/user/dashboard';
import Files from 'Pages/user/files';
import Four from 'Pages/user/404';
import Five from 'Pages/user/500';
import Projects from 'Pages/user/projects/index';
import ProDetail from 'Pages/user/projects/detail';
import Devices from 'Pages/user/projects/devices/index';
import Groups from 'Pages/user/projects/groups/index';
import Apps from 'Pages/user/projects/apps';
import Analysis from 'Pages/user/projects/analysis';
import Params from 'Pages/user/projects/params';


import NodeDetail from 'Pages/user/projects/devices/node/detail';
import Channels from 'Pages/user/projects/devices/node/channels';
import NodeDebug from 'Pages/user/projects/devices/node/debug';
import Mac from 'Pages/user/projects/devices/node/mac';
import NodeData from 'Pages/user/projects/devices/node/nodeData';
import NodeDown from 'Pages/user/projects/devices/node/down';
import NodeUp from 'Pages/user/projects/devices/node/up';

import GatewayDetail from 'Pages/user/projects/devices/gateway/detail';
import GateConfig from 'Pages/user/projects/devices/gateway/config';
import UpLine from 'Pages/user/projects/devices/gateway/upLine';
import DownLine from 'Pages/user/projects/devices/gateway/downLine';
import GateDate from 'Pages/user/projects/devices/gateway/gateData';
import Log from 'Pages/user/projects/devices/gateway/log';

import SystemList from 'Pages/user/system/index';
import FirmHistory from 'Pages/user/system/firmHistory';
import Bands from 'Pages/user/system/bands';
import SystemSider from 'Commons/sidebar/systemSider';

import GroData from 'Pages/user/projects/groups/data';
import GroDebug from 'Pages/user/projects/groups/debug';
import GroDetail from 'Pages/user/projects/groups/detail';
import GroNode from 'Pages/user/projects/groups/node';

const { Header, Footer, Sider, Content } = Layout;

export default class AppRoute extends React.Component {

	render() {
		return (
			<Router>
				<div>
					<Switch>
						<Route exact path='/login' component={Login} />
						<Route path='/admin' component={Admin} />
						<Route path='/user' component={User} />
						<Route path="/" component={Auth} />
					</Switch>
				</div>
			</Router>
		)
	}
}

class Admin extends React.Component {

	render() {
		let token = sessionStorage.getItem('token');
		if (!token) {
			return <Redirect to="/login" />
		}
		window.scrollTo(0,0)
		return (
			<div className="wrapper">
				<Layout className="layout">
					<AdminHeader history={this.props.history}/>
					<Switch>
						<Route exact path='/admin/users' component={Users} />
						<Route exact path='/admin/add' component={AddItem} />
						<Route exact path='/admin/detail' component={Detail} />
					</Switch>
					<LoraFooter />
				</Layout>
			</div>
		)
	}
}

class User extends React.Component {

	render() {
		let token = sessionStorage.getItem('token');
		if (!token) {
			return <Redirect to="/login" />
		}
		window.scrollTo(0,0)
		return (
			<div className="wrapper">
				<Layout className="layout">
					<UserHeader history={this.props.history}/>
					<Switch>
						<Route exact path='/user/dashboard' component={Dashboard} />
						<Route exact path='/user/projects' component={Projects} />
						<Route path='/user/project' component={Project} />
						<Route path='/user/system' component={System} />
						<Route path='/user/node' component={Node} />
						<Route path='/user/gateway' component={Gateway} />
						<Route path='/user/groups' component={Groups} />
						<Route path='/user/group' component={Group} />
						<Route exact path='/user/files' component={Files} />
						<Route path='/user/404' component={Four} />
						<Route path='/user/500' component={Five} />
					</Switch>
					<LoraFooter />
				</Layout>
			</div>
		)
	}
}

class Node extends React.Component {

	render() {
		const params = {
			menus: [
				{
					href: '/user/node/detail',
					icon: 'left-sbxq',
					text: '设备详情',
				},
				{
				 	href: '/user/node/channels',
				 	icon: 'left-xdlb',
				 	text: '信道列表',
				},
				{
					href: '/user/node/debug',
					icon: 'left-jdts',
					text: '节点调试',
				},
				{
					href: '/user/node/demand',
					icon: 'left-mac',
					text: 'MAC命令',
				},
				{
					href: '/user/node/uplink',
					icon: 'left-sxtj',
					text: '上行统计',
				},
				{
					href: '/user/node/downlink',
					icon: 'left-xxtj',
					text: '下行统计',
				},
				{
					href: '/user/node/data',
					icon: 'left-cksj',
					text: '查看数据',
				},
			],
			from: '/user/project/devices',
			state: {type: 'node'}
		};
		return (
			<Layout>
				<Sidebar {...params} history={this.props.history}>
				</Sidebar>
				<Layout>
					<Route exact path="/user/node/detail" component={NodeDetail} />
					<Route exact path="/user/node/channels" component={Channels} />
					<Route exact path="/user/node/debug" component={NodeDebug} />
					<Route exact path="/user/node/demand" component={Mac} />
					<Route exact path="/user/node/uplink" component={NodeUp} />
					<Route exact path="/user/node/downlink" component={NodeDown} />
					<Route exact path="/user/node/data" component={NodeData} />
				</Layout>
			</Layout>
		)
	}
}

class Gateway extends React.Component {
    componentWillUnmount() {
        sessionStorage.removeItem('gateway');
        sessionStorage.removeItem('gateway_name');
    }
	render() {
        let settings = {
            menus: [
                {
                    href: '/user/gateway/detail',
                    icon: 'left-wgxq',
                    text: '网关详情',
                },
                {
                    href: '/user/gateway/config',
                    icon: 'left-wgpz',
                    text: '网关配置',
                },
                {
                    href: '/user/gateway/upLine',
                    icon: 'left-sxtj',
                    text: '上行统计',
                },
                {
                    href: '/user/gateway/downLine',
                    icon: 'left-xxtj',
                    text: '下行统计',
                },
                {
                    href: '/user/gateway/gateData',
                    icon: 'left-cksj',
                    text: '查看数据',
                },
                {
                    href: '/user/gateway/log',
                    icon: 'icon_gwlog',
                    text: '网关日志',
                }
            ],
            from: '/user/project/devices',
			state: {type: 'gateway'}
		};
		return (
			<Layout>
				<Sidebar history={this.props.history} {...settings}/>
				<Layout>
					<Route exact path="/user/gateway/detail" component={GatewayDetail} />
					<Route exact path="/user/gateway/config" component={GateConfig} />
					<Route exact path="/user/gateway/upLine" component={UpLine} />
					<Route exact path="/user/gateway/downLine" component={DownLine} />
					<Route exact path="/user/gateway/gateData" component={GateDate} />
					<Route exact path="/user/gateway/log" component={Log} />
				</Layout>
			</Layout>
		)
	}
}

class Group extends React.Component {

	componentWillUnmount() {
		sessionStorage.removeItem('groupId');
	}

	render() {
		const groSidebar = {
			menus: [
                {
                    href: '/user/group/detail',
                    icon: 'left-zbxq',
                    text: '组播详情',
                },
                {
                    href: '/user/group/node',
                    icon: 'left-jd',
                    text: '组播节点',
                },
                {
                    href: '/user/group/debug',
                    icon: 'left-zbjd',
                    text: '组播调试',
                },
                {
                    href: '/user/group/data',
                    icon: 'left-cksj',
                    text: '查看数据',
                },
			],
			from: '/user/project/groups',
		};
		return (
			<Layout>
                <Sidebar history={this.props.history} {...groSidebar}/>
				<Layout>
					<Route exact path="/user/group/data" component={GroData} />
					<Route exact path="/user/group/debug" component={GroDebug} />
					<Route exact path="/user/group/detail" component={GroDetail} />
					<Route exact path="/user/group/node" component={GroNode} />
				</Layout>
			</Layout>
		)
	}
}

class Project extends React.Component {

	componentWillUnmount() {
		let path = this.props.history.location.pathname;
		let toClear = path.indexOf('group')<0&&path.indexOf('node')<0&&path.indexOf('gateway')<0&&path.indexOf('project')<0;
		if (toClear) {
            sessionStorage.removeItem('project');
            sessionStorage.removeItem('project_name');
            sessionStorage.removeItem('bandId');
		}
	}

	render() {
		let history = this.props.history;
		let state = history.location.state;
		if (!state&&!sessionStorage.getItem('project')) {
			return <Redirect to="/404" />;
		}
		let settings = {
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
			from: '/user/projects',
		}
		return (
			<Layout>
				<Sidebar history={this.props.history} {...settings}/>
				<Route exact path="/user/project/detail" component={ProDetail} />
				<Route exact path="/user/project/devices" component={Devices} />
				<Route exact path="/user/project/groups" component={Groups} />
				<Route exact path="/user/project/apps" component={Apps} />
				<Route exact path="/user/project/analysis" component={Analysis} />
				<Route exact path="/user/project/params" component={Params} />
			</Layout>
		)
	}
}

class System extends React.Component {

	render() {
		return (
			<Layout>
				<SystemSider history = {this.props.history}/>
				<Route exact path="/user/system" component={SystemList} />
				<Route exact path="/user/system/firmHistory" component={FirmHistory} />
                <Route exact path="/user/system/bands" component={Bands} />
			</Layout>
		)
	}
}

class Auth extends React.Component {

	render() {
		let token = sessionStorage.getItem('token');
		let role = sessionStorage.getItem('role');
		if (!!token) {
			if (role === 'ROLE_ROOT') {
				return (
					<Redirect to="/admin/users" />
				);
			} else if (role === 'ROLE_USER') {
				return (
					<Redirect to="/user/dashboard" />
				);
			} else {
				return (
					<Redirect to="/login" />
				);
			}
		} else {
			return (
				<Redirect to="/login" />
			);
		}
	}
}
