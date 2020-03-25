/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout, Tag, Button, Modal, Row, Col, Input, Radio, Select, InputNumber, message } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import { editParams, queryParams } from "Api/params";
import { Form } from "antd/lib/index";
import {  getBands } from 'Api/project';

const { Content } = Layout;
const RadioGroup = Radio.Group;
const Option = Select.Option;

export default class Params extends React.Component {
    state = {
        breads: [
            {
                href: 'dashboard',
                text: '首页'
            },
            {
                href:'/user/projects',
                text: '项目管理'
            },
            {
                href: '/user/project/detail',
                text: sessionStorage.getItem('project_name')
            },
            {
                href: '/user/project/params',
                text: '网络参数'
            }
        ],
        data: {
            id: sessionStorage.getItem('project'),
            netWorkParam: {
                bandId: sessionStorage.getItem('band')
            }
        },
        toEdit: false,
        params: false,
        edit: false,
        fields: {
            bandId: {
                value: null,
            },
            bands: []
        }
    }
    toEdit = () => {
        let fields = this.state.fields;
        this.setState({
            toEdit: true,
            fields: {
                bandId: {
                    value: null,
                },
                bands: fields.bands
            },
        });
    }
    handleCancel= () => {
        this.setState({ toEdit: false })
    }
    componentDidMount() {
        const { data } = this.state;
        getBands(this.props.history)
            .then((res)=> {
                if (!!res) {
                    let fields = this.state.fields;
                    fields.bands = [...res];
                }
            });
        queryParams(this.props.history, {id: data.id})
            .then((res) => {
                if(!!res){
                    this.setState({ data: res })
                }
            })
    }
    handleChange =(changeFields)=> {
        this.setState(({fields})=>({
            fields: {...fields, ...changeFields},
        }));
    }
    handleSubmit =(e)=> {
        e.preventDefault();
        this.refs.params.validateFields((err, values)=> {
            if (!err) {
                Modal.confirm({
                    title: '确定要修改吗？',
                    onOk: ()=> {
                        let req = {...values};
                        req.id = this.state.data.id;
                        editParams(this.props.history, req)
                            .then((res)=> {
                                if (!!res) {
                                    message.success('已编辑！');
                                    this.setState({
                                        data:res,
                                        edit: !this.state.edit,
                                    });
                                    sessionStorage.setItem('band_name', res.netWorkParam.bandName);
                                    this.handleCancel();
                                } else {
                                    message.error(res.msg||'编辑失败!');
                                }
                            });
                    }
                })
            }
        })
    }


    render() {
        const fields = this.state.fields;
        const { data } = this.state;
        const liDiv = (name, value) => {
            return (
                <li key={name}>
                    <span className="list-name" style={{marginRight: '8px'}}>{name}:</span>
                    <span className="list-com">{value}</span>
                </li>
            )
        }

        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        网络参数
                    </div>
                    <div className="button">
                        <Button type="primary" onClick={this.toEdit}>编辑</Button>
                    </div>
                </div>
                <div className="content-detail">
                    <div className="dashboard">
                        <ul className="detail-list clearfix" style={{'marginTop': '24px'}}>
                            <li>
                                <span className="list-name">全局adr是否开启：</span>
                                <span className="list-com">
                                    <em className={data.netWorkParam.adrEnable === true ? 'able-dot' : 'disable-dot'}>
								    </em>
                                    {data.netWorkParam.adrEnable === true ? '是' : '否'}
                                </span>
                            </li>
                            {liDiv ("频段规范", <Tag color="#108ee9">{data.netWorkParam.bandName}</Tag>)}
                            {liDiv ("节点上行保留条数", data.netWorkParam.nodeUpLinkRetain)}
                            {liDiv ("节点下行保留条数", data.netWorkParam.nodeDownLinkRetain)}
                            {liDiv ("网关功率参数(dBm)", data.netWorkParam.netWorkPower)}
                        </ul>
                    </div>
                    <Modal
                        ref="toparams"
                        visible={this.state.toEdit}
                        title="编辑参数"
                        maskClosable={false}
                        width={650}
                        centered={true}
                        onCancel={this.handleCancel}
                        onOk={this.handleSubmit}>
                        < Pramas ref='params'  key={new Date()} data={this.state.data} {...fields} onChange={this.handleChange} />
                    </Modal>
                </div>
            </Content>
        )
    }
}
const Pramas = Form.create({})((props)=>{
    const data = props.data;
    const { getFieldDecorator } = props.form;
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
            sm: { span: 6}
        },
        wrapperCol: {
            xs: { span: 14 },
            sm: { span: 18 }
        }
    };
    return (
        <Form>
            <Form.Item
                {...layout}
                label="全局adr是否开启"
            >
                {getFieldDecorator('adrEnable', {
                    initialValue: Boolean(data.netWorkParam.adrEnable),
                    rules: [
                        {
                            required: true
                        }
                    ],
                })(
                    <RadioGroup options={option} name="encryption"/>
                )}
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span style={{marginRight: '5px'}}>频段规范&nbsp;</span>)}
                       hasFeedback={true}>
                {getFieldDecorator('bandId', {
                        initialValue: String(data.netWorkParam.bandId),
                        rules: [{
                            required: true, message: '请选择频段规范！'
                        }]
                    })(
                        <Select>
                            {
                                props.bands.map((p, index)=>{
                                    return (
                                        <Option key={'p' + index}
                                                value={p.id}>
                                            {p.name}
                                        </Option>
                                    )
                                })
                            }
                        </Select>
                    )
                }
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span>节点上行保留条数&nbsp;</span>)}>
                {getFieldDecorator('nodeUpLinkRetain', {
                    initialValue: Number(data.netWorkParam.nodeUpLinkRetain),
                    rules: [
                        {
                            required: true, message: '请输入节点上行保留条数!'
                        },
                        {min: 1,max: 1000, type: 'number', message: '条数长度在1~1000之间！'}
                    ],
                })(
                    <InputNumber  placeholder="请输入节点上行保留条数" style={{width: '100%'}}/>
                )}
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span>节点下行保留条数&nbsp;</span>)}>
                {getFieldDecorator('nodeDownLinkRetain', {
                    initialValue: Number(data.netWorkParam.nodeDownLinkRetain),
                    rules: [
                        {
                            required: true, message: '请输入节点下行保留条数!',
                        },
                        {
                            min: 1, max: 1000, type: 'number', message: '条数长度在1~1000之间！',
                        }
                    ],
                })(
                    <InputNumber  placeholder="请输入节点下行保留条数" style={{width: '100%'}}/>
                )}
            </Form.Item>
            <Form.Item {...layout}
                       label={(<span>网关功率参数(dBm)&nbsp;</span>)}>
                {getFieldDecorator('netWorkPower', {
                    initialValue: Number(data.netWorkParam.netWorkPower),
                    rules: [
                        {
                            required: true, message: '请输入网关功率参数!',
                        },
                        {
                            min: 0, max: 30, type: 'number', message: '范围0-30',
                        }
                    ],
                })(
                    <InputNumber placeholder="请输入网关功率参数(0~30之间)" style={{width: '100%'}}/>
                )}
            </Form.Item>
        </Form>
    );
});
