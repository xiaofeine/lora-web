
/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/2
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout ,Popconfirm ,Modal, message } from 'antd';
const { Header, Content, Footer } = Layout;

import BasicTable from 'Commons/table/basic';
import { getList ,delUser ,batchEnable } from 'Api/user';

export default class Users extends React.Component {

    toEnable =(enable, item)=> {
        let req = {
			enable,
            ids: [ item.id ],
        };
        this.handleEnable(enable, null, req);
    }

    handleEnable =(enable, values, req)=> {
        if (!!values) {
            req = {
				enable,
            	ids: values,
			};
        }
        Modal.confirm({
			title: `确定要${enable?'启用':'禁用'}吗？`,
			onOk: () => {
				batchEnable(this.props.history, req)
					.then((res) => {
						if (!!res) {
							message.success(`已${enable?'启用':'禁用'}！`)
						} else {
							message.error(`${enable?'启用':'禁用'}失败！`);
						}
					}).catch(() => {
					console.log('catch back');
				})
			}
		});
    }
    toDelete = (item) => {
        let req = {
            ids: [item.id],
        };
        this.handleDelete(null, req);
    }
    handleDelete=(values,req)=>{
        if (!!values) {
            req = {
                ids: values
            };
        }
        Modal.confirm({
            title: '确定要删除吗？',
            onOk:()=>{
                delUser(this.props.history, req)
                    .then((res) => {
                        if (!!res) {
                            message.success('已删除！');
                        } else {
                            message.error('删除失败！');
                        }
                    }).catch(() => {
                    console.log('catch back');
                })
            }
        })
    }
    toDetail =(user)=> {
    	this.props.history.push('/admin/detail', {user});
	}
	toAdd =()=> {
        this.props.history.push('/admin/add');
	}

	state = {
        visible: false,
        tableSettings: {
			rowKey: 'id',
			columns: [
				{
					title: '账号',
					dataIndex: 'username',
					key: 'username',
				},
				{
					title: '联系人',
					dataIndex: 'name',
					key: 'name',
				},
				{
					title: '网关数量',
					dataIndex: 'gatewaySize',
					key: 'gatewaySize',
					render: (a, item, index)=> {
						return (
							<span key={item.username+'g'+index}>
								{`${item.gatewaySize}/${item.gatewayLimit}`}
							</span>
						)
					}
				},
				{
					title: '节点数量',
					dataIndex: 'deviceSize',
					key: 'deviceSize',
					render: (a, item, index)=> {
						return (
							<span key={item.username+'d'+index}>
								{`${item.deviceSize}/${item.deviceLimit}`}
							</span>
						)
					}
				},
				{
					title: '创建时间',
					dataIndex: 'createdDate',
					key: 'createdDate',
				},
				{
					title: '状态',
					dataIndex: 'enable',
					key: 'enable',
                    width: 80,
					render: (a, item, index)=>{
						return (
							<span key={item.username+'index'}>
								<span className={item.enable?'able-dot':'disable-dot'}>
								</span>
								{item.enable?'启用':'禁用'}
							</span>
						)
					}
				},
				{
					title: '操作',
					dataIndex: 'address',
					key: 'address',
					render: (a, item, index)=> {
						return (
							<div className="action-list" key={item.username+'a'+index}>
								<a href="javascript:;" onClick={this.toDetail.bind(this, item)}>查看</a>
								{
									item.enable?
										<a href="javascript:;" onClick={this.toEnable.bind(this, false, item)}>禁用</a>
										:
										<a href="javascript:;" onClick={this.toEnable.bind(this, true, item)}>启用</a>
								}

								<a href="javascript:;" onClick={this.toDelete.bind(this, item)}>删除</a>
							</div>
						)
					}
				},
			],
			getData: getList,
			selectButtons: [
				{
					text: '启用',
					handleClick: this.handleEnable.bind(this, true),
				},
				{
					text: '禁用',
					handleClick: this.handleEnable.bind(this, false),
				},
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
			searchFields: 'username,name',
			searchPlaceholder: '请输入账号/联系人',
			history: this.props.history,
		}
	}

	render() {
		return(
			<Content className="page-no-side">
				<div className="title">
					用户管理
				</div>
				<div>
					<BasicTable ref="users" {...this.state.tableSettings} />
				</div>
			</Content>
		)
	}
}

