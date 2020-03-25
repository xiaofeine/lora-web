import React, {Component} from 'react';
import { Tag, Table, Button, Modal } from 'antd';
import LoraBread from 'Commons/breadcrumb/index';
// const {Content} = Layout;
import { queryGateway, queryGatewaysLog, readLog } from 'Api/gateway';

class Log extends Component {
    queryConfig = () =>{
        let id = !!this.state.data.id ? this.state.data.id : sessionStorage.getItem('gateway');
        queryGatewaysLog(this.props.history, id)
            .then((res) => {
                if (!!res) {
                    this.setState({dataSource: res});
                }
            });
    }
    readLog = ( logType, logday ) =>{
        let req;
        if(logday!==1){
            req = {logType:logType, logday:logday,id:sessionStorage.getItem('gateway')};
        }else{
            req = {logType:logType,id:sessionStorage.getItem('gateway')};
        }
        this.setState({uploading: true});
        Modal.confirm({
            title: '确定要读取吗？',
            onOk: () => {
                readLog(this.props.history, req)
                    .then((res) => {
                        this.setState({uploading: false});
                    })
            }
        })
    }
    state = {
        data: {},
        breads:[],
        key:'fileName',
        columns: [
            {
                title: '文件名',
                dataIndex: 'fileName',
                key: 'fileName',
            },
            {
                title: '操作',
                key: 'action',
                render: ( item, index) => {
                    return (
                        <div className="action-list" key={index}>
                            <a href="javascript:;" onClick={this.readLog.bind(this, 'DEBUG', index.fileName)}>读取</a>
                        </div>
                    )
                }
            },
        ],
        dataSource: [],
        loading: false,
        readData:{
            status:'',
            filename:''
        }
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
                            href: '/user/gateway/log',
                            text: '网关日志'
                        }
                    ];
                    this.setState({data: {...res}, breads});
                }
            });
        queryGatewaysLog(this.props.history, id)
            .then((res) => {
                if (!!res) {
                    this.setState({dataSource: res});
                }
            });
    }

    render() {
        const data = this.state.data;
        return (
            <div>
                <div className="detail-bread">
                    <LoraBread history={this.props.history} breads={this.state.breads}/>
                    <div className="title">
                        {data.name}
                        <Tag color="blue">{data.projectName}</Tag><Tag
                        color={data.status == 'ONLINE' ? 'green' : 'red'}>{data.status == 'ONLINE' ? '在线' : '离线'}</Tag>
                    </div>
                </div>
                <div className="content-detail ">
                    <div className="dashboard">
                        <h2 className="title">网关日志列表</h2>
                        <div style={{margin:'16px 0',}}>
                            <Button type="primary" onClick={this.queryConfig} style={{marginRight:'16px'}}>拉取调试日志列表</Button>
                            <Button type="primary"  onClick={this.readLog.bind(this, 'ERROR', 1)}>拉取异常日志</Button>
                        </div>
                        <Table loading={this.state.loading} className="clearfix" columns={this.state.columns}
                               rowKey={this.state.key} dataSource={this.state.dataSource}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Log;