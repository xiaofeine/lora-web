/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import {Layout, Tag, Popconfirm, Badge, Modal, Button, DatePicker, message} from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import echarts from 'echarts';
import $ from 'jquery';
import moment from 'moment';
import { queryNode, getBaseDay, getBaseHour, getBaseHours } from 'Api/node';

const {Content} = Layout;
const {RangePicker} = DatePicker;

export default class NodeDown extends React.Component {

    componentDidMount() {
		let chart = echarts.init(document.getElementById('down'));
		chart.showLoading('default', {
			text: 'loading……',
			color: '#1890ff',
			textColor: '#1890ff',
			maskColor: 'rgba(255, 255, 255, 0.8)',
			zlevel: 0,
		});
		this.setState({ chart });
		let history = this.state.history;
		let node = this.state.node;
		let p1 = queryNode(history, this.state.node);
		let p2 = getBaseHour(history, {deviceId: node.id});
		Promise.all([p1, p2]).then((res)=> {
			let breads = [];
			let sub = this.state.sub;
			if (!(res[0]&&res[1])) {
				message.error('请求失败');
			} else {
				if (!!res[0]) {
					breads = [
						{
							href: 'dashboard',
							text: '首页',
						},
						{
							href: '/user/projects',
							text: '项目管理',
						},
						{
							href: '/user/project/detail',
							text: res.projectName,
						},
						{
							href: '/user/project/devices',
							text: '设备管理'
						},
						{
							href: '/user/node/detail',
							text: res.devEui
						},
						{
							href: '/user/node/downlink',
							text: '下行统计'
						},
					];
				}
				if (!!res[1]) {
					this.toPutChart(res[1]);
				}
				this.setState({ breads, sub, down: res[1], node: res[0] })
			}
		}).catch((res)=> {
			message.error('请求失败');
		});
		window.onresize =()=> {
			let h = $('#down').width*1.2;
			chart.resize(undefined, h);
		}
    }

	componentWillUnmount() {
		window.onresize = ()=> {}
	}

	toPutChart =(res=this.state.down)=> {
		let myChart = this.state.chart;
		myChart.hideLoading();
		let option = {
			tooltip : {
				trigger: 'axis',
				axisPointer : {
					type : 'shadow'
				}
			},
			legend: {
				data:['确认帧','非确认帧',]
			},
			color: ['#3aa0ff', '#36cbcb', '#2e9aff'],
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis : [
				{
					type : 'category',
					data : Array.from(res, r=>r.timeScale)
				}
			],
			yAxis : [
				{
					type : 'value',
					name: '条'
				}
			],
			series : [
				{
					name:'确认帧',
					type:'bar',
					stack: '确认帧',
					data: Array.from(res, r=>r.confirmedDataDown)
				},
				{
					name:'非确认帧',
					type:'bar',
					data: Array.from(res, r=>r.unConfirmedDataDown)
				},
			]
		};
		myChart.setOption(option);
		myChart.resize(undefined, $('#down').width*1.2);
	}

	toChange =(type, b)=> {
		let chart = this.state.chart;
		let node = this.state.node;
		let current = this.state.current;
		let history = this.props.history;
		chart.showLoading('default', {
			text: 'loading……',
			color: '#1890ff',
			textColor: '#1890ff',
			maskColor: 'rgba(255, 255, 255, 0.8)',
			zlevel: 0,
		});
		let request;
		switch (type) {
			case 1:
				request = getBaseHour(history, {deviceId: node.id}, true);
				break;
			case 12:
				request = getBaseHours(history, {deviceId: node.id, hour: 12}, true);
				break;
			case 24:
				request = getBaseHours(history, {deviceId: node.id, hour: 24}, true);
				break;
			default:
				request = getBaseDay(history, {id: node.id, request: {startDate: b[0], endDate: b[1]}}, true);
		}
		request.then((res)=> {
			if (!!res) {
				this.toPutChart(res);
				current = type;
				this.setState({ down: res, current });
			}
		});
	}

	toPick =()=> {
		$('#pick').show();
		$(`#pick .ant-calendar-picker-icon`).trigger('click');
	}

	handlePick =(a, b)=> {
		this.toChange(4, b);
	}

    state = {
		breads: [],
        projectName: sessionStorage.getItem('project_name'),
        node: { id: sessionStorage.getItem('node') },
		current: 1,
    }

	disabledDate =(current)=> {
		let start = moment().subtract(sessionStorage.getItem('day'), 'day');
		return (current < start)||(current>moment());
	}

    render() {
        const node = this.state.node;
        const current = this.state.current;
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {node.devEui}
                        <Tag color="blue">{node.projectName}</Tag>
                    </div>
                </div>
				<div className="content-detail">
					<div className="dashboard node-up">
						<div className="dashboard">
							<div className="title">
								<div className="text">
									下行帧统计
								</div>
								<div className="buttons">
									<Button ghost={true}
											onClick={this.toChange.bind(this, 1)}
											className={current===1?'current':''}>
										最近一小时
									</Button>
									<Button ghost={true}
											onClick={this.toChange.bind(this, 12)}
											className={current===12?'current':''}>
										最近12小时
									</Button>
									<Button ghost={true}
											onClick={this.toChange.bind(this, 24)}
											className={current===24?'current':''}>
										最近24小时
									</Button>
									<Button ghost={true}
											onClick={this.toPick.bind(this, 1)}
											className={current===4?'current':''}>
										自定义
									</Button>
								</div>
							</div>
							<div className="range-pick">
								<RangePicker id="pick"
											 disabledDate={this.disabledDate}
											 onChange={this.handlePick.bind(this, 1)}
											 style={{display: 'none'}}/>
							</div>
							<div id="down" className="chart">

							</div>
						</div>
					</div>
				</div>
            </Content>
        )
    }
}