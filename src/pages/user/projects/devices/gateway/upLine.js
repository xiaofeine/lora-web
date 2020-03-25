/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import {Layout, Tag, Popconfirm, Badge, Modal, Row, Col, Spin, Button, DatePicker, message} from 'antd';
import echarts from 'echarts';
import $ from 'jquery';
import moment from 'moment';
import LoraBread from 'Commons/breadcrumb/index';
import {getBaseDay, getBaseHour, getBaseHours, queryGateway, getFreqHours, getFreqDay, getRate, getDatrHours, getDatrDay} from 'Api/gateway';

const {Content} = Layout;
const {RangePicker} = DatePicker;

export default class UpLine extends React.Component {

    init = () => {
        let data = {};
        for (let i = 1; i < 4; i++) {
            let a = echarts.init(document.getElementById(`up${i}`));
            a.showLoading('default', {
                text: 'loading……',
                color: '#1890ff',
                textColor: '#1890ff',
                maskColor: 'rgba(255, 255, 255, 0.8)',
                zlevel: 0,
            });
            let key = 'chart' + i;
            data[key] = a;
        }
        this.setState({...data});
    }

    resize = () => {
        window.onresize = () => {
            let h = $('#up1').width;
            this.state.chart1.resize(undefined, h);
            this.state.chart2.resize(undefined, h);
            this.state.chart3.resize(undefined, h);
        }
    }

    componentWillUnmount() {
        window.onresize = () => {
        };
    }

    componentDidMount() {
        this.init();
        let history = this.state.history;
        let gateway = this.state.gateway;
        let p1 = queryGateway(history, this.state.gateway.id);
        let p2 = getBaseHour(history, {gatewayId: gateway.id});
        let p3 = getFreqHours(history, {gatewayId: gateway.id, hour: 1});
        let p4 = getRate(history, {gatewayId: gateway.id});
        Promise.all([p1, p2, p3, p4]).then((res) => {
            let breads = [];
            if (!(res[0] && res[1])) {
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
                            text: res[0].projectName,
                        },
                        {
                            href: '/user/project/devices',
                            text: '设备管理'
                        },
                        {
                            href: '/user/gateway/detail',
                            text: res[0].gatewayEui
                        },
                        {
                            href: '/user/gateway/uplink',
                            text: '上行统计'
                        },
                    ];
                }
                if (!!res[1]) {
                    this.toPutChart1(res[1]);
                }
                if (!!res[2]) {
                    this.toPutChart2(res[2]);
                }
                if(!!res[3]){
                    let p4 = getDatrHours(history, {gatewayId: gateway.id, hour: 1, datr:res[3][0]});
                    p4.then((res)=>{
                        if(!!res){
                            this.toPutChart3(res);
                        }
                        this.setState({up3:res})
                    });
                }
                this.setState({breads, up1: res[1], up2: res[2], gateway: res[0], rateList:res[3]})
            }
        }).catch((res) => {
            message.error('请求失败');
        });
        this.resize();
    }

    toChange1 = (type, b) => {
        let chart1 = this.state.chart1;
        let gateway = this.state.gateway;
        let current = this.state.current;
        let rateCurrent = this.state.rateCurrent;
        let history = this.props.history;
        chart1.showLoading('default', {
            text: 'loading……',
            color: '#1890ff',
            textColor: '#1890ff',
            maskColor: 'rgba(255, 255, 255, 0.8)',
            zlevel: 0,
        });
        let request;
        switch (type) {
            case 1:
                request = getBaseHour(history, {gatewayId: gateway.id}, true);
                break;
            case 12:
                request = getBaseHours(history, {gatewayId: gateway.id, hour: 12}, true);
                break;
            case 24:
                request = getBaseHours(history, {gatewayId: gateway.id, hour: 24}, true);
                break;
            default:
                request = getBaseDay(history, {id: gateway.id, request: {startDate: b[0], endDate: b[1]}}, true);
        }
        request.then((res) => {
            if (!!res) {
                this.toPutChart1(res);
                current[0] = type;
                this.setState({up1: res, current});
            }
        });
    }

    toPutChart1 = (res = this.state.up1, type = 1) => {
        let myChart1 = this.state.chart1;
        myChart1.hideLoading();
        let option = {
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: ['上行']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: Array.from(res, r => r.timeScale),
                    axisLabel: {color: 'rgba(0,0,0,.65)'},   // x轴字体颜色
                    axisLine: {
                        lineStyle: {color: '#E9E9E9'}    // x轴坐标轴颜色
                    },
                    axisTick: {
                        lineStyle: {color: 'rgba(0,0,0,0)'}    // x轴刻度的颜色
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name:'包数',
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#e9e9e9',
                            width: 1,
                            type: 'dotted'
                        }
                    },
                    axisLabel: {color: 'rgba(0,0,0,.65)'},   // Y轴字体颜色
                    axisLine: {
                        lineStyle: {color: 'rgba(0,0,0,0.65)'}    // Y轴坐标轴颜色
                    },
                    axisTick: {
                        lineStyle: {color: 'rgba(0,0,0,0)'}    // Y轴刻度的颜色
                    }
                }
            ],
            series: [
                {
                    name: '上行',
                    type: 'bar',
                    data: Array.from(res, r => r.protocolData),
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#04cec2'},
                                    {offset: 1, color: '#19b7e2'}
                                ]
                            )
                        },
                        emphasis: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#05b9ae'},
                                    {offset: 1, color: '#19a9d0'}
                                ]
                            )
                        }
                    },

                },
            ]
        };
        myChart1.setOption(option);
        myChart1.resize(undefined, $('#up1').width);
    }

    toChange2 = (type, b) => {
        let chart2 = this.state.chart2;
        let gateway = this.state.gateway;
        let current = this.state.current;
        let history = this.props.history;
        chart2.showLoading('default', {
            text: 'loading……',
            color: '#1890ff',
            textColor: '#1890ff',
            maskColor: 'rgba(255, 255, 255, 0.8)',
            zlevel: 0,
        });
        let request;
        switch (type) {
            case 1:
                request = getFreqHours(history, {gatewayId: gateway.id, hour: 1}, true);
                break;
            case 12:
                request = getFreqHours(history, {gatewayId: gateway.id, hour: 12}, true);
                break;
            case 24:
                request = getFreqHours(history, {gatewayId: gateway.id, hour: 24}, true);
                break;
            default:
                request = getFreqDay(history, {id: gateway.id, request: {startDate: b[0], endDate: b[1]}}, true);
        }
        request.then((res) => {
            if (!!res) {
                this.toPutChart2(res);
                current[1] = type;
                this.setState({up2: res, current});
            }
        });
    }

    toPutChart2 = (res = this.state.up2, type = 2) => {
        let myChart2 = this.state.chart2;
        myChart2.hideLoading();
        let option = {
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: ['TOA', '频点数据包']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: Array.from(res, r => r.freq),
                    axisLabel: {color: 'rgba(0,0,0,.65)'},   // x轴字体颜色
                    axisLine: {
                        lineStyle: {color: '#E9E9E9'}    // x轴坐标轴颜色
                    },
                    axisTick: {
                        lineStyle: {color: 'rgba(0,0,0,0)'}    // x轴刻度的颜色
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name:'包数',
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#e9e9e9',
                            width: 1,
                            type: 'dotted'
                        }
                    },
                    axisLabel: {color: 'rgba(0,0,0,.65)'},   // Y轴字体颜色
                    axisLine: {
                        lineStyle: {color: 'rgba(0,0,0,0.65)'}    // Y轴坐标轴颜色
                    },
                    axisTick: {
                        lineStyle: {color: 'rgba(0,0,0,0)'}    // Y轴刻度的颜色
                    }
                }
            ],
            series: [
                {
                    name: 'TOA',
                    type: 'bar',
                    data: Array.from(res, r => r.toa),
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: '#4188ff',
                            lineStyle: {
                                color: '#4188ff',
                                width:3
                            }
                        }
                    }
                },
                {
                    name: '频点数据包',
                    type: 'line',
                    data: Array.from(res, r => r.count),
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#249efe'},
                                    {offset: 1, color: '#4188ff'}
                                ]
                            )
                        },
                        emphasis: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#2493eb'},
                                    {offset: 1, color: '#3f7feb'}
                                ]
                            )
                        }
                    },
                }
            ],
        };
        myChart2.setOption(option);
        myChart2.resize(undefined, $('#up2').width);
    }

    toChange3 = (type, b) => {
        let chart3 = this.state.chart3;
        let gateway = this.state.gateway;
        let current = this.state.current;
        let history = this.props.history;
        let rateCurrent = this.state.rateCurrent;
        chart3.showLoading('default', {
            text: 'loading……',
            color: '#1890ff',
            textColor: '#1890ff',
            maskColor: 'rgba(255, 255, 255, 0.8)',
            zlevel: 0,
        });
        let request;
        this.setState({stateDate:b[0],endDate:b[1]});
        switch (type) {
            case 1:
                request = getDatrHours(history, {gatewayId: gateway.id, hour: 1, datr:this.state.rateList[rateCurrent]}, true);
                break;
            case 12:
                request = getDatrHours(history, {gatewayId: gateway.id, hour: 12, datr:this.state.rateList[rateCurrent]}, true);
                break;
            case 24:
                request = getDatrHours(history, {gatewayId: gateway.id, hour: 24, datr:this.state.rateList[rateCurrent]}, true);
                break;
            default:
                request = getDatrDay(history, {gatewayId: gateway.id, datr:this.state.rateList[rateCurrent], request: {startDate: b[0], endDate: b[1]}}, true);
        }
        request.then((res) => {
            if (!!res) {
                this.toPutChart3(res);
                current[2] = type;
                this.setState({up3: res, current});
            }
        });
    }

    toPutChart3 = (res = this.state.up3, type = 3) => {
        let myChart3 = this.state.chart3;
        myChart3.hideLoading();
        let option = {
            tooltip: {
                trigger: 'axis',
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: Object.keys(res),
                    axisLabel: {color: 'rgba(0,0,0,.65)'},   // x轴字体颜色
                    axisLine: {
                        lineStyle: {color: '#E9E9E9'}    // x轴坐标轴颜色
                    },
                    axisTick: {
                        lineStyle: {color: 'rgba(0,0,0,0)'}    // x轴刻度的颜色
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name:'秒',
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#e9e9e9',
                            width: 1,
                            type: 'dotted'
                        }
                    },
                    axisLabel: {color: 'rgba(0,0,0,.65)'},   // Y轴字体颜色
                    axisLine: {
                        lineStyle: {color: 'rgba(0,0,0,0.65)'}    // Y轴坐标轴颜色
                    },
                    axisTick: {
                        lineStyle: {color: 'rgba(0,0,0,0)'}    // Y轴刻度的颜色
                    }
                }
            ],
            series: [
                {
                    name: '上行',
                    type: 'line',
                    data: Object.values(res),
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: '#1890FF',
                            lineStyle: {
                                color: '#71c0fe'
                            }
                        }
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                            offset: 0,
                            color: '#71c0fe'
                        }, {
                            offset: 1,
                            color: '#4c8dff'
                        }])
                    },
                },
            ],
        };
        myChart3.setOption(option);
        myChart3.resize(undefined, $('#up3').width);
    }

    toChange = (type,b)=>{
        let chart3 = this.state.chart3;
        let gateway = this.state.gateway;
        let current = this.state.current[2];
        let rateCurrent = this.state.rateCurrent;
        let history = this.props.history;
        chart3.showLoading('default', {
            text: 'loading……',
            color: '#1890ff',
            textColor: '#1890ff',
            maskColor: 'rgba(255, 255, 255, 0.8)',
            zlevel: 0,
        });
        let request;
        switch (current) {
            case 1:
                request = getDatrHours(history, {gatewayId: gateway.id, hour: 1, datr:this.state.rateList[type]}, true);
                break;
            case 12:
                request = getDatrHours(history, {gatewayId: gateway.id, hour: 12, datr:this.state.rateList[type]}, true);
                break;
            case 24:
                request = getDatrHours(history, {gatewayId: gateway.id, hour: 24, datr:this.state.rateList[type]}, true);
                break;
            default:
                request = getDatrDay(history, {gatewayId: gateway.id, datr:this.state.rateList[type], request: {startDate: this.state.stateDate, endDate: this.state.endDate}}, true);
        }
        request.then((res) => {
            if (!!res) {
                this.toPutChart3(res);
                rateCurrent = type;
                this.setState({up3: res, rateCurrent});
            }
        });
    }

    toPick = (n) => {
        $('#pick' + n).show();
        $(`#pick${n} .ant-calendar-picker-icon`).trigger('click');
    }

    handlePick = (n, a, b) => {
        let fun = 'toChange' + n;
        this[fun](3, b);
        $('#pick' + n).hide();
    }

    state = {
        breads: [],
        projectName: sessionStorage.getItem('project_name'),
        gateway: {id: sessionStorage.getItem('gateway')},
        sub: {uplinkValidData: 0, emptyDataFrames: 0, multiPathFrames: 0},
        current: new Array(3).fill(1),
        rateCurrent: 0,
        height: $('#up1').width * 0.8,
        rateList: null,
        stateDate:'',
        endDate:''
    }

    disabledDate =(current)=> {
		let start = moment().subtract(sessionStorage.getItem('day'), 'day');
		return (current < start)||(current>moment());
	};

    render() {
        const { gateway, current, rateCurrent, pick } = this.state;
        return (
            <Content className="node-up">
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {gateway.gatewayEui}
                        <Tag color="blue">{gateway.projectName}</Tag>
                    </div>
                </div>
                <div className="content-detail gateway-up">
                    <div className="charts">
                        <Row gutter={24}>
                            <Col className="gutter-row" span={12}>
                                <div className="gutter-box dashboard">
                                    <div className="title">
                                        <div className="text">
                                            空口数据包统计
                                        </div>
                                        <div className="buttons">
                                            <Button ghost={true}
                                                    onClick={this.toChange1.bind(this, 1)}
                                                    className={current[0] === 1 ? 'current' : ''}>
                                                最近一小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange1.bind(this, 12)}
                                                    className={current[0] === 12 ? 'current' : ''}>
                                                最近12小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange1.bind(this, 24)}
                                                    className={current[0] === 24 ? 'current' : ''}>
                                                最近24小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toPick.bind(this,1)}
                                                    className={current[0] === 4 ? 'current' : ''}>
                                                自定义
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="range-pick">
                                        <RangePicker id="pick1"
                                                     disabledDate={this.disabledDate}
                                                     onChange={this.handlePick.bind(this, 1)}
                                                     style={{display: 'none'}}/>
                                    </div>

                                    <div id="up1" className="chart">

                                    </div>
                                </div>
                            </Col>
                            <Col className="gutter-row" span={12}>
                                <div className="gutter-box dashboard">
                                    <div className="title">
                                        <div className="text">
                                            频点占用情况统计
                                        </div>
                                        <div className="buttons">
                                            <Button ghost={true}
                                                    onClick={this.toChange2.bind(this, 1)}
                                                    className={current[1] === 1 ? 'current' : ''}>
                                                最近一小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange2.bind(this, 12)}
                                                    className={current[1] === 12 ? 'current' : ''}>
                                                最近12小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange2.bind(this, 24)}
                                                    className={current[1] === 24 ? 'current' : ''}>
                                                最近24小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toPick.bind(this, 2)}
                                                    className={current[1] === 4 ? 'current' : ''}>
                                                自定义
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="range-pick">
                                        <RangePicker id="pick2"
                                                     disabledDate={this.disabledDate}
                                                     onChange={this.handlePick.bind(this, 2)}
                                                     style={{display: 'none'}}/>
                                    </div>
                                    <div id="up2" className="chart"></div>
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col className="gutter-row" span={24}>
                                <div className="gutter-box dashboard">
                                    <div className="title">
                                        <div className="text">
                                            速率统计
                                        </div>
                                        <div className="buttons">
                                            <Button ghost={true}
                                                    onClick={this.toChange3.bind(this, 1)}
                                                    className={current[2] === 1 ? 'current' : ''}>
                                                最近一小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange3.bind(this, 12)}
                                                    className={current[2] === 12 ? 'current' : ''}>
                                                最近12小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange3.bind(this, 24)}
                                                    className={current[2] === 24 ? 'current' : ''}>
                                                最近24小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toPick.bind(this, 3)}
                                                    className={current[2] === 4 ? 'current' : ''}>
                                                自定义
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="range-pick">
                                        <RangePicker id="pick3"
                                                     disabledDate={this.disabledDate}
                                                     onChange={this.handlePick.bind(this, 3)}
                                                     style={{display: 'none'}}/>
                                    </div>
                                    <div className="buttonList">
                                        {!this.state.rateList ? '' : this.state.rateList.map((item, index) => {
                                            return (
                                                <Button key={item}
                                                        onClick={this.toChange.bind(this, index)}
                                                        className={ rateCurrent === index ? 'rateCurrent' : '' }>
                                                    {item}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                    <div id="up3" className="chart"></div>
                                </div>
                            </Col>
                        </Row>

                    </div>
                </div>
            </Content>
        )
    }
}