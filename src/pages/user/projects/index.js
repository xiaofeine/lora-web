/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import {render} from 'react-dom';
import { Layout, Input, Icon, Modal, Row, Col, Form, Select, Button, Spin, message } from 'antd';
import $ from 'jquery';
import { getCode, domain } from 'Configs/utils';
const { Content } = Layout;
import { queryProjects, deleleProject, getBands, addProject } from 'Api/project';
import { getTime } from 'Api/user';


export default class Projects extends React.Component {

    static defaultProps = {
        dataSource:[],
        loading: false,
        pageSize: 11,
        page: 0,
        total: 10,
    }

    state = {
        dataSource: this.props.dataSource,
        ready: false,
        loading: this.props.loading,
        pageSize: this.props.pageSize,
        page: this.props.page,
        total: this.props.total,
        add: false,
        data: {},
        confirmLoading: false,
        fields: {
            name: {
                value: null,
            },
            bandId: {
                value: undefined,
            },
            appEui: {
                value: null,
            },
            remark: {
                value: null,
            },
            bands: []
        },
        more: false,
        current: 0,
    }

	queryProject =(page=this.state.page, pageSize=this.state.pageSize, search)=> {
        this.setState({ loading: true });
        let req = {page, pageSize};
        if (!!search) {
            req = {...req, search, searchFields: 'name'};
        }
        queryProjects(this.props.history, req)
            .then((res)=> {
                if (!!res) {
                    this.setState({
                        total: res.totalElements,
                        dataSource: res.content,
                        loading: false,
						ready: true,
						more: res.totalElements>11*(this.state.current+1),
                    });
                }
            });
	}

	getMore =()=> {
		$(window).scroll((e)=>{
			let scrollTop = $(window).scrollTop();    //滚动条距离顶部的高度
			let scrollHeight = $(document).height();   //当前页面的总高度
			let clientHeight = $(window).height();//当前可视的页面高度
			if(scrollTop + clientHeight >= scrollHeight) {   //距离顶部+当前高度 >=文档总高度 即代表滑动到底部
				console.log('scroll');
				//滚动条到达底部 加载更多
				if (this.state.more) {
					this.setState({ loading: true });
					let current = this.state.current;
					console.log('current', current);
					let page = current + 1;
					let pageSize = this.state.pageSize;
					let search = this.state.search;
					let req = {page, pageSize};
					if (!!search) {
						req = {...req, search, searchFields: 'name'};
					}
					let dataSource = this.state.dataSource;
					queryProjects(this.props.history, req)
						.then((res)=> {
							if (!!res) {
								dataSource = [...dataSource, ...res.content];
								this.setState({
									total: res.totalElements,
									dataSource: dataSource,
									loading: false,
									ready: true,
									current: page,
									more: res.totalElements>11*(page+1),
								});
							}
						});
				}
			}
		});
	}

    componentDidMount() {
        getBands(this.props.history)
            .then((res)=> {
                if (!!res) {
                    let fields = this.state.fields;
                    fields.bands = [...res];
                } else {
                    Modal.error({
                        title: '获取频段信息失败！'
                    });
                }
            });
        getTime(this.props.history)
			.then((res)=> {
        		if (res) {
        			sessionStorage.setItem('day', res.statisticRetainDays);
				}
			})
        this.queryProject();
        this.getMore();
    }

    componentWillUnmount() {
		$(window).unbind('scroll');
	}

    handleSearch = (value) => {
        this.setState({ page: 0 });
        this.queryProject(0, undefined, value);
    }

    toDetail =(item)=> {
        sessionStorage.setItem('project', item.id);
        sessionStorage.setItem('project_name', item.name);
        sessionStorage.setItem('band_name', item.netWorkParam.bandName);
        this.props.history.push('/user/project/detail', { data: item });
    }

    toDelete =(item)=> {
        Modal.confirm({
            title: '确定要删除吗？',
            onOk: ()=> {
				return deleleProject(this.props.history, item)
                    .then((res)=> {
				        if (!!res) {
                            message.success('已删除！');
                            this.setState({ page: 0 });
                            this.queryProject(0);
                        }else{
				            message.error(res.msg||'删除失败！');
                        }
                    })
            }
        })
    }

    toAdd =()=> {
        let PRO = {
            appEui: getCode(16)
        };
        sessionStorage.setItem('add', JSON.stringify(PRO));
		let fields = this.state.fields;
		let appEui = getCode(16);
        this.setState({
            add: true,
			fields: {
				name: {
					value: null,
				},
				bandId: {
					value: undefined,
				},
                appEui: {
                    value: appEui,
                },
				remark: {
					value: null,
				},
				bands: fields.bands
			},
        });
    }

    handleChange =(changeFields)=> {
        this.setState(({fields})=>({
            fields: {...fields, ...changeFields},
        }));
    }

    handleAdd =()=> {
        let history = this.props.history;
        this.refs.add.validateFields((err, values)=> {
            if (!err) {
                Modal.confirm({
                    title: '确定要添加吗？',
                    onOk: ()=> {
                        let req = {
                            ...values,
                            // appEui: values.appEui.replace(/-/g, ''),
                            projectId: sessionStorage.getItem('project')
                        };
                        addProject(history, req)
                            .then((res)=> {
                                if (!!res) {
                                    message.success('已添加！');
                                    this.setState({ add: false, page: 0 });
                                    this.queryProject(0);
                                }else{
                                    message.error(res.msg||'添加失败！');
                                }
                            });
                    },
                })
            }
        })
    }

    getList = () => {
        return this.state.dataSource.map((item, index) => {
            let key = 'side'+index;
            return (
                <Col key={key} span={this.state.dataSource.length === 1?12:8}>
                    <div className="item">
                        <div className="content">
                            <div className="icon-project">
                                <Icon type="layout"/>
                            </div>
                            <div className="text-box">
                                <h3>{item.name}</h3>
                                <p>网关数量：<span>{item.gatewaySize}</span></p>
                                <p>节点数量：<span>{item.deviceSize}</span></p>
                                <p>创建时间：<span>{item.createdDate}</span></p>
                            </div>
                        </div>
                        <div className="option">
                            <a className="option-btn" href="javascript:;"
                               onClick={this.toDetail.bind(this, item)}>查看</a>
                            <a className="option-btn" href="javascript:;"
                               onClick={this.toDelete.bind(this, item)}>删除</a>
                        </div>
                    </div>
                </Col>
            );
        });
    }

    render() {
        const List = this.getList();
        const fields = this.state.fields;
        return (
            <Content>
                <div className="page-no-side">
                    <div className="search-line clearfix">
                        <Button type="primary" className="fl" onClick={this.toAdd}>新增项目</Button>
                        <Input.Search placeholder="请输入项目名称"
                                      style={{width: '200px'}}
                                      onSearch={(value) => this.handleSearch(value)}
                        />
                    </div>
					{
						this.state.ready?
							(
								this.state.dataSource.length === 0?
									<div className="project-no">
										<img src="../static/images/no-project.png" className="no-content-image"/>
										<p>暂时没有项目哦，去添加新的项目吧</p>
										<Button type="primary"  size="large" onClick={this.toAdd}><Icon type="plus"/>新增项目</Button>
									</div>
									:
									<Row className="project-list" gutter={24}>
                                        {List}
										{/*<Col span={this.state.dataSource.length === 1?12:8}>*/}
											{/*<div className="item item-add" onClick={this.toAdd}>*/}
												{/*<Icon type="plus"/>新增项目*/}
											{/*</div>*/}
										{/*</Col>*/}
										{
											this.state.more?
												<Col span="24" className="list-more">
													{
														this.state.loading?
															<Spin/>
															:
                                                            <div className="get-more-line"><a>加载更多</a></div>
													}
												</Col>
												:
												(
													this.state.dataSource.length < 11 ?
														null:
														<Col span="24" className="get-more-line">
															<a>没有更多了</a>
														</Col>
												)
										}
									</Row>
							)
							:null
					}

                </div>
                <Modal visible={this.state.add}
                       onOk={this.handleAdd}
                       onCancel={()=>{this.setState({ add: false, confirmLoading: false })}}
                       confirmLoading={this.state.confirmLoading}
                       title="项目添加">
                    {
                        <Add ref="add" {...fields} onChange={this.handleChange}/>
                    }
                </Modal>
            </Content>
        )
    }
}


const Add = Form.create({
    onFieldsChange(props, changedFields) {
        props.onChange(changedFields);
    },
    mapPropsToFields(props) {
        return {
            name: Form.createFormField({
                ...props.name,
                value: props.name.value,
            }),
            bandId: Form.createFormField({
                ...props.bandId,
                value: props.bandId.value,
            }),
            appEui: Form.createFormField({
                ...props.appEui,
                value: props.appEui.value,
            }),
            remark: Form.createFormField({
                ...props.remark,
                value: props.remark.value,
            }),
        };
    },
})((props) => {
    const { getFieldDecorator } = props.form;
    const { appEui } = JSON.parse(sessionStorage.getItem('add'));
    const handleChange = (key, num) => {
        let data = {};
        data[key] = getCode(num);
        props.form.setFieldsValue({
            ...data
        });
    }

    return (
        <Form layout="horizontal">
            <Form.Item label="项目名称"
                       hasFeedback={true}>
                {getFieldDecorator('name', {
                    rules: [
                        {
                            required: true, message: '请输入项目名称!'
                        },
                        { max: 30, min: 4, message: '长度在4~30之间！'}
                    ],
                })(
                    <Input  placeholder="请输入项目名称" />
                )}
            </Form.Item>
            <Form.Item label="频段规范"
                       hasFeedback={true}>
                {getFieldDecorator('bandId', {
                    rules: [
                        {
                            required: true, message: '请选择频段规范!'
                        },
                    ],
                })(
                    <Select placeholder="请选择频段规范">
                        {
                            props.bands.map((p, index)=>{
                                return (
                                    <Select.Option key={'p'+index}
                                                   value={p.id}>
                                        {p.name}
                                    </Select.Option>
                                )
                            })
                        }
                    </Select>
                )}
            </Form.Item>
            {/*<Form.Item label="appEui">*/}
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
            <Form.Item label="项目描述"
                       hasFeedback={true}>
                {getFieldDecorator('remark', {
                    rules: [
                        { min: 0, max: 100, message: '项目描述必须在0~100范围内' }
                    ],
                })(
                    <Input.TextArea size="large" placeholder="请输入项目描述" />
                )}
            </Form.Item>
        </Form>
    );
});