/**
 * FileName: basic
 * Auth: Linn
 * Created at: 2018/8/2
 * Description:
 */
import React from 'react';
import $ from 'jquery';
import { render } from 'react-dom';
import { Link } from 'react-router-dom';
import { Table, Form, Input, Pagination, Button, Modal, Icon, InputNumber } from 'antd';
import { isEqualObject } from 'Configs/utils';

export default class BasicTable extends React.Component {

	static defaultProps = {
		columns: [
			{
				title: '姓名',
				dataIndex: 'name',
				key: 'name',
			},
			{
				title: '年龄',
				dataIndex: 'age',
				key: 'age',
			},
			{
				title: '住址',
				dataIndex: 'address',
				key: 'address',
			}
		],
		dataSource: [],
		loading: false,
		pageSize: 50,
		page: 0,
		total: 0,
		req: {},
		getData: ()=>{},
		showSelect: false,
		selectedRowKeys: [],
		selectButtons: [],
		showSearch: true,
		searchValue: null,
		searchFields: [],
		searchPlaceholder: '',
		showButtons: false,
		buttonSettings: [],
	}

	onSelectChange = (selectedRowKeys, selectedRows) => {
		this.setState({ selectedRowKeys, selectedRows });
	}

	state = {
		columns: this.props.columns,
		dataSource: this.props.dataSource,
		loading: this.props.loading,
		pageSize: this.props.pageSize,
		page: this.props.page,
		total: this.props.total,
		req: {...this.props.req},
		reqChange: false,
		getData: this.props.getData,
		showSelect: this.props.showSelect,
		selectedRowKeys: this.props.selectedRowKeys,
		selectButtons: this.props.selectButtons,
		onSelectChange: this.onSelectChange,
		showSearch: this.props.showSearch,
		searchValue: this.props.searchValue,
		searchFields: this.props.searchFields,
		searchPlaceholder: this.props.searchPlaceholder,
		showButtons: this.props.showButtons,
		buttonSettings: this.props.buttonSettings,
		fuzzy: this.props.fuzzy||true,
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.reqChange && !isEqualObject(nextProps.req, this.state.req)) {
			let state = {...this.state};
			state.dataSource = this.state.dataSource;
			state.req = {...nextProps.req};
			state.page = 0;
			this.setState({ ...state });
			this.getData(0, undefined, undefined, undefined, state.req);
		}
	}

	getData =(page=this.state.page, pageSize=this.state.pageSize,
			  searchValue=this.state.searchValue,
			  searchFields=this.state.searchFields, req=this.state.req, fuzzy=this.state.fuzzy)=> {
		this.setState({ loading: true });
		req = {...req, page, pageSize};
		if (fuzzy) {
			if (!!this.state.showSearch&&!!searchValue) {
				req = {...req, search: searchValue, searchFields};
			}
		} else {
			let searchKey = this.props.searchKey;
			req[searchKey] = searchValue;
		}
		this.props.getData(this.props.history, req)
			.then((res)=> {
				if (!!res) {
					this.setState({
						total: res.totalElements,
						dataSource: res.content,
						loading: false,
					});
				} else {
					Modal.error({
						title: !!res?(res==='timeout'?'请求超时！':res.msg):'请求失败！',
						onOk: ()=> {
							this.setState({
								loading: false
							});
						}
					})
				}
			}).catch((res)=> {
				if (res === 'timeout') {
					Modal.error({
						title: '请求超时',
						onOk: ()=> {
							this.setState({ loading: false });
						}
					});
				} else {
					switch (res.status) {
						case 401:
							Modal.confirm({
									title: '无权限或者登录已过期！',
									content: '确定，请返回重新登录，取消，继续操作',
									onOk: ()=> {
										this.props.history.push('/login');
									},
									onCancel: ()=> {
										this.setState({ loading: false });
									}
								});
							break;
						case 403:
							Modal.error({
								title: '禁止访问',
								onOk: ()=> {
									this.setState({ loading: false });
								},
							});
							break;
						case 404:
							Modal.error({
								title: '未找到资源',
								onOk: ()=> {
									this.setState({ loading: false });
								},
							});
							break;
						default:
							Modal.error({
								title: '服务器走失了',
								onOk: ()=> {
									this.setState({ loading: false });
								},
							});
							break;
					}
				}
			});
	}

	componentDidMount() {
		this.getData();
	}

	handlePage =(page)=> {
		this.setState({ page: page-1 });
		this.getData(page-1);
	}

	handleSizeChange =(page, pageSize)=> {
		this.setState({ pageSize, page: page-1 });
		this.getData(page-1, pageSize);
	}

	handleSearch =(value)=> {
		this.setState({ searchValue: value });
		this.getData(undefined, undefined, value);
	}

	render() {
		const { loading, selectedRowKeys } = this.state;
		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange,
		}
		let showScroll = this.props.scroll&&this.state.dataSource.length > 0;
		const tableWidth = $('.basic-table').width();
		showScroll = showScroll?(showScroll && (tableWidth-this.props.scroll)<0):showScroll;
		return (
			<div className="basic-table" key={this.props.id||'basic'}>
				<div style={{ marginBottom: '16px', height: '32px', marginTop: '24px',
					display: `${(this.state.showSearch||this.state.showButtons)?'block':'none'}`}}>
					<div className="button">
						{
							this.state.buttonSettings.map((b, index)=> {
								return (
									<Button key={b.text+index} {...b}>{b.text}</Button>
								)
							})
						}
					</div>
					<div className="search clearfix">
						<Input.Search placeholder={this.state.searchPlaceholder}
									  style={{width: this.props.searchWidth||'200px'}}
									  onSearch={(value)=>this.handleSearch(value)}
						/>
					</div>
				</div>
				<div style={{ marginBottom: '25px', height: '40px',
					display: `${this.state.selectedRowKeys.length>0?'block':'none'}`}}>
					<div className="tip">
						<Icon type="info-circle" style={{ color: 'rgba(24,144,255,1)'}} />
						<div className="text">
							已选择
							<span style={{ color: 'rgba(24,144,255,1)'}}>
								{this.state.selectedRowKeys.length}
							</span>项
						</div>
						<div className="actions">
							{
								this.state.selectButtons.map((b, index)=> {
									return (
										<a href="javascript:;" key={b.text+index}
										   style={{ paddingRight: 17 }}
										   onClick={b.handleClick.bind(this, this.state.selectedRowKeys, this.state.selectedRows)}>
											{b.text}
										</a>
									)
								})
							}
						</div>
					</div>
				</div>
				{
					showScroll?
						<Table loading={loading} className="clearfix" columns={this.state.columns}
							   rowSelection={rowSelection} rowKey={this.props.rowKey||'id'}
							   rowClassName={!!this.props.rowClassName?this.props.rowClassName:()=>{}}
							   pagination={{size: 'small', showSizeChanger: true,
								   showQuickJumper: true, onShowSizeChange: this.handleSizeChange,
								   onChange: this.handlePage, pageSizeOptions: ['20','50','100'],
								   defaultPageSize: 50, defaultCurrent: this.state.page+1,
								   current: this.state.page+1, pageSize: this.state.pageSize,
								   total: this.state.total,
							   }}
							   scroll={{x: this.props.scroll}}
							   dataSource={this.state.dataSource} />
							   :
						<Table loading={loading} className="clearfix" columns={this.state.columns}
							   rowSelection={rowSelection} rowKey={this.props.rowKey||'id'}
							   rowClassName={!!this.props.rowClassName?this.props.rowClassName:()=>{}}
							   pagination={{size: 'small', showSizeChanger: true,
								   showQuickJumper: true, onShowSizeChange: this.handleSizeChange,
								   onChange: this.handlePage, pageSizeOptions: ['20','50','100'],
								   defaultPageSize: 50, defaultCurrent: this.state.page+1,
								   current: this.state.page+1, pageSize: this.state.pageSize,
								   total: this.state.total,
							   }}
							   dataSource={this.state.dataSource} />
				}
			</div>
		)
	}
}