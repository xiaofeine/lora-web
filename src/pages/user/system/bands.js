/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout, Modal, Form, Upload, Button, Icon, message } from 'antd';
import TableBands from "Commons/table/tableBands";
import { getCode, domain } from 'Configs/utils';
import { getBands, delBands, queryBands, reAddBands } from 'Api/firmwares';

const { Content } = Layout;
const confirm = Modal.confirm;


class Bands extends React.Component {
    toAdd = () => {
        this.setState({ toAdd: true, band: true});
    };
    reAdd = (item) =>{
        if(item.deviceUseSize > 0 ) {
            Modal.confirm({
                title: "确定重新导入吗？",
                onOk: () => {
                    this.setState({ toAdd: true, band: true});
                }
            })
        } else {
            this.setState({ toAdd: true, band: true});
        }

    }
    state = {
        bands: {},
        tableBands: {
            id: 'bands',
            RowKey: 'id',
            columns: [
                {
                    title: '频段名称',
                    dataIndex: 'name',
                    key: 'name'
                },
                {
                    title: '区域',
                    dataIndex: 'region',
                    key: 'region'
                },
                {
                    title: '节点使用量',
                    dataIndex: 'deviceUseSize',
                    key: 'deviceUseSize'
                },
                {
                    title: '信道数量',
                    dataIndex: 'channelSize',
                    key: 'channelSize'
                },
                {
                    title: '创建时间',
                    dataIndex: 'createdDate',
                    key: 'createdDate'
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    key: 'operation',
                    render: (a, item, index) => {
                        return (
                            <div className="action-list" key={item.name + 'a' + index}>
                                <a href="javascript:;" onClick={this.reAdd.bind(this, item)}>
                                    {item.editable === true? '重新导入': ''}</a>
                                <a href={`${requestUrl}api/v1/lorawan/bands/export/?Authorization=${sessionStorage.getItem('token')}&id=${item.id}`}>导出</a>
                                <a href="javascript:;" onClick={this.toDelete.bind(this, item.id)}>
                                    {item.editable === true? '删除': ''}</a>
                            </div>
                        )
                    }
                }
            ],
            getData: getBands,
            showButtons: true,
            buttonSettings: [
                {
                    text: '添加',
                    type: 'primary',
                    onClick: this.toAdd
                }
            ],
            editable: false,
            page: 0,
            pageSize: 50,
            searchFields: 'name',
            searchPlaceholder: '请输入频段名称',
            history: this.props.history,
        },
        reAdd: false,
        toAdd: false,
        band: false,
        handleAddBands: false,
        fileList: [],
        uploading: false,
        data: {
            projectId: sessionStorage.getItem('project'),
        },

    }
    handleAddBands = (e) => {
        e.preventDefault();
        this.setState({ band: true });
        reAddBands(this.props.history, this.state.data, this.state.fileList[0])
            .then((res)=> {
                if (!!res) {
                    message.success( '已导入！');
                    this.refs.bands.getData(0);
                    this.handleCancel();
                } else {
                    this.handleCancel();
                }
            })

    }
    handleCancel = () => {
        this.setState({ reAdd: false, toAdd: false, handleAddBands: false, uploading: false, band: false, fileList: []})
    }

    toDelete = (item) => {
        Modal.confirm({
            title: '确定要删除吗？',
            onOk: () => {
                delBands(this.props.history, item)
                    .then((res) => {
                        if (!!res) {
                            message.success('已删除!');
                            this.refs.bands.getData(0);
                        }
                    }).catch(() => {
                    console.log('catch back');
                })
            }
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const layout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 }
            },
        };

        const settings = {
            action: domain + 'api/v1/lorawan/bands/import',
            name: 'bands',
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token'),
            },
            beforeUpload: (file) => {
                this.setState(({fileList}) => ({
                    fileList: [file],
                }));
                return false;
            },
            onRemove: (file) => {
                this.setState({fileList: []});
            },
            fileList: this.state.fileList,
        };
        return (
            <Content className="content-detail">
                <div className="dashboard">
                    <div className="title">
                        频段管理
                    </div>
                    <div>
                        <TableBands ref='bands'{...this.state.tableBands}/>
                    </div>
                </div>
                <Modal ref="toAddBands"
                       centered
                       visible={this.state.band}
                       title="添加频段"
                       maskClosable={false}
                       onCancel={this.handleCancel}
                       footer={
                           [
                               <Button key="back" onClick={this.handleCancel}>取消</Button>,
                               <Button key="sub" type="primary"
                                       disabled={this.state.fileList.length < 1}
                                       loading={this.state.uploading} onClick={this.handleAddBands}>
                                   确定
                               </Button>,
                           ]
                       }>
                   <div>
                       <Form>
                           <Form.Item label="上传文件"
                                      required {...layout}>
                               <Upload {...settings} ref="upload">
                                   <Button>
                                       <Icon type="upload"/> 选择文件
                                   </Button>
                               </Upload>
                           </Form.Item>
                           <Form.Item label="导入模板" {...layout}>
                               <a download href="./../../../../static/assets/files/频率规范(新)ICA.json">频段模板</a>
                           </Form.Item>
                       </Form>
                   </div>

                </Modal>
            </Content>
        )
    }
}
export default Form.create()(Bands);
