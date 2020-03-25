/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import {Layout, Tag, Popconfirm, Badge, Modal, Row, Col, Spin, Button, DatePicker } from 'antd';
import echarts from 'echarts';
import moment from 'moment';
import $ from 'jquery';
import { gradientColor } from 'Configs/utils';
import LoraBread from 'Commons/breadcrumb/index';

import {getBaseDay, getBaseHours, getBaseHour, getFreqDay, getFreqHours, getSDay, getSHours} from 'Api/project';
const { Content } = Layout;
const {RangePicker} = DatePicker;


export default class Analysis extends React.Component {

	init =()=> {
		let data = {};
		let projectId = this.state.projectId;
		let list = ['有效数据包统计', '网关在线率', '速率统计', '频点分布'];
		let disabledDate =(current)=> {
			let start = moment().subtract(sessionStorage.getItem('day'), 'day');
			return (current < start)||(current>moment());
		};
		for(let i=1; i<7; i++) {
			data['chart'+i] = {
				disabledDate,
				projectId,
				up: 'up'+i,
				pick: 'pick'+i,
				title: list[i-1],
			};
		}
		return data;
	}

	state = {
		breads: [
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
				text: sessionStorage.getItem('project_name'),
			}
		],
		projectName: sessionStorage.getItem('project_name'),
		projectId: sessionStorage.getItem('project'),
	}

	componentDidMount() {
		window.onresize =()=> {
			for (let i=1; i<5; i++) {
				this.refs['chart'+i].resize();
			}
		}
	}

	componentWillUnmount() {
		window.onresize =()=>{}
	}

	render() {
		let chats = this.init();
		return (
			<Content>
				<div className="detail-bread">
					<LoraBread history={this.props.history} breads={this.state.breads}/>
					<div className="title">
						数据分析
						<Tag color="blue">{this.state.projectName}</Tag>
					</div>
				</div>
				<div className="content-detail node-up">
					<div className="charts">
						<Row gutter={24}>
							<Col className="gutter-row" span={24}>
								<Chart1 ref="chart1" {...chats.chart1} />
							</Col>
						</Row>
						<Row gutter={24}>
							<Col className="gutter-box" span={12}>
								<Chart1 ref="chart2" {...chats.chart2} />
							</Col>
							<Col className="gutter-box" span={12}>
								<Chart3 ref="chart3" {...chats.chart3} />
							</Col>
						</Row>
						<Row guntter={24}>
							<Col className="gutter-box" span={24}>
								<Chart1 ref="chart4" {...chats.chart4} />
							</Col>
						</Row>
					</div>
				</div>
			</Content>
		)
	}
}


class Chart1 extends React.Component {

	state = {
		current: 1,
		up: this.props.up||'up1',
		pick: this.props.pick||'pick1',
		upData: undefined,
		projectId: this.props.projectId,
		height: $('#'+this.props.pick).width*0.8,
		title: this.props.title,
	}

	init =()=> {
		let history = this.props.history;
		let req = {
			projectId : this.state.projectId,
		};
		let chart = echarts.init(document.getElementById(this.state.up));
		chart.showLoading('default', {
			text: 'loading……',
			color: '#1890ff',
			textColor: '#1890ff',
			maskColor: 'rgba(255, 255, 255, 0.8)',
			zlevel: 0,
		});
		this.setState({chart});
		switch (this.state.up) {
			case 'up1':
				getBaseHour(history, req)
					.then((res)=> {
						if (res) {
							this.toPutChart(res);
							this.setState({ upData: res });
						}
					});
				break;
			case 'up2':
				getBaseHour(history, req)
					.then((res)=> {
						if (res) {
							this.toPutChart(res);
							this.setState({ upData: res });
						}
					});
				break;
			case 'up4':
				req = {...req, hour: 1};
				getFreqHours(history, req)
					.then((res)=> {
						if (res) {
							this.toPutChart(res);
							this.setState({ upData: res });
						}
					});
				break;
			default:
				break;
		}

	}

	componentDidMount() {
		this.init();
		this.resize();
	}

	resize =()=> {
		if (this.state.chart) {
			let h = $('#'+this.state.up).width;
			this.state.chart.resize(undefined, h);
		}
	}

	toChange =(type, b)=> {
		let chart = this.state.chart;
		let projectId = this.state.projectId;
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
		switch (this.state.up) {
			case 'up1':
				switch (type) {
					case 1:
						request = getBaseHour(history, {projectId}, true);
						break;
					case 12:
						request = getBaseHours(history, {projectId, hour: 12}, true);
						break;
					case 24:
						request = getBaseHours(history, {projectId, hour: 24}, true);
						break;
					default:
						request = getBaseDay(history, {id: projectId, request: {startDate: b[0], endDate: b[1]}}, true);
				}
				request.then((res)=> {
					if (!!res) {
						this.toPutChart(res);
						current = type;
						this.setState({ upData: res, current });
					}
				});
				break;
			case 'up2':
				switch (type) {
					case 1:
						request = getBaseHour(history, {projectId}, true);
						break;
					case 12:
						request = getBaseHours(history, {projectId, hour: 12}, true);
						break;
					case 24:
						request = getBaseHours(history, {projectId, hour: 24}, true);
						break;
					default:
						request = getBaseDay(history, {id: projectId, request: {startDate: b[0], endDate: b[1]}}, true);
				}
				request.then((res)=> {
					if (!!res) {
						this.toPutChart(res);
						current = type;
						this.setState({ upData: res, current });
					}
				});
				break;
			case 'up3':
				switch (type) {
					case 4:
						request = getSnrDay(history, {id: node.id, request: {startDate: b[0], endDate: b[1]}}, true);
						break;
					default:
						request = getSnrHour(history, {deviceId: node.id, hour: type}, true);
				}
				request.then((res)=> {
					if (!!res) {
						this.toPutChart(res);
						current = type;
						this.setState({ upData: res, current });
					}
				});
				break;
			case 'up4':
				switch (type) {
					case 4:
						request = getFreqDay(history, {id: projectId, request: {startDate: b[0], endDate: b[1]}}, true);
						break;
					default:
						request = getFreqHours(history, {projectId, hour: type}, true);
						break;
				}
				request.then((res)=> {
					if (res) {
						this.toPutChart(res);
						current = type;
						this.setState({ upData: res, current });
					}
				});
				break;
			case 'up5':
				switch (type) {
					case 4:
						request = getRssiDay(history, {id: node.id, request: {startDate: b[0], endDate: b[1]}}, true);
						break;
					default:
						request = getRssiHour(history, {deviceId: node.id, hour: type}, true);
				}
				request.then((res)=> {
					if (!!res) {
						this.toPutChart(res);
						current = type;
						this.setState({ upData: res, current });
					}
				});
				break;
			default:
				break;
		}
	}

	getOption =(res)=> {
		switch (this.state.up) {
			case 'up1':
				return {
					tooltip : {
						trigger: 'axis',
						axisPointer : {
							type : 'shadow'
						}
					},
					legend: {
						data:['上行','下行']
					},
					color: ['#1890ff', '#11c66c'],
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
							name:'上行',
							type:'line',
							stack: '上行',
							symbol: 'circle',
							areaStyle: {
								normal: {
									color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
										offset: 0,
										color: '#1890ff'
									}, {
										offset: 1,
										color: '#ecf6ff'
									}])
								}
							},
							smooth: true,
							data: Array.from(res, r=>r.upData)
						},
						{
							name:'下行',
							type:'line',
							stack: '下行',
							symbol: 'circle',
							areaStyle: {
								normal: {
									color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
										offset: 0,
										color: '#11c66c'
									}, {
										offset: 1,
										color: '#f1fcf6'
									}])
								}
							},
							smooth: true,
							data: Array.from(res, r=>r.downData)
						},
					]
				};
				break;
			case 'up2':
				return {
					tooltip : {
						trigger: 'axis',
						axisPointer : {
							type : 'shadow'
						},
						formatter: '{b0}: {c0} %'
					},
					color: ['#4c8dff', '#11c66c'],
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
							name: '%'
						}
					],
					series : [
						{
							name:'网关在线率',
							type:'line',
							stack: '网关在线率',
							symbol: 'circle',
							areaStyle: {
								normal: {
									color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
										offset: 0,
										color: '#4c8dff'
									}, {
										offset: 1,
										color: '#6fbffe'
									}])
								}
							},
							smooth: true,
							data: Array.from(res, r=>r.gatewayOnlineRate)
						},
					]
				};
				break;
			case 'up4':
				let legend = Array.from(res, (r, i)=>{return '频点'+i});
				let list = Array.from(res, r=>r.dataCount||0);
				let max = [...list].sort((a,b)=>b-a)[0].toString();
				let color1 = gradientColor([48,36,174], [84,160,243], res.length/2);
				let color2 = gradientColor([84,160,243], [177,243,86], res.length/2+1);
				let dataShadow = new Array(res.length).fill((Number(max[0]) + 1)*Math.pow(10, Number(max).toFixed(0).length-1));
				let color = color1.concat(color2);
				let s2 = res.map((r, i)=> {
					let l = new Array(res.length).fill(0);
					l[i] = list[i];
					return {
						type:'bar',
						data: l,
						barWidth: legend.length>10?10:25,
						itemStyle: {
							normal: {
								barBorderRadius: 15
							},
							emphasis: {
								barBorderRadius: 15
							}
						}
					}
				});
				let freq = res.map((r, k)=> {
					return [k, k+1, 'freq', r.freq];
				});
				let renderFreq = function(params, api){
					let v = api.value(0);
					let point = api.coord([
						v-0.5,
						0]);
					let y = 30;
					return {
						type: 'text',
						style: {
							text: '频点'+api.value(0)+':'+api.value(3),
							textAlign: 'center',
							textVerticalAlign: 'bottom',
							textFont: api.font({ fontSize: 12 })
						},
						position: [point[0], y],
					}
				};
				return {
					tooltip : {
						trigger: 'item',
					},
					color: color,
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					xAxis : [
						{
							type : 'category',
							data : legend
						}
					],
					yAxis : [
						{
							type : 'value',
							name: '条',
						},
						{
							show: false,
						}
					],
					series : [
						{
							type: 'custom',
							renderItem: renderFreq,
							data: freq,
							yAxisIndex: 1,
							tooltip: {
								show: false
							}
						},
						{
							type: 'bar',
							itemStyle: {
								normal: {
									color: 'rgba(0,0,0,0.05)',
									barBorderRadius: 15
								},
							},
							tooltip: {
								trigger: 'none'
							},
							barWidth: legend.length>10?10:25,
							barGap:'-100%',
							barCategoryGap:'40%',
							data: dataShadow,
							animation: false
						},
					].concat(s2)
				};
				break;
			default:
				break;
		}
	}

	toPutChart =(res=this.state.upData, type=1)=> {
		let myChart = this.state.chart;
		myChart.hideLoading();
		let option = this.getOption(res);
		myChart.setOption(option);
		myChart.resize(undefined, $('#'+this.state.up).width);
	}

	toPick =()=> {
		let pick = this.state.pick;
		$('#'+pick).show();
		$(`#${pick} .ant-calendar-picker-icon`).trigger('click');
	}

	handlePick =(a, b)=> {
		this.toChange(4, b);
	}

	disabledDate =(current)=> {
		let start = moment().subtract(sessionStorage.getItem('day'), 'day');
		return (current < start)||(current>moment());
	};

	render() {
		const { current, up, pick, title } = this.state;
		return (
			<div className="gutter-box dashboard">
				<div className="title">
					<div className="text">
						{title}
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
								onClick={this.toPick.bind(this)}
								className={current===4?'current':''}>
							自定义
						</Button>
					</div>
				</div>
				<div className="range-pick">
					<RangePicker id={pick}
								 disabledDate={this.disabledDate}
								 onChange={this.handlePick.bind(this, 1)}
								 style={{display: 'none'}}/>
				</div>

				<div id={up} className="chart">
				</div>
			</div>
		)
	}
}


class Chart3 extends React.Component {

	state = {
		current: 1,
		up: this.props.up||'up3',
		pick: this.props.pick||'pick3',
		upData: undefined,
		projectId: this.props.projectId,
		height: $('#'+this.props.pick).width*0.8,
		title: this.props.title,
	}

	init =()=> {
		let history = this.props.history;
		let projectId = this.state.projectId;
		let req = {
			projectId,
			hour: 1,
		};
		let chart = echarts.init(document.getElementById(this.state.up));
		chart.showLoading('default', {
			text: 'loading……',
			color: '#1890ff',
			textColor: '#1890ff',
			maskColor: 'rgba(255, 255, 255, 0.8)',
			zlevel: 0,
		});
		this.setState({chart});
		getSHours(history, req)
			.then((res)=> {
				if (res) {
					this.toPutChart(res);
					this.setState({ upData: res });
				}
			});
	}

	componentDidMount() {
		this.init();
		this.resize();
	}

	resize =()=> {
		if (this.state.chart) {
			let h = $('#'+this.state.up).width;
			this.state.chart.resize(undefined, h);
		}
	}

	toChange =(type, b)=> {
		let chart = this.state.chart;
		let projectId = this.state.projectId;
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
				request = getSHours(history, {projectId, hour: 1}, true);
				break;
			case 12:
				request = getSHours(history, {projectId, hour: 12}, true);
				break;
			case 24:
				request = getSHours(history, {projectId, hour: 24}, true);
				break;
			default:
				request = getSDay(history, {id: projectId, request: {startDate: b[0], endDate: b[1]}}, true);
		}
		request.then((res)=> {
			if (!!res) {
				this.toPutChart(res);
				current = type;
				this.setState({ upData: res, current });
			}
		});
	}

	toPutChart =(res=this.state.upData, type=1)=> {
		let myChart = this.state.chart;
		myChart.hideLoading();
		let selected = {};
		let lengend = [];
		let data = res.map((r, i)=> {
			let p = r.percent||0;
			let d = r.dataCount||0;
			let name = r.datr+' | '+p+ '%  '+ d + '包';
			lengend.push(name);
			return {
				name: name,
				value: d,
			}
		});
		let center = ['40%', '50%'];
		let width = $('.wrapper').width();
		if (width < 1450) {
			if (width > 1250) {
				center = ['30%', '50%'];
			} else if (width > 1150){
				center = ['26%', '50%']
			}
		}
		let option = {
			tooltip : {
				trigger: 'item',
				formatter: "{a}"
			},
			color: ['#f2637b', '#fad337', '#4dcb73', '#36cbcb', '#3aa0ff', '#975fe4'],
			legend: {
				type: 'scroll',
				orient: 'vertical',
				right: 5,
				top: 20,
				bottom: 20,
				data: lengend,
				selected: selected,
			},
			series : [
				{
					name: '速率统计',
					type:'pie',
					radius: ['50%', '70%'],
					center: center,
					avoidLabelOverlap: false,
					label: {
						normal: {
							show: false,
							position: 'center'
						},
						emphasis: {
							show: true,
							textStyle: {
								fontSize: '18',
								fontWeight: 'bold'
							}
						}
					},
					labelLine: {
						normal: {
							show: false
						}
					},
					data: data
				}
			],
		};
		myChart.setOption(option);
		myChart.resize(undefined, $('#'+this.state.up).width);
	}

	toPick =()=> {
		let pick = this.state.pick;
		$('#'+pick).show();
		$(`#${pick} .ant-calendar-picker-icon`).trigger('click');
	}

	handlePick =(a, b)=> {
		this.toChange(4, b);
	}

	disabledDate =(current)=> {
		let start = moment().subtract(sessionStorage.getItem('day'), 'day');
		return (current < start)||(current>moment());
	};

	render() {
		const { current, up, pick, title } = this.state;
		return (
			<div className="gutter-box dashboard">
				<div className="title">
					<div className="text">
						{title}
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
								onClick={this.toPick.bind(this)}
								className={current===4?'current':''}>
							自定义
						</Button>
					</div>
				</div>
				<div className="range-pick">
					<RangePicker id={pick}
								 disabledDate={this.disabledDate}
								 onChange={this.handlePick.bind(this, 1)}
								 style={{display: 'none'}}/>
				</div>

				<div id={up} className="chart">
				</div>
			</div>
		)
	}
}