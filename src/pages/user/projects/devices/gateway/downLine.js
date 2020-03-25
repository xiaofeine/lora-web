/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import {Layout, Tag, Popconfirm, Badge, Modal, Row, Col, Spin, Button, DatePicker, message } from 'antd';
import echarts from 'echarts';
import $ from 'jquery';
import moment from 'moment';
import LoraBread from 'Commons/breadcrumb/index';
import { getBaseDay, getBaseHour, getBaseHours, queryGateway, getDFreqHours, getDFreqDay } from 'Api/gateway';

const {Content} = Layout;
const {RangePicker} = DatePicker;

export default class DownLine extends React.Component {

    init =()=> {
        let data = {};
        for (let i=1; i<4; i++) {
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
        this.setState({ ...data });
    }

    resize =()=> {
        window.onresize =()=> {
            let h = $('#up1').width;
            this.state.chart1.resize(undefined, h);
            this.state.chart2.resize(undefined, h);
            this.state.chart3.resize(undefined, h);
        }
    }

    componentWillUnmount() {
        window.onresize = ()=>{};
    }

    componentDidMount() {
        this.init();
        let history = this.state.history;
        let gateway = this.state.gateway;
        let p1 = queryGateway(history, this.state.gateway.id);
        let p2 = getBaseHour(history, {gatewayId: gateway.id});
        let p3 = getDFreqHours(history, {gatewayId: gateway.id, hour:1});
        Promise.all([p1, p2, p3]).then((res)=> {
            let breads = [];
            if (!(res[0]&&res[1])) {
                message.error('请求失败！');
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
                            text: '下行统计'
                        },
                    ];
                }
                if (!!res[1]) {
                    this.toPutChart1(res[1]);
                    this.toPutChart3(res[1]);
                }
                if (!!res[2]) {
                    this.toPutChart2(res[2]);
                }
                this.setState({ breads, up1: res[1], up2:res[2], up3: res[1], gateway: res[0] })
            }
        }).catch((res)=> {
            message.error('请求失败！');
        });
        this.resize();
    }

    toChange1 =(type, b)=> {
        let chart1 = this.state.chart1;
        let gateway = this.state.gateway;
        let current = this.state.current;
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
        request.then((res)=> {
            if (!!res) {
                this.toPutChart1(res);
                current[0] = type;
                this.setState({ up1: res, current });
            }
        });
    }

    toPutChart1 =(res=this.state.up1, type=1)=> {
        let myChart1 = this.state.chart1;
        myChart1.hideLoading();
        let option = {
            tooltip : {
                trigger: 'axis',
            },
            legend: {
                data: ['下行']
            },
            grid: {
                left: '7',
                right: '0',
                bottom: '0',
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
                    name:'条',
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
                    name: '下行',
                    type: 'bar',
                    data: Array.from(res, r => r.downlinkData),
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

    toChange2 =(type, b)=> {
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
                request = getDFreqHours(history, {gatewayId: gateway.id,hour:1}, true);
                break;
            case 12:
                request = getDFreqHours(history, {gatewayId: gateway.id, hour: 12}, true);
                break;
            case 24:
                request = getDFreqHours(history, {gatewayId: gateway.id, hour: 24}, true);
                break;
            default:
                request = getDFreqDay(history, {id: gateway.id, request: {startDate: b[0], endDate: b[1]}}, true);
        }
        request.then((res)=> {
            if (!!res) {
                this.toPutChart2(res);
                current[1] = type;
                this.setState({ up2: res, current });
            }
        });
    }

    toPutChart2 =(res=this.state.up2, type=2)=> {
        let myChart2 = this.state.chart2;
        myChart2.hideLoading();
        let option = {
            tooltip : {
                trigger: 'axis',
            },
            legend: {
                data:['TOA','频点数据包']
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
                    name:'条',
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

    toChange3 =(type, b)=> {
        let chart3 = this.state.chart3;
        let gateway = this.state.gateway;
        let current = this.state.current;
        let history = this.props.history;
        chart3.showLoading('default', {
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
        request.then((res)=> {
            if (!!res) {
                this.toPutChart3(res);
                current[2] = type;
                this.setState({ up3: res, current });
            }
        });
    }

    toPutChart3 =(res=this.state.up3, type=3)=> {
        let myChart3 = this.state.chart3;
        myChart3.hideLoading();
        let option = {
            tooltip : {
                trigger: 'axis',
            },
            legend: {
                data:['TOA']
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
                data : Array.from(res, r=>r.timeScale),
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
                name: '下行',
                type: 'line',
                data: Array.from(res, r=>r.downlinkToa),
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
                        color: '#d4f3a1'
                    }, {
                        offset: 0.3,
                        color: '#8bc6cb'
                    },{
                        offset: 0.7,
                        color: '#4673e0'
                    },{
                        offset: 1,
                        color: '#3126b0'
                    }])
                },
            },
        ],
        };
        myChart3.setOption(option);
        myChart3.resize(undefined, $('#up3').width);
    }

    toPick =(n)=> {
        $('#pick'+n).show();
        $(`#pick${n} .ant-calendar-picker-icon`).trigger('click');
    }

    handlePick =(n, a, b)=> {
        let fun = 'toChange' + n;
        this[fun](3, b);
    }

    state = {
        breads: [],
        projectName: sessionStorage.getItem('project_name'),
        gateway: { id: sessionStorage.getItem('gateway') },
        sub: { uplinkValidData:0, emptyDataFrames:0, multiPathFrames:0 },
        current: new Array(3).fill(1),
        height: $('#up1').width*0.8,
    }

    disabledDate =(current)=> {
		let start = moment().subtract(sessionStorage.getItem('day'), 'day');
		return (current < start)||(current>moment());
	};

    render() {
        const { gateway, current } = this.state;
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
                            <Col className="gutter-row" span="12">
                                <div className="gutter-box dashboard">
                                    <div className="title">
                                        <div className="text">
                                            下行统计
                                        </div>
                                        <div className="buttons">
                                            <Button ghost={true}
                                                    onClick={this.toChange1.bind(this, 1)}
                                                    className={current[0]===1?'current':''}>
                                                最近一小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange1.bind(this, 12)}
                                                    className={current[0]===12?'current':''}>
                                                最近12小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange1.bind(this, 24)}
                                                    className={current[0]===24?'current':''}>
                                                最近24小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toPick.bind(this, 1)}
                                                    className={current[0]===4?'current':''}>
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
                            <Col className="gutter-row" span="12">
                                <div className="gutter-box dashboard">
                                    <div className="title">
                                        <div className="text">
                                            数据包
                                        </div>
                                        <div className="buttons">
                                            <Button ghost={true}
                                                    onClick={this.toChange2.bind(this, 1)}
                                                    className={current[1]===1?'current':''}>
                                                最近一小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange2.bind(this, 12)}
                                                    className={current[1]===12?'current':''}>
                                                最近12小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange2.bind(this, 24)}
                                                    className={current[1]===24?'current':''}>
                                                最近24小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toPick.bind(this, 2)}
                                                    className={current[1]===4?'current':''}>
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
                            <Col className="gutter-row" span="12">
                                <div className="gutter-box dashboard">
                                    <div className="title">
                                        <div className="text">
                                            TOA
                                        </div>
                                        <div className="buttons">
                                            <Button ghost={true}
                                                    onClick={this.toChange3.bind(this, 1)}
                                                    className={current[2]===1?'current':''}>
                                                最近一小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange3.bind(this, 12)}
                                                    className={current[2]===12?'current':''}>
                                                最近12小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toChange3.bind(this, 24)}
                                                    className={current[2]===24?'current':''}>
                                                最近24小时
                                            </Button>
                                            <Button ghost={true}
                                                    onClick={this.toPick.bind(this, 3)}
                                                    className={current[2]===4?'current':''}>
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