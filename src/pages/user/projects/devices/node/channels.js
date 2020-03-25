/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout, Tag , Row, Col, Modal, message } from 'antd';
import echarts from 'echarts';
import $ from 'jquery';
import LoraBread from 'Commons/breadcrumb/index';
import BasicTable from 'Commons/table/basic';
import { getChannels, batchEnableChannels,
	getUpFreq, getDownFreq, } from 'Api/node';

const { Content } = Layout;
export default class Channels extends React.Component {

	toEnable =(enable, item)=> {
		let req = {
			ids: [ item.id ],
            enable
		};
		this.handleEnable(enable, null, req);
	}

	handleEnable =(enable, values, req)=> {
		if (!!values) {
			req = {
				ids: values,
				enable
			};
		}
		req.deviceId = sessionStorage.getItem('node');
		let title = enable?'启用':'禁用';
		Modal.confirm({
			title: '确定要'+title+'吗？',
			onOk: ()=> {
				batchEnableChannels(this.props.history, req)
					.then((res)=> {
						if (!!res) {
                            message.success( '已'+title+'！');
                            this.refs.channels.getData(0);
						} else {
                            message.error('操作失败！');
						}
					})
			}
		})
	}

	handleReq =(type)=> {
	    let req = {
			deviceId: sessionStorage.getItem('node')
        };
		let channelTable = this.state.channelTable;
		let origin = channelTable.req.enable;
        if (!!type) {
        	if (origin === undefined) {
        		req.enable = type === '1';
			} else {
				(origin === (type==='1'))?
					null:
					req.enable = type==='1';
			}
		}
		let buttonSettings = req.enable === undefined?[
			{
				text: '已启用',
				type: 'default',
				onClick: this.handleReq.bind(this, '1'),
			},
			{
				text: '未启用',
				type: 'default',
				onClick: this.handleReq.bind(this, '2'),
			},
		]: [
			{
				text: '已启用',
				type: req.enable?'primary':'default',
				onClick: this.handleReq.bind(this, '1'),
			},
			{
				text: '未启用',
				type: !req.enable?'primary':'default',
				onClick: this.handleReq.bind(this, '2'),
			},
		];
	    channelTable.req = req;
		channelTable.page = 0;
		channelTable.buttonSettings = buttonSettings;
	    this.setState({ channelTable });
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
            },
            {
                href: '/user/project/devices',
                text: '设备管理'
            },
            {
                href: '/user/node/detail',
                text: sessionStorage.getItem('devEui')
            },
            {
                href: '/user/node/channels',
                text: '信道列表'
            },
        ],
        node: { id: sessionStorage.getItem('node') },
        edit: false,
        channelTable: {
            id: 'channel',
            rowKey: 'id',
            columns: [
                {
                    title: '信道编号',
                    dataIndex: 'index',
                    key: 'index',
                },
                {
                    title: '上行频率(Hz)',
                    dataIndex: 'upFreq',
                    key: 'upFreq',
                },
                {
                    title: '下行频率(Hz)',
                    dataIndex: 'downFreq',
                    key: 'downFreq',
                },
                {
                    title: 'dataRates(区间)',
                    dataIndex: 'maxDR',
                    key: 'maxDR',
                    render: (a, item)=> {
                        return `[${item.minDR}, ${item.maxDR}]`;
                    },
                },
                {
                    title: '操作',
                    dataIndex: 'address',
                    key: 'address',
                    render: (a, item, index)=> {
                        return (
                            <div className="action-list" key={item.username+'a'+index}>
                                {
                                    item.enable?
                                        <a href="javascript:;" onClick={this.toEnable.bind(this, false, item, '禁用')}>禁用</a>
                                        :
                                        <a href="javascript:;" onClick={this.toEnable.bind(this, true, item, '启用')}>启用</a>
                                }
                            </div>
                        )
                    }
                },
            ],
            getData: getChannels,
            selectButtons: [
                {
                    text: '启用',
                    handleClick: this.handleEnable.bind(this, true),
			    },
				{
					text: '禁用',
					handleClick: this.handleEnable.bind(this, false),
				},
            ],
            showButtons: true,
            buttonSettings: [
                {
                    text: '已启用',
					type: 'default',
                    onClick: this.handleReq.bind(this, '1'),
                },
                {
                    text: '未启用',
					type: 'default',
                    onClick: this.handleReq.bind(this, '2'),
                },
            ],
            searchFields: 'index',
            searchPlaceholder: '请输入信道编号/上行频率/下行频率',
			searchWidth: '300px',
            history: this.props.history,
            req: {
                deviceId: sessionStorage.getItem('node')
            },
			reqChange: true,
        },
    }

	init =()=> {
		let data = {};
		let node = this.state.node;
		let list = [
			'上行信道列表（今日）', '下行信道列表（今日）'
		];
		for(let i=1; i<3; i++) {
			data['chart'+i] = {
				deviceId: node.id,
				up: 'up'+i,
				pick: 'pick'+i,
				title: list[i-1],
			};
		}
		return data;
	}

	componentDidMount() {
		window.onresize =()=> {
			for (let i=1; i<3; i++) {
				this.refs['chart'+i].resize();
			}
		}
	}

	componentWillUnmount() {
		window.onresize = ()=> {}
	}


	render() {
        const node = this.state.node;
        const chats = this.init();
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {sessionStorage.getItem('devEui')||node.devEui}
                        <Tag color="blue">{sessionStorage.getItem('project_name')}</Tag>
                    </div>
                </div>
				<div className="node-up">
					<div className="content-detail charts" style={{paddingBottom: 0, marginBottom: 0}}>
						<Row gutter={24}>
							<Col className="gutter-row" span="12">
								<Chart3 ref='chart1' {...chats.chart1}/>
							</Col>
							<Col className="gutter-row" span="12">
								<Chart3 ref='chart2' {...chats.chart2}/>
							</Col>
						</Row>
					</div>
				</div>
                <div className="content-detail" style={{marginTop: 0}}>
                    <div className="dashboard">
                        <BasicTable ref="channels" {...this.state.channelTable}/>
                    </div>
                </div>
            </Content>
        )
    }
}

class Chart3 extends React.Component {

	state = {
		current: 1,
		up: this.props.up||'up3',
		pick: this.props.pick||'pick3',
		upData: undefined,
		deviceId : this.props.deviceId ,
		height: $('#'+this.props.pick).width*0.8,
		title: this.props.title,
	}

	init =()=> {
		let history = this.props.history;
		let deviceId = this.state.deviceId;
		let req = {
			deviceId,
		};
		let chart = echarts.init(document.getElementById(this.state.up), {
			color: [ '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
				'#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0',
				'#1e90ff', '#ff6347', '#7b68ee', '#00fa9a', '#ffd700',
				'#6b8e23', '#ff00ff', '#3cb371', '#b8860b', '#30e0e0']
		});
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
				getUpFreq(history, req)
					.then((res)=> {
						if (res) {
							this.toPutChart(res);
							this.setState({ upData: res });
						}
					});
				break;
			default:
				getDownFreq(history, req)
					.then((res)=> {
						if (res) {
							this.toPutChart(res);
							this.setState({ upData: res });
						}
					})
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

	toPutChart =(res=this.state.upData, type=1)=> {
		let myChart = this.state.chart;
		myChart.hideLoading();
		let selected = {};
		let lengend = [];
		let data = res.map((r, i)=> {
			let p = r.percent||0;
			let d = r.sumToa||0;
			let name = r.freq+' | '+p+ '%  '+ d + 's';
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

	render() {
		const { up, title } = this.state;
		return (
			<div className="gutter-box dashboard">
				<div className="title">
					<div className="text">
						{title}
					</div>
				</div>
				<div id={up} className="chart">
				</div>
			</div>
		)
	}
}
