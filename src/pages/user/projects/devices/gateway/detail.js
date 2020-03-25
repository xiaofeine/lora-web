/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import LoraBread from 'Commons/breadcrumb/index';
import { Layout, Row, Col, Icon, Button, Tag, Progress, Modal, Form, Input, message } from 'antd';
import { queryGateway, resetGateway, queryGatewayJson, queryFreq, editGateway } from 'Api/gateway';
import $ from 'jquery';
import {getProperValue} from 'Configs/utils';

const {Content} = Layout;


export default class GatewayDetail extends React.Component {
    state = {
        breads: [],
        state: 'ONLINE',
        data: !!this.props.history.location.state?this.props.history.location.state.data:{},
        jsonData:{},
        upDetail: false,
        editGateway:false,
        upDetailData:[],
        uploading: false,
        gateId: {
            id: sessionStorage.getItem('gateway'),
        },
        lbtVal: '',
        mapVisible:false,
        projectName:sessionStorage.getItem('project_name'),
    };

    componentDidMount() {
        let id = !!this.state.data.id ? this.state.data.id : sessionStorage.getItem('gateway');
        queryGateway(this.props.history, id)
            .then((res) => {
                if (!!res) {
                   let breads = [
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
                            href: '/user/gateway/detail',
                            text: res.gatewayEui
                        }
                    ];
                   sessionStorage.setItem('project_name', res.projectName);
                   sessionStorage.setItem('project', res.projectId);
                    this.setState({data: {...res}, breads, projectName: res.projectName});
                }
            });
        queryGatewayJson(this.props.history, id)
            .then((res) => {
                if (!!res) {
                     this.setState({jsonData: { ...res}});
                }
            });
    }

    toUpdate = () => {
        $("#system-item").addClass('ant-menu-item-selected');
        $("#projects-item").removeClass('ant-menu-item-selected');
        this.props.history.push('/user/system');
    }
    resetGateway = () => {
        this.setState({uploading: true});
        resetGateway(this.props.history, this.state.gateId)
            .then((res) => {
                if (!!res) {
                    message.success('网关已重启！');
                    this.setState({uploading: false})
                } else {
                    message.error(res.msg||'网关重启失败！');
                }
            })
    };
    // cancelMap =()=>{
    //     this.setState({mapVisible:false});
    // };
    handleMap = () => {
        // this.setState({mapVisible:!this.state.mapVisible});
        $('.pickMapBox').toggle();
        let map = new BMap.Map('pickMap');
        let data = this.state.data;
        let point = new BMap.Point(Number(data.longitude), Number(data.latitude));
        map.centerAndZoom(point, 12);
        map.enableScrollWheelZoom(true);
        let marker = new BMap.Marker(point);
        map.addOverlay(marker);
    };

    showDetail = () => {
        let id = !!this.state.data.id ? this.state.data.id : sessionStorage.getItem('gateway');
        this.setState({upDetail: true});
        queryFreq(this.props.history, id)
            .then((res) => {
                if (!!res) {
                    this.setState({upDetailData: res});
                }
            });
    }
    handleCancel = () => {
        this.setState({upDetail: false, editGateway: false});
    }

    editGateway = () => {
        this.setState({editGateway: true});
    }

    editGatewayHandle = (e) => {
        e.preventDefault();
        let gate = this.state.gateId;
        this.refs.gatewayEdit.validateFields((err, values)=> {
            if (!err) {
                let req = {
                    id: gate.id,
                    bandId: gate.bandId,
                    devEui: gate.devEui,
                    name:values.name,
                    longitude:values.longitude.toString(),latitude:values.latitude.toString()
                };
                editGateway(this.props.history, req)
                    .then((res)=> {
                        if (!!res) {
                            this.setState({
                                editGateway: false,
                                data: {...res}
                            })
                            message.success('已修改！')
                        }else{
                            message(res.msg||'修改失败')
                        }
                    });
            }
        })
    }

    upLinkList = () => {
        return this.state.upDetailData.map((item, index) => {
            return (
                <li key={index}>
                    <span>{item.index}</span>
                    <span>{item.freq}</span>
                    <span>{item.type}</span>
                </li>
            )
        })
    }

    refleshData = (item) => {
        let id = !!this.state.data.id ? this.state.data.id : sessionStorage.getItem('gateway');
        queryGatewayJson(this.props.history, id)
            .then((res) => {
                if (!!res) {
                    let jsonData = this.state.jsonData;
                    jsonData[item] = res[item];
                    this.setState({jsonData});
                    message.success('刷新成功');
                }
            });

    };
    render() {
        const data = this.state.data;
        const jsonData=this.state.jsonData;
        const upDetailData=this.state.upDetailData;
        const upList=this.upLinkList();
        let lbtVal;
        if (data.lbt === 0) {
            lbtVal = (
                <span className="con">不支持</span>
            )
        } else if (data.lbt === 1) {
            lbtVal = (
                <span className="con">未使能</span>
            );
        } else if (data.lbt === 2) {
            lbtVal = (
                <span className="con">使能</span>
            )
        }else{
            lbtVal = (
                <span className="con"></span>
            )
        }
        let gatewayTypeVal;
        if(data.gatewayType===2) {
            gatewayTypeVal = (
                <span className="con">TDD</span>
            );
        }else if(data.gatewayType===3){
            gatewayTypeVal = (
                <span className="con">FDD</span>
            );
        }else{
            gatewayTypeVal = (
                <span className="con"></span>
            );
        }
        let  statEthernetVal;
        if(data.statEthernet===0) {
            statEthernetVal = (
                <span className="con">没有接网线</span>
            );
        }else if(data.statEthernet===1){
            statEthernetVal = (
                <span className="con">无法连接</span>
            );
        }else if(data.statEthernet===2){
            statEthernetVal = (
                <span className="con">传输中</span>
            );
        }else if(data.statEthernet===3){
            statEthernetVal = (
                <span className="con">挂起</span>
            );
        }else{
            statEthernetVal = (
                <span className="con"></span>
            );
        }

        let  G1Val;
        if(data.stat4g1===0) {
            G1Val = (
                <span className="con">没有4G</span>
            );
        }else if(data.stat4g1===1){
            G1Val = (
                <span className="con">无法连接</span>
            );
        }else if(data.stat4g1===2){
            G1Val = (
                <span className="con">传输中</span>
            );
        }else if(data.stat4g1===3){
            G1Val = (
                <span className="con">挂起</span>
            );
        }else{
            G1Val = (
                <span className="con"></span>
            );
        }

        let  G2Val;
        if(data.stat4g2===0) {
            G2Val = (
                <span className="con">没有4G</span>
            );
        }else if(data.stat4g2===1){
            G2Val = (
                <span className="con">无法连接</span>
            );
        }else if(data.stat4g2===2){
            G2Val = (
                <span className="con">传输中</span>
            );
        }else if(data.stat4g2===3){
            G2Val = (
                <span className="con">挂起</span>
            );
        }else{
            G2Val = (
                <span className="con"></span>
            );
        }

        // let upTime;
        // if(!!data.uptime){
        //     let upDay=parseInt(data.uptime/1440);
        //     let upHours=parseInt(data.uptime%1440/60);
        //     let upMinutes=parseInt(data.uptime%1440%60);
        //     if(upDay>0){
        //         upTime=(
        //             <span className="con">{upDay}天{upHours}小时{upMinutes}分钟</span>
        //         );
        //     }else if(upDay===0&&upHours>0){
        //         upTime=(
        //             <span className="con">{upHours}小时{upMinutes}分钟</span>
        //         );
        //     }else{
        //         upTime=(
        //             <span className="con">{upMinutes}分钟</span>
        //         );
        //     }
        // }else{
        //     upTime=(
        //         <span className="con">0分钟</span>
        //     );
        // }


        return (

            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {data.name}
                        <Tag color="blue">{this.state.projectName}</Tag>
                        <Tag color={data.status == 'ONLINE' ? 'green' : 'red'} className={!!data.status?'':'hide'}>{data.status=='ONLINE'?'在线':'离线'}</Tag>
                    </div>
                    <div className="button">
                        <Button onClick={this.editGateway}>编辑</Button>
                        <Button onClick={this.resetGateway} loading={this.state.uploading}>重启网关</Button>
                        <Button type="primary" onClick={this.toUpdate}>固件升级</Button>
                    </div>
                </div>
                <div className="content-detail gatewayDetail">
                    <Row gutter={24}>
                        <Col className="gutter-row" span={6}>
                            <div className="gutter-box dashboard flexBox">
                                <div className="text">
                                    <p>CPU占用率（%）</p>
                                    <h3>{getProperValue(data.cpu)}</h3>
                                </div>
                                <Progress type="circle" percent={!!data.cpu ? data.cpu : 0 } width={60} strokeWidth={14}/>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                            <div className="gutter-box dashboard flexBox">
                                <div className="text">
                                    <p>RAM占用（%）</p>
                                    <h3>{getProperValue(data.memory)}</h3>
                                </div>
                                <Progress type="circle" percent={!!data.memory ? data.memory : 0 } width={60} strokeWidth={14}/>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                            <div className="gutter-box dashboard flexBox">
                                <div className="text">
                                    <p>湿度（%）</p>
                                    <h3>{getProperValue(data.humidity)}</h3>
                                </div>
                                <i className="iconfont icon-sd"></i>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                            <div className="gutter-box dashboard flexBox">
                                <div className="text">
                                    <p>温度（℃）</p>
                                    <h3>{getProperValue(data.temperature) }</h3>
                                </div>
                                <i className="iconfont icon-trwd"></i>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col className="gutter-row" span={8}>
                            <div className="gutter-box dashboard flexBox">
                                <div className="text">
                                    <p>4G1信号质量</p>
                                    <h3>{data.fourG1Quality?data.fourG1Quality:'----'}</h3>
                                </div>
                                <i className={parseInt(data.fourG1Quality)===85||!data.fourG1Quality||parseInt(data.fourG1Quality)==0?'iconfont icon-g3':-113<=parseInt(data.fourG1Quality)&&parseInt(data.fourG1Quality)<=-105?'iconfont icon-g1':-105<parseInt(data.fourG1Quality)&&parseInt(data.fourG1Quality)<=-95?'iconfont icon-g2':-95<parseInt(data.fourG1Quality)&&parseInt(data.fourG1Quality)<=-85?'iconfont icon-g':'iconfont icon-4g'}></i>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div className="gutter-box dashboard flexBox">
                                <div className="text">
                                    <p>4G2信号质量</p>
                                    <h3>{data.fourG2Quality?data.fourG2Quality:'----'}</h3>
                                </div>
                                <i className={parseInt(data.fourG2Quality)===85||!data.fourG2Quality||parseInt(data.fourG2Quality)==0?'iconfont icon-g3':-113<=parseInt(data.fourG2Quality)&&parseInt(data.fourG2Quality)<=-105?'iconfont icon-g1':-105<parseInt(data.fourG2Quality)&&parseInt(data.fourG2Quality)<=-95?'iconfont icon-g2':-95<parseInt(data.fourG2Quality)&&parseInt(data.fourG2Quality)<=-85?'iconfont icon-g':'iconfont icon-4g'}></i>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div className="gutter-box dashboard flexBox">
                                <div className="text">
                                    <p>GPS搜星个数</p>
                                    <h3>{getProperValue(data.gpsCnt)}</h3>
                                </div>
                                <i className="iconfont icon-gps"></i>
                            </div>
                        </Col>
                    </Row>
                    <div className="dashboard detail">
                        <div className="item">
                            <h2 className="title">基本属性</h2>
                            <ul className="clearfix">
                                <li>
                                    <span className="name">网关名称：</span>
                                    <span className="con">{data.name}</span>
                                </li>
                                <li>
                                    <span className="name">macAddr：</span>
                                    <span className="con">{data.macAddr}</span>
                                </li>
                                <li>
                                    <span className="name">GatewayEui：</span>
                                    <span className="con">{data.gatewayEui}</span>
                                </li>
                                <li>
                                    <span className="name">产品类型：</span>
                                    <span className="con">{data.type}</span>
                                </li>
                                <li>
                                    <span className="name">网关类型：</span>
                                    <span className="con">{gatewayTypeVal}</span>
                                </li>
                                <li>
                                    <span className="name">固件版本：</span>
                                    <span className="con">{data.version}</span>
                                </li>
                                <li>
                                    <span className="name">所属项目：</span>
                                    <span className="con">{this.state.projectName}</span>
                                </li>
                                <li>
                                    <span className="name">创建时间：</span>
                                    <span className="con">{data.createdDate}</span>
                                </li>
                                <li>
                                    <span className="name">LBT：</span>
                                    {lbtVal}
                                </li>
                                <li>
                                    <span className="name">SX1280：</span>
                                    <span className="con">{data.sx1280===0?'不支持':data.sx1280===1?'未使能':'使能'}</span>
                                </li>
                                <li>
                                    <span className="name">最后在线时间：</span>
                                    <span className="con">{data.lastOnlineTime}</span>
                                </li>
                                <li>
                                    <span className="name">最后离线时间：</span>
                                    <span className="con">{data.lastOfflineTime}</span>
                                </li>
                                <li className="oneLine">
                                    <span className="name">累计运行时间：</span>
                                    <span className="con">{data.uptime}</span>
                                </li>
                                <li>
                                    <span className="name">经度：</span>
                                    <span className="con">{data.longitude}</span>
                                </li>
                                <li>
                                    <span className="name">纬度：</span>
                                    <span className="con">{data.latitude}</span>
                                </li>
                                <li>
                                    <Icon type="environment"/>
                                    <a onClick={this.handleMap}>坐标拾取</a>
                                </li>
                                <li className={this.state.mapVisible?'oneLine pickMapBox':'oneLine pickMapBox hide'}
                                    style={{'padding': '24px 32px'}}>
                                    <div id="pickMap"
                                         style={{width: '100%', height: '340px'}}>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="item">
                            <h2 className="title">运行状态</h2>
                            <ul className="clearfix">
                                <li>
                                    <span className="name">状态：</span>
                                    <span className={data.status == 'ONLINE' ? 'online' : 'offline'}>
                                        <Icon type={data.status == 'ONLINE' ? 'link' : 'disconnect'}/>{data.status=='ONLINE'?'在线':'离线'}
                                    </span>
                                </li>
                                <li>
                                    <span className="name">网关IP地址：</span>
                                    <span className="con">{data.ip}</span>
                                </li>
                                <li className="oneLine">
                                    <span className="name">以太网：</span>
                                    <span className="con dangerColor">{statEthernetVal}</span>
                                    <p>
                                        <span className="con">以太网上行字节数:{data.ethRxBytes}</span>
                                        <span className="con">以太网下行字节数:{data.ethTxBytes}</span>
                                    </p>
                                </li>
                                <li className="oneLine">
                                    <span className="name">4G1：</span>
                                    <span className="con dangerColor">{G1Val}</span>
                                    <p>
                                        <span className="con">4G1上行字节数:{data.fourG1TxBytes}</span>
                                        <span className="con">4G1下行字节数:{data.fourG1RxBytes}</span>
                                    </p>
                                </li>
                                <li className="oneLine">
                                    <span className="name">4G2：</span>
                                    <span className="con dangerColor">{G2Val}</span>
                                    <p>
                                        <span className="con">4G2上行字节数:{data.fourG2TxBytes}/</span>
                                        <span className="con">4G2下行字节数:{data.fourG2RxBytes}</span>
                                    </p>
                                </li>
                                <li>
                                    <span className="name">心跳间隔（s）：</span>
                                    <span className="con">{data.heartbeat}</span>
                                </li>
                                <li>
                                    <span className="name">网关接收数据包数/min：</span>
                                    <span className="con">{data.rxnb}</span>
                                </li>
                                <li style={{'clear': 'both'}}>
                                    <span className="name">网关发送数据包数/min：</span>
                                    <span className="con">{data.dwnb}</span>
                                </li>
                                <li>
                                    <span className="name">网络延迟（ms）：</span>
                                    <span className="con">{data.delay}</span>
                                </li>
                            </ul>
                        </div>
                        <div className="item">
                            <h2 className="title">射频参数</h2>
                            <ul className="clearfix">
                                <li>
                                    <span className="name">上行通道数：</span>
                                    <span className="con">{data.rxChannels}</span>
                                </li>
                                <li>
                                    <span className="name">上行频率（HZ）：</span>
                                    <a onClick={this.showDetail} style={{'marginLeft': '24px'}}>详情</a>
                                </li>
                                <li style={{'clear': 'both'}}>
                                    <span className="name">下行通道数：</span>
                                    <span className="con">{data.txChannels}</span>
                                </li>
                                <li>
                                    <span className="name">下行功率（dBm）：</span>
                                    <span className="con">{data.netWorkPower}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <Row gutter={24} className="jsonList">
                        <Col className="gutter-row" span={12}>
                            <div className="gutter-box dashboardNo">
                                <div className="head">
                                    <span>Join</span>
                                    <Icon type="sync" onClick={this.refleshData.bind(this, 'join')}/>
                                </div>
                                <div className="conBox">
                                    <div className="jsonText">
                                        {JSON.stringify(jsonData.join)}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={12}>
                            <div className="gutter-box dashboardNo">
                                <div className="head">
                                    <span>Heatbeat</span>
                                    <Icon type="sync" onClick={this.refleshData.bind(this, 'heatbeat')}/>
                                </div>
                                <div className="conBox">
                                    <div className="jsonText">
                                        {JSON.stringify(jsonData.heartbeat)}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={12}>
                            <div className="gutter-box dashboardNo">
                                <div className="head">
                                    <span>State</span>
                                    <Icon type="sync"  onClick={this.refleshData.bind(this, 'state')}/>
                                </div>
                                <div className="conBox">
                                    <div className="jsonText">
                                        {JSON.stringify(jsonData.status)}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={12}>
                            <div className="gutter-box dashboardNo">
                                <div className="head">
                                    <span>Rxpk</span>
                                    <Icon type="sync"  onClick={this.refleshData.bind(this, 'rxpk')}/>
                                </div>
                                <div className="conBox">
                                    <div className="jsonText">
                                        {JSON.stringify(jsonData.rxpk)}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={12}>
                            <div className="gutter-box dashboardNo">
                                <div className="head">
                                    <span>Txpk</span>
                                    <Icon type="sync"  onClick={this.refleshData.bind(this, 'txpk')}/>
                                </div>
                                <div className="conBox">
                                    <div className="jsonText">
                                        {JSON.stringify(jsonData.txpk)}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <Modal ref="upDetail" className='noSelectTable'
                       centered
                       visible={this.state.upDetail}
                       title="上行频率详情"
                       maskClosable={false}
                       width={800}
                       onCancel={this.handleCancel}
                       footer={null}
                >
                    <ul className="upLinkList">
                        <li>
                            <span>信道编号</span>
                            <span>上行频率（Hz）</span>
                            <span>类型</span>
                        </li>
                        {upList}
                    </ul>
                </Modal>
                <Modal ref="editGateway"
                       centered
                       visible={this.state.editGateway}
                       title="编辑网关"
                       maskClosable={false}
                       width={860}
                       handleMap={true}
                       onCancel={this.handleCancel}
                       onOk={this.editGatewayHandle}
                >
                    <GATEWAY ref="gatewayEdit" key={new Date()} data={data}/>
                </Modal>
            </Content>
        )
    }
}

const GATEWAY = Form.create()((props) => {
    const { getFieldDecorator } = props.form;
    const data = props.data;
    const layout = {
        labelCol: {
            xs: {span: 16},
            sm: {span: 7},
        },
        wrapperCol: {
            xs: {span: 16},
            sm: {span: 17},
        }
    };
    const handleMap = () => {
        let $pickMapBox = $("#pickMapBoxTc");
        $pickMapBox.show();
        let map = new BMap.Map('pickMapTc');
        let point = new BMap.Point(Number(props.data.longitude), Number(props.data.latitude));
        map.centerAndZoom(point, 12);
        map.enableScrollWheelZoom(true);
        let marker = new BMap.Marker(point);
        map.addOverlay(marker);

        map.addEventListener("click", (e) => {
            map.clearOverlays();
            let marker = new BMap.Marker(e.point);
            map.addOverlay(marker);
            props.form.setFieldsValue({
                longitude: e.point.lng.toString(),
                latitude: e.point.lat.toString()
            });
        });
    };

    return (
        <div className="mapTcBox">
            <Form>
                <Form.Item {...layout}
                           label={(<span>网关名称</span>)}>
                    {getFieldDecorator('name', {
                        rules: [
                            {required: true, message: '请输入网关名称!'},
                            {max: 30, min: 4, message: '支持中文、英文字母、数字和下划线，长度限制4~30'}
                        ],
                        initialValue: props.data.name
                    })(
                        <Input placeholder="网关名称"/>
                    )}
                </Form.Item>
                <Form.Item label="经度" {...layout}>
                    <Row gutter={8}>
                        <Col span={16}>
                            {
                                getFieldDecorator('longitude', {
                                    rules: [{
                                        required: false, message: '请输入经度！'
                                    }, {max: 180, min: -180, message: '请输入正确的经度！'}],
                                    initialValue: props.data.longitude.toString()
                                })(
                                    <Input placeholder={props.data.longitude.toString()}/>
                                )
                            }
                        </Col>
                        <Col span={8}/>
                    </Row>
                </Form.Item>
                <Form.Item label="纬度" {...layout}>
                    <Row gutter={8}>
                        <Col span={16}>
                            {
                                getFieldDecorator('latitude', {
                                    rules: [{
                                        required: false, message: '请输入纬度！'
                                    }, {max: 90, min: -90, message: '请输入正确的纬度！'}],
                                    initialValue: props.data.latitude.toString()
                                })(
                                    <Input placeholder={props.data.latitude.toString()}/>
                                )
                            }
                        </Col>
                        <Col span={8}>
                            <Button onClick={handleMap.bind(this)}>拾取坐标</Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
            <div className="pickMapBox hide" id="pickMapBoxTc">
                <div id="pickMapTc"
                     style={{width: '100%', height: '340px'}}>
                </div>
            </div>
        </div>
    );
});