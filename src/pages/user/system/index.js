/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import {Layout, Popconfirm, Modal, Button, Form, Input, Upload, Icon, Tree, TreeSelect, message} from 'antd';
import BasicTable from 'Commons/table/basic';
import {domain} from 'Configs/utils';
import {getFirmWaresList, addFirmWares, deleteFirmWares} from 'Api/firmwares';
import {getUpdate, toUpdate} from 'Api/gateway';
import $ from 'jquery';

const {Header, Content, Footer} = Layout;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

class firmList extends React.Component {

    toAdd = () => {
        this.props.form.resetFields();
        this.setState({toAdd: true, file: null});
    };

    handleCancel = () => {
        this.setState({toAdd: false, update: false});
    };

    handleOk = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (!err) {
                    addFirmWares(this.props.history, values, this.state.file)
                        .then((res) => {
                            if (!!res) {
                                this.setState({toAdd: false});
                                message.success('已提交！');
                                this.refs.firmware.getData(0);
                            } else {
                                message.error('提交失败！');
                            }
                        }).catch(() => {
                        console.log('catch back');
                    })
                }
            }
        })
    };

    onChange = (value, title, extra) => {
        this.setState({value, title});
    }

    toUpdate = (item) => {
        let req = {
            ids: [item.id],
        };
        sessionStorage.setItem('firmwareId', item.id);
        this.handleUpdate(null, req);
    };

    handleUpdate = (values, req) => {
        if (!!values) {
            req = {
                ids: values
            };
        }
        this.setState({update: true});
        this.getMock();
    };

    getMock = () => {
        getUpdate(this.props.history)
            .then((res) => {
                if (!!res) {
                    const array = res.reduce((tree, item) => {
                        const {project, gateways} = item;
                        if (gateways.length > 0) {
                            const obj = {
                                title: project.name,
                                value: project.id,
                                key: project.id,
                                children: [],
                            };
                            const child = gateways.reduce((treeChild, item) => {
                                treeChild.push({
                                    title: item.name,
                                    value: item.id,
                                    key: item.id,
                                })
                                return treeChild
                            }, []);
                            obj.children = child;
                            tree.push(obj);
                        }
                        return tree;
                    }, []);
                    this.setState({
                        treeData: array,
                        leftData: array,
                        rightData: [],
                        leftKeys: [],
                        rightKeys: [],
                        data: res,
                    });
                } else {
                    message.error('未找到可指派的网关列表！');
                }
            });
    };

    update = () => {
        let gatewayIds = this.getKeys(this.state.rightData, [], false);
        let firmwareId = sessionStorage.getItem('firmwareId');
        if(gatewayIds.length>0){
            let req = {
                firmwareId,
                gatewayIds
            };
            toUpdate(this.props.history, req)
                .then((res) => {
                    if (!!res) {
                        let gatewayName = this.state.title;
                        message.success('已提交，等待网关升级重启！');
                    }
					this.setState({update: false, value: [], title: []});
				});
        }else{
            message.error('请至少指派一个要升级的网关');
        }

    };

    filterOption = (inputValue, option) => {
        return option.description.indexOf(inputValue) > -1;
    };

    handleChange = (targetKeys) => {
        this.setState({targetKeys});
    };

    toDelete = (item) => {
        let req = {
            ids: [item.id],
        };
        this.handleDelete(null, req);
    };

    handleDelete = (values, req) => {
        if (!!values) {
            req = {
                ids: values
            };
        }
        Modal.confirm({
            title: '确定要删除吗？',
            onOk: () => {
                deleteFirmWares(this.props.history, req)
                    .then((res) => {
                        if (!!res) {
                            message.success('已删除!');
                            this.refs.firmware.getData(0);
                        } else {
                            message.error( '删除失败！');
                        }
                    }).catch(() => {
                    console.log('catch back');
                })
            }
        })
    };

    state = {
        toAdd: false,
        update: false,
        tableFirmware: {
            id: 'firmware',
            rowKey: 'id',
            columns: [
                {
                    title: '文件名',
                    dataIndex: 'filename',
                    key: 'filename',
                },
                {
                    title: 'md5',
                    dataIndex: 'md5',
                    key: 'md5',
                },
                {
                    title: 'Len',
                    dataIndex: 'length',
                    key: 'length',
                },
                {
                    title: '版本号',
                    dataIndex: 'version',
                    key: 'version',
                },
                {
                    title: '创建时间',
                    dataIndex: 'uploadDate',
                    key: 'uploadDate',
                },
                {
                    title: '操作',
                    dataIndex: 'option',
                    key: 'option',
                    render: (a, item, index) => {
                        return (
                            <div className="action-list" key={item.filename + 'a' + index}>
                                {/*<a href={domain + 'api/v1/lorawan/firmwares/' + item.id}>下载</a>*/}
                                <a href="javascript:;" onClick={this.toUpdate.bind(this, item)}>升级</a>
                                <a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
                            </div>
                        )
                    }
                },
            ],
            getData: getFirmWaresList,
            selectButtons: [
                {
                    text: '删除',
                    handleClick: this.handleDelete,
                }
            ],
            showButtons: true,
            buttonSettings: [
                {
                    text: '添加',
                    type: 'primary',
                    onClick: this.toAdd,
                },
            ],
            searchFields: 'filename',
            searchPlaceholder: '请输入文件名',
            history: this.props.history,
            req: {
                projectId: sessionStorage.getItem('project'),
            }
        },
        file: null,
        value: [],
        title: [],
        data: [],
        treeData: [],
        leftCheckKeys: [],
        leftData: [],
        preLeftMKeys: [],
        preRightMKeys: [],
        checkedKeys: [],
        rightData: [],
        leftNodes: [], //选中的节点
        rightNodes: [],
        leftKeys: [],
        rightKeys: [],
    };

    onCheck = (leftKeys, {checkedNodes}) => {
        let leftNodes = checkedNodes.map((c) => {
            return c.props.dataRef;
        })
        this.setState({leftKeys, leftNodes});
    }

    onChecked = (rightKeys, {checkedNodes}) => {
        let rightNodes = checkedNodes.map((c) => {
            return c.props.dataRef;
        })
        this.setState({rightKeys, rightNodes});
    }

    getKeys = (data, checkedKeys, father = true) => {
        let keys = [];
        data.map((d) => {
            d.children.map((c) => {
                if (checkedKeys.indexOf(c.key) < 0) {
                    keys.push(c.key);
                    if (father) {
                        keys.indexOf(d.key) < 0 ? keys.push(d.key) : null;
                    }
                }
            })
        });
        return keys;
    }

    getNewData = (treeData, origin, checkedKeys) => {
        let keys = this.getKeys(origin, checkedKeys);
        let data = [];
        let remain = [];
        treeData.map((t) => {
            if (keys.indexOf(t.key) > -1) {
                let node = {...t, children: []};
                let children = [];
                let remainChildren = [];
                t.children.map((c) => {
                    if (keys.indexOf(c.key) > -1) {
                        children.push(c);
                    } else {
                        remainChildren.push(c);
                    }
                });
                node.children = [...children];
                data.push(node);
                if (remainChildren.length > 0) {
                    let remainNode = {...t, children: remainChildren};
                    remain.push(remainNode);
                }
            } else {
                remain.push(t);
            }
        });
        return [data, remain];
    }

    handleSelect = () => {
        let treeData = this.state.treeData;
        let [leftData, rightData] = this.getNewData(treeData, this.state.leftData, this.state.leftKeys);
        this.setState({leftData, rightData, leftKeys: []});
    }

    handleReSelect = () => {
        let treeData = this.state.treeData;
        let [rightData, leftData] = this.getNewData(treeData, this.state.rightData, this.state.rightKeys);
        this.setState({leftData, rightData, rightKeys: []});
    }

    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </Tree.TreeNode>
                );
            }
            return <Tree.TreeNode {...item} />;
        });
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 7},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 17},
            },
        };
        const uploadProps = {
            action: domain + "api/v1/lorawan/firmwares",
            name: "file",
            beforeUpload: (file) => {
                this.setState({file});
                return false;
            },
            fileList: !this.state.file ? [] : [this.state.file],
            onRemove: (file) => {
                this.setState({file: null});
            }
        };
        const {treeData, rightData, leftData} = this.state;

        return (
            <Content className="content-detail">
                <div className="dashboard">
                    <div className="title">
                        固件管理
                    </div>
                    <div>
                        <BasicTable ref="firmware" {...this.state.tableFirmware} />
                    </div>
                    <Modal ref="toAdd"
                           visible={this.state.toAdd}
                           title="添加固件"
                           onCancel={this.handleCancel}
                           onOk={this.handleOk}>
                        <div>
                            <Form className=" clearfix" style={{'padding': '24px 14% 24px 0'}}>
                                <Form.Item className="signToken" {...formItemLayout}
                                           label={(<span>版本号</span>)}>
                                    {getFieldDecorator('version', {
                                        rules: [
                                            {
                                                required: true, message: '请输入版本号!'
                                            },
                                            {max: 100, min: 0, message: '长度在0~100之间！'}
                                        ],
                                    })(
                                        <Input size="large" placeholder="请输入版本号"/>
                                    )}
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    label={(<span className="ant-form-item-required">文件</span>)}
                                >
                                    <Upload {...uploadProps}>
                                        <Button>
                                            <Icon type="upload"/> 选择文件
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Form>
                        </div>
                    </Modal>
                    <Modal
                        title="固件升级"
                        visible={this.state.update}
                        onCancel={this.handleCancel}
                        onOk={this.update}
                        okText="确认"
                        cancelText="取消"
                        centered
                        width={720}
                    >
                        <div className="transfer-box">
                            <div className="transfer-list">
                                <h3>未选</h3>
                                <Tree checkable
                                      defaultExpandAll={true}
                                      onCheck={this.onCheck}
                                      checkedKeys={this.state.leftKeys}
                                >{this.renderTreeNodes(leftData)}</Tree>
                            </div>
                            <div className="transfer-operation">
                                <Button block size="small" onClick={this.handleSelect}>指派<Icon type="right"
                                                                                             theme="outlined"/></Button>
                                <Button block size="small" onClick={this.handleReSelect}>取消<Icon type="left"
                                                                                               theme="outlined"/></Button>
                            </div>
                            <div className="transfer-list">
                                <h3>已选</h3>
                                <Tree checkable
                                      defaultExpandAll={true}
                                      onCheck={this.onChecked}
                                      checkedKeys={this.state.rightKeys}
                                >{this.renderTreeNodes(rightData)}</Tree>
                            </div>
                        </div>
                    </Modal>
                </div>
            </Content>
        )
    }
}

export default Form.create()(firmList);
