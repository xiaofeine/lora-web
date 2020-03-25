/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import { Layout, Button, Radio, Form, Input, Modal, message,Tag, Row, Col } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import copy from 'copy-to-clipboard';
import { editProject, queryProject } from 'Api/project';
import {getCode, domain} from 'Configs/utils';

const {Content} = Layout;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

message.config({
    top: 200,
    duration: 2,
    maxCount: 3,
});

export default class ProDetail extends React.Component {

    state = {
        breads: [],
        data: {},
        detail: false,
        toEdit: false,
        radioOption: true,
        radioValue: '是',
        currentRow: {}
    }

    componentDidMount() {
        let id = !!this.state.data.id?this.state.data.id:sessionStorage.getItem('project');
        queryProject(this.props.history, id)
            .then((res)=> {
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
                            text: res.name,
                        }
                    ];
                    this.setState({ data: {...res}, breads });
                }
            });
    }

    toCopy = (type, e) => {
        copy(this.state.data[type]);
        message.success('复制成功');
    }

    toEdit = () => {
        let DETAIL = {
            appEui: getCode(16),
        };
        sessionStorage.setItem('detail', JSON.stringify(DETAIL));
        this.setState({ detail: true, toEdit: true });
    }
    handleCancel = () => {
        this.setState({ toEdit: false, detail: false, });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.refs.detail.validateFields((err, values) => {
            if (!err) {
                Modal.confirm({
                    title: '确定要修改吗？',
                    onOk:()=>{
                        if (!err) {
                            let req = {
                                ...values,
                                // appEui: values.appEui.replace(/-/g, '')
                            };
                            req.id = this.state.data.id;
                            let data=this.state.data;
                            editProject(this.props.history, req)
                                .then((res) => {
                                    if (!!res) {
                                        message.success('已修改！');
                                        this.setState({
                                            data: Object.assign({}, data,{...res}),
                                            toEdit: false,
                                            detail: false
                                        })
                                    } else {
                                        message.error(res.msg||'修改失败！');
                                    }
                                }).catch(() => {
                                console.log('catch back');
                            })
                        }

                    }

                })
            }
        });
    }

    radioOption = (e) => {
        this.state.data.encryption=!this.state.data.encryption;
    }

    reGet = (type,e) => {
        this.setState(() => ({
            type: this.state.type
        }));
    }

    render() {
        const data = this.state.data;
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {data.name}
                    </div>
                    <div className="button">
                        <Button type="primary" onClick={this.toEdit}>编辑</Button>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        <ul className="item-detail-list">
                            <li>
                                <i className="iconfont icon-jdsl"></i>
                                <div className="text-con">
                                    <p>节点数量</p>
                                    <h3>{data.deviceSize}</h3>
                                </div>
                            </li>
                            <li>
                                <i className="iconfont icon-wgzs"></i>
                                <div className="text-con">
                                    <p>网关总数</p>
                                    <h3>{data.gatewaySize}</h3>
                                </div>
                            </li>
                            <li>
                                <i className="iconfont icon-zxwg"></i>
                                <div className="text-con">
                                    <p>在线网关</p>
                                    <h3>{data.onlineGatewaySize}</h3>
                                </div>
                            </li>
                            <li>
                                <i className="iconfont icon-http"></i>
                                <div className="text-con">
                                    <p>HTTP接口数量</p>
                                    <h3>{data.httpEndpointSize}</h3>
                                </div>
                            </li>
                            <li>
                                <i className="iconfont icon-mqtt"></i>
                                <div className="text-con">
                                    <p>MQTT接口数量</p>
                                    <h3>{data.mqttEndpointSize}</h3>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="dashboard">
                        <div className="title">项目详情</div>
                        <ul className="detail-list clearfix" style={{'marginTop': '24px'}}>
                            <li>
                                <span className="list-name">项目名称：</span>
                                <span className="list-com">{data.name}</span>
                            </li>
                            <li>
                                <span className="list-name">项目id：</span>
                                <span className="list-com">{data.id}</span>
                            </li>
                            <li>
                                <span className="list-name">是否加密：</span>
                                <span className="list-com">
                                    <em className={data.encryption === true ? 'able-dot' : 'disable-dot'}>
								    </em>
                                    {data.encryption === true ? '是' : '否'}
                                </span>
                            </li>
                            <li className={data.encryption === true ? 'show' : 'hide'}>
                                <span className="list-name">secretKey：</span>
                                <span className="list-com">{data.secretKey}</span>
                                <a onClick={this.toCopy.bind(this, "secretKey")}
                                   style={{'fontSize': '16px', 'marginLeft': '20px'}}>复制</a>
                            </li>
                            <li>
                                <span className="list-name">signToken：</span>
                                <span className="list-com">{data.signToken}</span>
                                <a onClick={this.toCopy.bind(this, "signToken")}
                                   style={{'fontSize': '16px', 'marginLeft': '20px'}}>复制</a>
                            </li>
                            {/*<li>*/}
                            {/*<span className="list-name">appEui：</span>*/}
                            {/*<span className="list-com">{data.appEui}</span>*/}
                            {/*<a onClick={this.toCopy.bind(this, "appEui")}*/}
                            {/*style={{'fontSize': '16px', 'marginLeft': '20px'}}>复制</a>*/}
                            {/*</li>*/}
                            <li>
                                <span className="list-name">项目描述：</span>
                                <span className="list-com">{data.remark}</span>
                            </li>
                        </ul>
                    </div>
                    <Modal ref="toEditDetail"
                           visible={this.state.detail}
                           title="编辑项目"
                           maskClosable={false}
                           width={600}
                           centered={true}
                           onCancel={this.handleCancel}
                           onOk={this.handleSubmit}>
                        <div>
                            <Detail ref='detail' key={new Date()} data={this.state.data}/>
                        </div>
                    </Modal>
                </div>
            </Content>
        )
    }
}

const Detail = Form.create()((props)=>{
    const data = props.data;
    // const { appEui } = JSON.parse(sessionStorage.getItem('detail'));
    const { getFieldDecorator } = props.form;
    const handleChange =(key, num)=> {
        let currentRow = {};
        currentRow[key] = getCode(num);
        props.form.setFieldsValue({
            ...currentRow
        });
    }
    const option = [{
        label: '是',
        value: true
    },{
        label: '否',
        value: false
    }]
    const layout = {
        labelCol: {
            xs: { span: 16 },
            sm: { span: 5 }
        },
        wrapperCol: {
            xs: { span: 16 },
            sm: { span: 19 }
        }
    };
    return (
        <Form>
            <Form.Item {...layout}
                       label={(<span>项目名称</span>)}>
                {getFieldDecorator('name', {
                    initialValue: String(data.name),
                    rules: [
                        {required: true, message: '请输入项目名称!'},
                        { max: 30, min: 4, message: '长度在4~30之间！'}
                    ],
                })(
                    <Input  placeholder={data.name}/>
                )}
            </Form.Item>
            <Form.Item
                {...layout}
                label="是否加密"
            >
                {getFieldDecorator('encryption', {
                    initialValue: Boolean(data.encryption),
                    rules: [
                        {
                            required: true
                        }
                    ],
                })(
                    <RadioGroup options={option} name="encryption"/>
                )}
            </Form.Item>
            {/*<Form.Item*/}
            {/*label="appEui" {...layout}>*/}
            {/*<Row gutter={8}>*/}
            {/*<Col span={20}>*/}
            {/*{*/}
            {/*getFieldDecorator('appEui', {*/}
            {/*rules: [{*/}
            {/*required: true, message: '请输入appEui！'*/}
            {/*}, {*/}
            {/*pattern: /^[0-9a-fA-F]{16}$/, message: '请输入长度为16的十六进制值！'*/}
            {/*}],*/}
            {/*initialValue: appEui,*/}
            {/*})(*/}
            {/*<Input placeholder={appEui}/>*/}
            {/*)*/}
            {/*}*/}
            {/*</Col>*/}
            {/*<Col span={4}>*/}
            {/*<Button onClick={handleChange.bind(this, 'appEui', 16)} >换一换</Button>*/}
            {/*</Col>*/}
            {/*</Row>*/}
            {/*</Form.Item>*/}
            <Form.Item className="signToken" {...layout}
                       label={(<span>项目描述</span>)}>
                {getFieldDecorator('remark', {
                    initialValue: data.remark,
                    rules: [
                        {
                            required: false, message: '请输入项目描述!'
                        },
                        {max: 100, min: 0, message: '长度在0~100之间！'}
                    ],
                })(
                    <TextArea  placeholder={data.remark||'请输入项目描述'}/>
                )}
            </Form.Item>
        </Form>
    );
});
