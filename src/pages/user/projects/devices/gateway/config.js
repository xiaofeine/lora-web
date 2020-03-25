/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import { Layout, Tag, Button, Upload, Icon, Form, Input, Radio, Modal, notification, InputNumber, message } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
import {domain} from 'Configs/utils';

const {Content} = Layout;
import {queryGateway, configAddFile, configNetPower, configLss, configRead } from 'Api/gateway';

const RadioGroup = Radio.Group;

class Config extends React.Component {
    state = {
        state: 'ONLINE',
        data: {},
        edit: false,
        breads: [],
        uploading: false,
        fileData: {
            id: sessionStorage.getItem('gateway'),
        },
        fileName: '暂无',
        upTime: '暂无',
        fileList: [],
        projectName: sessionStorage.getItem('project_name'),
        readClass: true,
    }

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
						},
						{
							href: '/user/gateway/config',
							text: '网关配置'
						}
					];
                    this.setState({data: {...res}, breads});
                }
            });
    }

    handlePower = () => {
        this.props.form.validateFields((err, values) => {
            if (!!values) {
                Modal.confirm({
                    title: '功率设置',
                    content: '确定要修改网络功率吗？',
                    onOk: ()=> {
                        if (!!values) {
                            let req = {...values};
                            req.id = this.state.data.id;
                            configNetPower(this.state.history, req)
                                .then((res) => {
                                    if (!!res) {
                                        message.success('网络功率已设置！');
                                        this.setState({
                                            data:res,
                                            edit: !this.state.edit,
                                        })
                                    } else {
                                        message.error(res.msg||'提交失败!');
                                    }
                                }).catch(() => {
                            })
                        }
                    }
                })
            }
        })
    }

    handleLss = () => {
        let id = !!this.state.data.id ? this.state.data.id : sessionStorage.getItem('gateway');
        this.setState({uploading: true});
        Modal.confirm({
            title: '确定要下发吗？',
            onOk: () => {
                if (!!id) {
                    configLss(this.props.history, id)
                        .then((res) => {
                            if (!!res) {
                                this.setState({
                                    uploading: false,
                                });
                                this.setState({
                                    data:{
                                        aloneSetPower:this.state.data.netWorkPower,
                                        netWorkPower:this.state.data.netWorkPower,
                                        configName:this.state.data.configName,
                                        configTime:this.state.data.configTime,
                                        configStatus:'CONFIG_SUCCEED',
                                    }
                                })
                            } else {
                                this.setState({
                                    uploading: false,
                                });
                                this.setState({
                                    data:{
                                        aloneSetPower:this.state.data.netWorkPower,
                                        netWorkPower:this.state.data.netWorkPower,
                                        configName:this.state.data.configName,
                                        configTime:this.state.data.configTime,
                                        configStatus:'CONFIG_FAILED',
                                    }
                                })
                            }
                        })
                } else {
                    Modal.success({
                        title: '没有上传的文件！',
                    })
                }
            }
        })

    }

    readConfig = () => {
        let id = !!this.state.data.id ? this.state.data.id : sessionStorage.getItem('gateway');
        Modal.confirm({
            title: '确定要读取配置吗？',
            onOk: () => {
                if (!!id) {
                    this.setState({readClass:false});
                    configRead(this.props.history, id)
                        .then((res) => {
                            if (!!res) {
                                message.success('已提交！');
                            } else {
                                this.setState({
                                    readClass:true
                                })
                            }
                        })
                }
            }
        })
    }

    toggleEdit = () => {
        this.setState({edit: !this.state.edit})
    }

    radioOption = (e) => {
        let alone = this.state.data.aloneSetPower;
        this.state.data.aloneSetPower=!alone;
    }

    handleUploadChange = ({file, fileList}) => {
        fileList = fileList.map((f) => {
            if (file.uid === f.uid) {
				if (f.status === 'done') {
				    if (f.response.code === 8000) {
						message.success(`${f.name} 已上传`);
                        let lastTime = f.lastModifiedDate.toDateString();
                        this.setState({
                            data:{
                                ...this.state.data,
                                configName:f.name,
                                configTime:lastTime,
                                configStatus:'CONFIGING',
                            }
                        })
                    } else {
						Modal.error({
							title: '上传失败',
                            content: f.response.msg,
						});
                    }

				} else if (f.status === 'error') {
                    message.error({
						title: `${f.name} 上传失败`,
					});
				} else {
                }
            }
        });
        return fileList;
    }

    render() {
        const data = this.state.data;
        {console.log(data)}
        const edit = this.state.edit;
        const id = !!this.state.data.id ? this.state.data.id : sessionStorage.getItem('gateway');
        const {getFieldDecorator} = this.props.form;
        const uploadProps = {
            action: domain + 'api/v1/lorawan/gateways/uploadConfig?id=' + id,
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token'),
            },
            showUploadList: true,
            onChange: this.handleUploadChange,
        };
        const options = [{
            label: '是',
            value: 'true'
        }, {
            label: '否',
            value: 'false'
        }];
        let cofigState;
        if(data.configStatus==='CONFIGING'){
            cofigState='正在配置';
        }else if(data.configStatus==='CONFIG_SUCCEED'){
            cofigState='配置成功';
        }else if(data.configStatus==='CONFIG_FAILED'){
            cofigState='配置失败';
        }else{
            cofigState='暂无数据';
        }
        return (
            <Content>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {data.name}
                        <Tag color="blue">{this.state.projectName}</Tag><Tag
                        color={data.status == 'ONLINE' ? 'green' : 'red'}>{data.status == 'ONLINE' ? '在线' : '离线'}</Tag>
                    </div>
                </div>
                <div className="content-detail ">
                    <div className="dashboard">
                        <h2 className="title">网关配置</h2>
                        <div className="importFile">
                            <h3 className="title">导入文件<Button type="primary" className="fr"
                                                              onClick={this.handleLss}>下发</Button></h3>
                            <Upload {...uploadProps}>
                                <Button>
                                    <Icon type="upload"/> 上传文件
                                </Button>
                            </Upload>
                            <a href={'/static/assets/files/global_conf.rar'} download
                               style={{marginTop: '24px'}}>下载模板</a>
                            <a style={{marginLeft: '24px'}} onClick={this.readConfig} className={ this.state.readClass ? 'readable':'disreadable'}>读取配置</a>
                            <p className="tipText">最近:<span>{data.configName}</span>
                                <span>{data.configTime}</span><span>{cofigState}</span>
                            </p>
                        </div>
                        <div className="importFile">
                            <h3 className="title">功率设置<a className="fr"
                                                         onClick={this.toggleEdit}>{edit ? '取消' : '编辑'}</a></h3>
                            {this.state.edit ?
                                <div ref="config">
                                    <Form style={{'marginTop': '24px'}}>
                                        <Form.Item
                                            label="单独设置功率" value="data.aloneSetPower"
                                        >
                                            {getFieldDecorator('aloneSetPower', {
                                                initialValue: String(data.aloneSetPower),
                                                rules: [
                                                    {
                                                        required: true
                                                    }
                                                ],
                                            })(
                                                <RadioGroup options={options} name="aloneSetPower" onChange={this.radioOption}/>
                                            )}
                                        </Form.Item>
                                        <Form.Item className={data.aloneSetPower == true ? 'show' : 'hide'}
                                                   label={(<span>功率参数（dBm）</span>)}>
                                            {getFieldDecorator('netWorkPower', {
                                                rules: [{
                                                        required: true, message: '请输入功率参数!',
                                                    },{
                                                        min: 0, max: 30, type: 'number', message: '范围0-30!',
                                                    }],
                                                initialValue: data.netWorkPower
                                            })(
                                                <InputNumber size="large" placeholder='请输入功率参数' style={{'width':'200px'}}/>
                                            )}
                                        </Form.Item>
                                    </Form>
                                    <Button type="primary" onClick={this.handlePower}>提交</Button>
                                </div>
                                :
                                <div>
                                    <p>单独设置功率：<span>{data.aloneSetPower ? '是' : '否'}</span></p>
                                    <p>功率参数(dBm)：<span>{data.netWorkPower}</span></p>
                                </div>}
                        </div>
                    </div>
                </div>
            </Content>
        )
    }
}

const GateConfig = Form.create({})(Config);

export default GateConfig