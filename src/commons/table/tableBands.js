/**
 * FileName: basic
 * Auth: Linn
 * Created at: 2018/8/2
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Link } from 'react-router-dom';
import { Table, Form, Input, Pagination, Button, Modal, Icon, message } from 'antd';

export default class TableBands extends React.Component {

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
        showSearch: true,
        searchValue: null,
        searchFields: [],
        searchPlaceholder: '',
        showButtons: false,
        buttonSettings: [],
    }


    state = {
        columns: this.props.columns,
        dataSource: this.props.dataSource,
        loading: this.props.loading,
        pageSize: this.props.pageSize,
        page: this.props.page,
        total: this.props.total,
        req: this.props.req,
        getData: this.props.getData,
        showSelect: this.props.showSelect,
        onSelectChange: this.onSelectChange,
        showSearch: this.props.showSearch,
        searchValue: this.props.searchValue,
        searchFields: this.props.searchFields,
        searchPlaceholder: this.props.searchPlaceholder,
        showButtons: this.props.showButtons,
        buttonSettings: this.props.buttonSettings,
    }

    componentWillReceiveProps(nextProps) {
        //console.log('next', nextProps)
        let state = {...this.state, ...nextProps};
        this.setState({ state });
        this.getData();
    }

    getData =(page=this.state.page, pageSize=this.state.pageSize,
              searchValue=this.state.searchValue, searchFields=this.state.searchFields)=> {
        this.setState({ loading: true });
        let req = {...this.state.req, page, pageSize};
        if (!!this.state.showSearch&&!!searchValue) {
            req = {...req, search: searchValue, searchFields};
        }
        this.props.getData(this.props.history, req)
            .then((res)=> {
                if (!!res) {
                    //console.log('res', res);
                    this.setState({
                        total: res.totalElements,
                        dataSource: res.content,
                        loading: false,
                    });
                } /*else {
                    Modal.error({
                        title: !!res?(res==='timeout'?'请求超时！':res.msg):'请求失败！',
                        onOk: ()=> {
                            this.setState({
                                loading: false
                            });
                        }
                    })
                }*/
            }).catch((res)=> {
            if (res === 'timeout') {
                message.error('请求超时');
                this.setState({
                    loading: false
                });
            } else {
                switch (res.status) {
                    case 401:
                        Modal.confirm({
                            title: '无权限或者登录已过期！',
                            content: '确定，请返回重新登录，取消，继续操作',
                            onOk: ()=> {
                                sessionStorage.clear();
                                window.history.pushState(null,null,'/login');
                                window.history.go();
                            },
                            onCancel: ()=> {
                                this.setState({ loading: false });
                            }
                        });
                        break;
                    case 403:
                        message.error('禁止访问');
                        this.setState({
                            loading: false
                        });
                        break;
                    case 404:
                        message.error('未找到资源');
                        this.setState({
                            loading: false
                        });
                        break;
                    default:
                        Modal.error({
                            title: '请求失败',
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

    handleSizeChange =(a, pageSize)=> {
        this.setState({ pageSize, page: 0 });
        this.getData(0, pageSize);
    }

    handleSearch =(value)=> {
        this.setState({ searchValue: value });
        this.getData(undefined, undefined, value);
    }

    render() {
        const { loading } = this.state;
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
                <Table loading={loading} className="clearfix" columns={this.state.columns}
                       rowKey={this.props.rowKey||'id'}
                       pagination={{size: 'small', showSizeChanger: true,
                           showQuickJumper: true, onShowSizeChange: this.handleSizeChange,
                           onChange: this.handlePage, pageSizeOptions: ['20','50','100'],
                           defaultPageSize: 50, defaultCurrent: this.state.page+1,
                           total: this.state.total,
                       }}
                       dataSource={this.state.dataSource} />
            </div>
        )
    }
}