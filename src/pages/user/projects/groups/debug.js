import React from 'react';
import { Switch } from 'react-router-dom';
import { render } from 'react-dom';
import $ from "jquery";
import { Layout, Tag, Radio,  Input, Checkbox, Button, Transfer, Modal, Form, message } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import { groDebug, debugList, debugProList } from 'Api/groups';
import { domain } from 'Configs/utils';

const { Content } = Layout;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

class GroDebug extends React.Component{

    state = {
        breads: [
            {
                href: 'dashboard',
                text: '首页'
            },
            {
                href: '/user/projects',
                text: '项目管理'
            },
            {
                href: '/user/project/detail',
                text: sessionStorage.getItem('project_name')
            },
            {
                href: '/user/project/groups',
                text: '组播管理'
            },
            {
                href: '/user/group/detail',
                text: sessionStorage.getItem('group_name')
            },
            {
                href: '/user/group/debug',
                text: '组播调试'
            }
        ],
        debugValue: [],
        dataSource: [],
        targetKeys: [],
        debugLeft: [],
        submit: false,
        toSubmit: false,
        socket: null,
        grodebug: false,
        debug: {
            groupId: sessionStorage.getItem('groupId')
        },
        project: {
            projectId: sessionStorage.getItem('project')
        },
    }


    toSubmit = (e) => {
        e.preventDefault();
        const { debug, project } = this.state;
        this.props.form.validateFields((err, fieldsValue) => {
            if (!err) {
                const manually = !fieldsValue['manually'];
                const values = { ...fieldsValue, id: debug.groupId, gatewayEuis: [], manually };
                if (manually) {
                    debugProList(this.state.history, { id: project.projectId })
                        .then((res) => {
                            if (!!res) {
                                const debugLeft = res.reduce((project, item) => {
                                    project.push({
                                        key: item.gatewayEui,
                                        title: item.name
                                    });
                                    return project;
                                }, []);
                                this.setState({ debugLeft });
                            }
                        });
                    debugList(this.state.history, { id: debug.groupId })
                        .then((res) => {
                            if (!!res) {
                                const targetKeys = res.reduce((debug, item) => {
                                    debug.push(item.gatewayEui);
                                    return debug;
                                }, []);
                                this.setState({ targetKeys });
                            }
                        });
                    this.setState({ toSubmit: true, project, debug });
                    return;
                }
                groDebug(this.state.history, values)
                    .then((res) => {
                        if (!!res) {
                            message.success('已提交！');
                        }else{
                            message.error('提交失败！')
                        }
                    });
            }
        });
    }
    handleChange = (targetKeys) => {
        this.setState({ targetKeys});

    }
    handleCancel =()=> {
        this.setState({ toSubmit: false, submit: false });
    }
    handleSubmit = (values, req) => {
        const { debug, targetKeys } = this.state;
        const { getFieldsValue } = this.props.form;
        const filedsValue = getFieldsValue();
        const manually = !filedsValue['manually'];
        const param = {
            ...filedsValue,
            gatewayEuis: targetKeys,
            id: debug.groupId,
            manually
        };
        Modal.confirm({
            title:'确定要提交吗？',
            onOk: ()=> {
                if (!!values) {
                    req = {
                        ids: values
                    };
                }
                groDebug(this.props.history, param)
                    .then((res) => {
                        if (!!res) {
                            message.success('已提交！');
                            this.setState({toSubmit: false, targetKeys: [], debugLeft: [] });
                        }else{
                            message.error('提交失败！')
                        }
                    });
            }
        })
    }
    dataCallBack = (rule, value, callback) => {
        const { getFieldValue } = this.props.form;
        const hexData = getFieldValue('hexData');
        const regx = /^([0-9a-fA-F]{1})+$/;
        if (hexData && !regx.test(value)) {
            callback('请输入16进制数!')
        }
        callback();
    }
    radioChange = (e) => {
        const value = e.target.value;
        const { setFieldsValue } = this.props.form;
        setFieldsValue({ data: undefined });
    }
    handleClear = () => {
        this.setState({ debugValue: [] })
    }
    onChange = (e) => {
        this.setState({ debugValue: e.target.value });
    }

    componentDidMount () {
        sessionStorage.setItem('debug_close', 'on');
        let url = domain.replace('http', 'ws') + 'api/v1/websocket/lorawan/multicast?Authorization=' + sessionStorage.getItem('token');
        this.createWebSocket(url);
    }
    componentWillUnmount() {
        sessionStorage.setItem('debug_close', 'close');
        this.state.socket.close();
    }
    createWebSocket = (url) => {
        let socket;
        try {
            if ('WebSocket' in window) {
                socket = new WebSocket(url);
            } else if ('MozWebSocket' in window) {
                socket = new MozWebSocket(url);
            } else {
                socket = new SockJS(url);
            }
            socket.onopen = () => {
                console.log('on open', new Date());
            }
            socket.onmessage = (e) => {
                const debugValue = this.state.debugValue;
                let socketData = JSON.parse(e.data);
                // console.log('data', socketData)      //打印后台推送数据
                if (!!e.data) {
                    const { serverTime, code, data, target } = socketData;
                    if( sessionStorage.getItem('groupId') === target) {
                        let val;
                        if(code === 7){
                            val = `${serverTime}: ${JSON.stringify(data)}`;
                            debugValue.push(val);
                        }else if(code === 10){
                            val = `${serverTime}: ${data}`;
                            debugValue.push(val);
                        }
                        this.setState({debugValue});
                        $('.debug-box').scrollTop($('.debug-box')[0].scrollHeight);
                    }
                }
            }
            socket.onclose = (e) => {
                if (sessionStorage.getItem('debug_close') === 'close'||e.code===1008) {
                    console.log('Debugging is closed')
                } else {
                    this.reconnect(url)
                }

            }
            this.setState({ socket });
        } catch (e) {
            this.reconnect(url);
        }
    }

    reconnect =(url, lockReconnect)=> {
        if(lockReconnect) return;
        lockReconnect = true;
        setTimeout( ()=> {
            console.log('connecting');
            this.createWebSocket(url);
            lockReconnect = false;
        }, 2000);
    }



    render() {
        const { dataSource } = this.state;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 8 },
                sm: { span: 3}
            },
            wrapperCol: { span: 20 },
        };
        const formTailLayout = {
            wrapperCol: { span: 20, offset: 3 },
        };
        const option = [
            { label: '字符串', value: false },
            { label: '16进制', value: true }
        ];
        return(
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        { sessionStorage.getItem('group_name') }
                        <Tag color="blue">{ sessionStorage.getItem('project_name') }</Tag>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        <div className="content-detail">
                            <Form onSubmit={this.toSubmit}>
                                <FormItem label="组播指令:"{...formItemLayout}>
                                    {getFieldDecorator('hexData', {
                                        initialValue: false,
                                    })(
                                        <RadioGroup options={option} onChange={this.radioChange}/>
                                    )}
                                </FormItem>
                                <FormItem {...formTailLayout}>
                                    {getFieldDecorator('data', {
                                        rules: [
                                            { validator: this.dataCallBack },
                                            {required: true, message: '请输入调试内容!'}
                                        ],
                                    })(
                                        <TextArea
                                            id="grodebug"
                                            placeholder="请输入调试内容"
                                            rows={8}
                                            style={{ background:'rgba(245,245,245,1)', width: '400px'}}
                                        />
                                    )}
                                </FormItem>
                                <FormItem {...formTailLayout}>
                                    {getFieldDecorator('manually', { initialValue: false, valuePropName: 'checked', })(
                                        <Checkbox>自动选择网关</Checkbox>
                                    )}
                                </FormItem>
                                <FormItem {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">提交</Button>
                                </FormItem>
                            </Form>

                            <Modal ref="toSubmit"
                                   visible={this.state.toSubmit}
                                   maskClosable={false}
                                   title="组播-选择网关"
                                   width={600}
                                   centered={true}
                                   onCancel={this.handleCancel}
                                   onOk={this.handleSubmit}>
                                <div className="node-title clearfix">
                                    <h3>未选</h3>
                                    <h3>已选</h3>
                                </div>
                                <div>
                                    <Transfer
                                        dataSource={this.state.debugLeft}
                                        targetKeys={this.state.targetKeys}
                                        showSearch
                                        listStyle={{height: 300}}
                                        operations={['指派', '取消']}
                                        render={item => `${item.title}`}
                                        onChange={this.handleChange}
                                        searchPlaceholder={'请输入搜索内容'}
                                    />
                                </div>
                            </Modal>
                            <Form>
                                <FormItem  label="调试数据如下：" {...formItemLayout}>
                                    <Button type="primary" style={{float: 'right'}} onClick={this.handleClear}>清除</Button>
                                </FormItem>
                                <FormItem {...formTailLayout}>
                                    <TextArea
                                        className="debug-box"
                                        value={this.state.debugValue.join('\n')}
                                        rows={14}
                                        style={{ background:'rgba(245,245,245,1)' }}
                                        onChange={this.onChange}
                                        readOnly={true}
                                    />
                                </FormItem>
                            </Form>
                        </div>
                    </div>
                </div>
            </Content>
        )
    }
}

export default Form.create()(GroDebug)