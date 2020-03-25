/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import {Layout, Tag, Popconfirm, Badge, Modal, Row, Col, Spin, Button, DatePicker } from 'antd';
import echarts from 'echarts';
import $ from 'jquery';
import moment from 'moment';
import LoraBread from 'Commons/breadcrumb/index';
import { queryNode, getUplinkData,
	getBaseDay, getBaseHour, getBaseHours,
	getSToa,
	getSnrHour, getSnrDay,
	getUpDatr,
	getRssiHour, getRssiDay,
	getSpeedDay, getSpeedHour,
} from 'Api/node';

const {Content} = Layout;
const {RangePicker} = DatePicker;

export default class NodeUp extends React.Component {

	componentWillUnmount() {
		window.onresize = ()=>{};
	}

	disabledDate =(current)=> {
		let start = moment().subtract(sessionStorage.getItem('day'), 'day');
		return (current < start)||(current>moment());
	}

	init =()=> {
		let data = {};
		let node = this.state.node;
		let list = [
			'上行帧统计', '上行帧TOA/成功率', 'SNR统计', '上行帧速率', 'RSSI统计', '速率统计'
		];
		for(let i=1; i<7; i++) {
			data['chart'+i] = {
				node,
				disabledDate: this.disabledDate,
				up: 'up'+i,
				pick: 'pick'+i,
				title: list[i-1],
			};
		}
		return data;
	}

	componentDidMount() {
		let history = this.state.history;
		let node = this.state.node;
		let p1 = queryNode(history, this.state.node);
		let p2 = getUplinkData(history, node);
		Promise.all([p1, p2]).then((res)=> {
			let breads = [];
			let sub = this.state.sub;
			if (!(res[0]&&res[1])) {
				Modal.error({
					title: '请求失败'
				})
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
							text: res[0].projectName,
						},
						{
							href: '/user/project/devices',
							text: '设备管理'
						},
						{
							href: '/user/node/detail',
							text: res[0].devEui
						},
						{
							href: '/user/node/uplink',
							text: '上行统计'
						},
					];
				}
				if (!!res[1]) {
					sub = res[1];
				}
				this.setState({ breads, sub, node: res[0] })
			}
		}).catch((res)=> {
			Modal.error({
				title: '请求失败'
			})
		});
	}

	state = {
		breads: [],
		projectName: sessionStorage.getItem('project_name'),
		node: { id: sessionStorage.getItem('node') },
		sub: { uplinkValidData: 0, emptyDataFrames: 0, multiPathFrames: 0 },
	}

	render() {
		const { node, sub } = this.state;
		let chats = this.init();
		return (
			<Content>
				<div className="detail-bread">
					<LoraBread history={this.props.history} breads={this.state.breads}/>
					<div className="title">
						{node.devEui}
						<Tag color="blue">{node.projectName}</Tag>
					</div>
				</div>
				<div className="content-detail node-up">
					<Row gutter={24}>
						<Col className="gutter-row" span={8}>
							<div className="gutter-box dashboard flexBox">
								<div className="text">
									<p>上行有效数据包数(条)</p>
									<h3>{sub.uplinkValidData.toLocaleExponential(2,1000000)}</h3>
								</div>
								<div className="icon">
									<i className="iconfont icon-yxshbs" style={{background: '#259efe'}}></i>
								</div>
							</div>
						</Col>
						<Col className="gutter-row" span={8}>
							<div className="gutter-box dashboard flexBox">
								<div className="text">
									<p>多路径的帧数(帧)</p>
									<h3>{sub.multiPathFrames.toLocaleExponential(2,1000000)}</h3>
								</div>
								<div className="icon">
									<i className="iconfont icon-kksjzs" style={{background: '#5db992'}}></i>
								</div>
							</div>
						</Col>
						<Col className="gutter-row" span={8}>
							<div className="gutter-box dashboard flexBox">
								<div className="text">
									<p>空口数据帧数(帧)</p>
									<h3>{sub.emptyDataFrames.toLocaleExponential(2,1000000)}</h3>
								</div>
								<div className="icon">
									<i className="iconfont icon-sjzs" style={{background: '#68ceff'}}></i>
								</div>
							</div>
						</Col>
					</Row>
					<div className="charts">
						<Row gutter={24}>
							<Col className="gutter-row" span="12">
								<Chart1 {...chats.chart1} />
							</Col>
							<Col className="gutter-row" span="12">
								<Chart2 {...chats.chart2} />
							</Col>
						</Row>
						<Row gutter={24}>
							<Col className="gutter-row" span="12">
								<Chart1 {...chats.chart3} />
							</Col>
							<Col className="gutter-row" span="12">
								<Chart2 {...chats.chart4} />
							</Col>
						</Row>
						<Row gutter={24}>
							<Col className="gutter-row" span="12">
								<Chart1 {...chats.chart5} />
							</Col>
							<Col className="gutter-row" span="12">
								<Chart3 {...chats.chart6} />
							</Col>
						</Row>
					</div>
				</div>
			</Content>
		)
	}
}

class Chart2 extends React.Component {

	state = {
		current: 100,
		up: this.props.up||'up2',
		pick: this.props.pick||'pick2',
		upData: undefined,
		node: this.props.node||{},
		height: $('#'+this.props.pick).width*0.8,
		title: this.props.title,
	}

	init =()=> {
		let history = this.props.history;
		let node = this.state.node;
		let req = {
			deviceId: node.id,
			count: 100,
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
			case 'up2':
				getSToa(history, req)
					.then((res)=> {
						if (res) {
							this.toPutChart(res);
							this.setState({ upData: res });
						}
					});
				break;
			case 'up4':
				getUpDatr(history, req)
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
		window.onresize =()=> {
			let h = $('#'+this.state.up).width;
			this.state.chart.resize(undefined, h);
		}
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
		switch (this.state.up) {
			case 'up2':
				request = getSToa(history, {deviceId: node.id, count: type}, true);
				request.then((res)=> {
					if (!!res) {
						this.toPutChart(res);
						current = type;
						this.setState({ upData: res, current });
					}
				});
				break;
			case 'up4':
				getUpDatr(history, {deviceId: node.id, count: type}, true).then((res)=> {
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
			case 'up2':
				return {
					tooltip : {
						trigger: 'axis',
						axisPointer : {
							type : 'shadow'
						}
					},
					legend: {
						data:['成功率','TOA']
					},
					color: ['#1890ff', '#2fc25b'],
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
							type: 'value',
							name: '秒'
						},
						{
							type : 'value',
							name: '%',
						},
					],
					series : [
						{
							name:'成功率',
							type:'line',
							symbol: 'circle',
							stack: '成功率',
							areaStyle: {
								opacity: 0.5,
							},
							smooth: true,
							data: Array.from(res, r=>r.successRate)
						},
						{
							name:'TOA',
							type:'line',
							symbol: 'circle',
							stack: 'TOA',
							areaStyle: {
								opacity: 0.5,
							},
							smooth: true,
							data: Array.from(res, r=>r.toa)
						},
					]
				};
				break;
			case 'up4':
				let xs = res.xcoordinate;
				let ys = res.ycoordinate;
				let vs = res.coordinate;
				let data = [];
				let xl= [];
				let max = 0;
				xs.map((x, i)=> {
					xl.push(x.split(' ')[1]);
					ys.map((y, j)=> {
						let v = vs[i][j]||'-';
						max = max<v?v:max;
						data.push({
							name: xs[i],
							value: [i, j, v]
						});
					})
				});
				let end = 1000/xs.length;
				let zoom = xs.length > 10;
				return {
					tooltip: {
						position: 'top',
						formatter: function (ps) {
							return `${ps.name}: ${ps.value[2]}`;
						},
					},
					animation: false,
					grid: {
						height: '50%',
						y: zoom?'10%':'15%',
						x: '20%'
					},
					xAxis: {
						type: 'category',
						data: xl,
						splitArea: {
							show: true
						}
					},
					yAxis : {
						type: 'category',
						data: ys,
						splitArea: {
							show: true
						},
						name: '速率分布'
					},
					visualMap: {
						min: 0,
						max: max,
						calculable: true,
						orient: 'horizontal',
						left: 'center',
						bottom: zoom?'18%':'5%',
						color: ['#5550d6', '#49a0ef']
					},
					dataZoom: !zoom?[]:[
						{
							show: true,
							start: 0,
							end: end,
							fillerColor: '#2a9afe',
							backgroundColor: '#eaeaea',
							handleSize: '80%',
						},
						{
							type: 'inside',
							start: 0,
							end: end
						},
					],
					series : [
						{
							name: '上行帧速率',
							type: 'heatmap',
							data: data,
							label: {
								normal: {
									show: true
								}
							},
							itemStyle: {
								emphasis: {
									shadowBlur: 10,
									shadowColor: 'rgba(0, 0, 0, 0.5)'
								}
							}
						}
					]
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
								onClick={this.toChange.bind(this, 100)}
								className={current===100?'current':''}>
							最近100条
						</Button>
						<Button ghost={true}
								onClick={this.toChange.bind(this, 500)}
								className={current===500?'current':''}>
							最近500条
						</Button>
						<Button ghost={true}
								onClick={this.toChange.bind(this, 1000)}
								className={current===1000?'current':''}>
							最近1000条
						</Button>
					</div>
				</div>
				<div className="range-pick">
					<RangePicker id={pick}
								 disabledDate={this.props.disabledDate}
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
		up: this.props.up||'up6',
		pick: this.props.pick||'pick6',
		upData: undefined,
		node: this.props.node||{},
		height: $('#'+this.props.pick).width*0.8,
		title: this.props.title,
	}

	init =()=> {
		let history = this.props.history;
		let node = this.state.node;
		let req = {
			deviceId: node.id,
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
		getSpeedHour(history, req)
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
		window.onresize =()=> {
			let h = $('#'+this.state.up).width;
			this.state.chart.resize(undefined, h);
		}
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
				request = getSpeedHour(history, {deviceId: node.id, hour: 1}, true);
				break;
			case 12:
				request = getSpeedHour(history, {deviceId: node.id, hour: 12}, true);
				break;
			case 24:
				request = getSpeedHour(history, {deviceId: node.id, hour: 24}, true);
				break;
			default:
				request = getSpeedDay(history, {id: node.id, request: {startDate: b[0], endDate: b[1]}}, true);
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
			} else if (width > 1160){
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
								 disabledDate={this.props.disabledDate}
								 onChange={this.handlePick.bind(this, 1)}
								 style={{display: 'none'}}/>
				</div>

				<div id={up} className="chart">
				</div>
			</div>
		)
	}
}

class Chart1 extends React.Component {

	state = {
		current: 1,
		up: this.props.up||'up1',
		pick: this.props.pick||'pick1',
		upData: undefined,
		node: this.props.node||{},
		height: $('#'+this.props.pick).width*0.8,
		title: this.props.title,
	}

	init =()=> {
		let history = this.props.history;
		let node = this.state.node;
		let req = {
			deviceId: node.id,
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
			case 'up3':
				req = {...req, hour: 1};
				getSnrHour(history, req)
					.then((res)=> {
						if (res) {
							this.toPutChart(res);
							this.setState({ upData: res });
						}
					});
				break;
			case 'up5':
				req = { ...req, hour: 1};
				getRssiHour(history, req)
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
		window.onresize =()=> {
			let h = $('#'+this.state.up).width;
			this.state.chart.resize(undefined, h);
		}
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
		switch (this.state.up) {
			case 'up1':
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
						data:['确认帧','确认帧(重发包)','非确认帧','join帧']
					},
					color: ['#3aa0ff', '#f2637b', '#36cbcb', '#2e9aff'],
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
							data: Array.from(res, r=>r.confirmedDataUp)
						},
						{
							name:'确认帧(重发包)',
							type:'bar',
							stack: '确认帧',
							data: Array.from(res, r=>r.confirmedDataResend)
						},
						{
							name:'非确认帧',
							type:'bar',
							data: Array.from(res, r=>r.unConfirmedDataUp)
						},
						{
							name:'join帧',
							type:'line',
							symbol: 'none',
							data: Array.from(res, r=>r.joinUp)
						},
					]
				};
				break;
			case 'up3':
				return {
					tooltip : {
						trigger: 'axis',
						axisPointer : {
							type : 'shadow'
						}
					},
					color: ['#36cbcb', '#2e9aff'],
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					xAxis : [
						{
							type : 'category',
							data : Object.keys(res)
						}
					],
					yAxis : [
						{
							type : 'value'
						}
					],
					series : [
						{
							type:'bar',
							data: Object.values(res)
						}
					]
				};
				break;
			case 'up5':
				return {
					tooltip : {
						trigger: 'axis',
						axisPointer : {
							type : 'shadow'
						}
					},
					color: ['#f2637b', '#36cbcb', '#2e9aff'],
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					xAxis : [
						{
							type : 'category',
							data : Object.keys(res)
						}
					],
					yAxis : [
						{
							type : 'value'
						}
					],
					series : [
						{
							type:'bar',
							data: Object.values(res)
						}
					]
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
								 disabledDate={this.props.disabledDate}
								 onChange={this.handlePick.bind(this, 1)}
								 style={{display: 'none'}}/>
				</div>

				<div id={up} className="chart">
				</div>
			</div>
		)
	}
}