/**
 * FileName: dashboard
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout, Row, Col, Icon, Select, Tabs, Badge, message, Modal } from 'antd';
import $ from 'jquery';
import { queryDashboard, queryMap } from 'Api/dashboard';
import { getProjects } from 'Api/project';
import { fixMap } from 'Api/user';
const { Content } = Layout;
const TabPane = Tabs.TabPane;

export default class Dashboard extends React.Component {
    state = {
        data:{},
		active: 'up',
		projectId: 'all',
		mapData: {},
		projects: [],
		map: null,
    }

    componentDidMount() {
        queryDashboard(this.props.history)
            .then((res)=> {
                if (!!res) {
                    this.setState({ data: {...res}});
                }
            });
        getProjects(this.props.history)
			.then((res)=> {
        		if (!!res) {
        			this.setState({ projects: res });
				}
			});
        this.toPutMap();
	}

	handleFix =(center, zoom)=> {
    	let req = {
    		latitude: center.lat,
			longitude: center.lng,
			level: zoom,
		};
    	Modal.confirm({
			title: '确定要固定当前视角吗？',
			content: `中心坐标: ${center.lng}, ${center.lat}, 放大等级: ${zoom}`,
			onOk: ()=> {
				fixMap(this.props.history, req)
					.then((res)=> {
						if (!!res) {
							message.success('已固定！');
						}
					})
			}
		})
	}

	toPutMap =(active=this.state.active, projectId=this.state.projectId)=> {
		let up = active === 'up';
		let req = projectId!=='all'?{
			uplink: up,
			projectId
		}:{
			uplink: up,
		};
		return queryMap(this.props.history, req)
			.then((res)=> {
				if (!!res) {
					this.setState({ mapData: {...res}});
					let data = res.gateways;
					let map = new BMap.Map('up-map');
					if (!!res.latitude&&!!res.longitude&&!!res.level) {
						let originCenter = new BMap.Point(res.longitude, res.latitude);
						map.centerAndZoom(originCenter, res.level);
					} else {
						map.centerAndZoom('上海', 6);
					}
					map.enableScrollWheelZoom(true);


					// 定义一个控件类,即function
					let ZoomControl = function() {
						this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
						this.defaultOffset = new BMap.Size(10, 10);
					}

					// 通过JavaScript的prototype属性继承于BMap.Control
					ZoomControl.prototype = new BMap.Control();

					let search = this.state.search;
					ZoomControl.prototype.initialize = (map)=>{
						// 创建一个DOM元素
						let p = document.createElement("div");
						let button = document.createElement("span");
						button.innerHTML = '<button id="fix" ' +
							'class="ant-btn">固定视角</button>';
						button.onclick =()=> {
							let center = map.getCenter();
							let zoom = map.getZoom();
							this.handleFix(center, zoom);
						};
						p.appendChild(button);

						// 添加DOM元素到地图中
						let e = document.createElement("div");
						e.appendChild(p);
						map.getContainer().appendChild(e);
						// 将DOM元素返回
						return e;
					}

					// 创建控件
					let myZoomCtrl = new ZoomControl();
					// 添加到地图当中
					map.addControl(myZoomCtrl);

					this.setState({ map });

					let key = active+'linkCount';
					let nums = Array.from(data, d=>d[key]);
					let max = Math.max.apply(Math, nums);
					let min = Math.min.apply(Math, nums);
					let range = ((max-min)/6)==0?1:((max-min)/6);
					data.map((d)=> {
						let point = new BMap.Point(d.longitude, d.latitude);
						let color = d.status==='ONLINE'?(up?'#4287FF':'#0ABE63'):'#B0B3BC';
						let scale = Math.ceil((d[key]-min)/range)*5;
						let symbol = new BMap.Marker(point, {
							icon: new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
								scale: 1,
								strokeWeight: 1,
								strokeColor: color,
								fillColor: color,
								fillOpacity: 0.3,
							})
						});
						let infoWindow = new BMap.InfoWindow(
							`<ul class="map-tip">
          				<li><a id=${d.id} href="javascript:;" >${d.name}</a></li>
          				<li>
          				<span class='info-dot'></span>
							上行量(条): ${d.uplinkCount?d.uplinkCount:0}
          				</li><li>
          				<span class='able-dot'></span>
							下行量(条): ${d.downlinkCount?d.downlinkCount:0}
          				</li>
          				<li> <span class="warning-dot"></span> 上行负载率(%): 
          					${d.uplinkLoadRate}
          				</li>
          				<li> <span class="danger-dot"></span> 下行负载率(%): 
          					${d.downlinkLoadRate}
          				</li>
        			</ul>`, {enableCloseOnClick: true});
						symbol.addEventListener('click', ()=> {
							map.openInfoWindow(infoWindow, point);
							$('#'+d.id).click((e)=> {
								e.preventDefault();
								sessionStorage.setItem('gateway', d.id);
								this.props.history.push('/user/gateway/detail');
							})
						});
						map.addOverlay(symbol);
					});
					return 'success';
				}
			})

	}

	handleTab =(active)=> {
    	if (active !== this.state.active) {
    		this.setState({ active });
    		this.toPutMap(active);
		}
	}

	handleSelect =(projectId)=> {
    	if (projectId != this.projectId) {
    		this.setState({ projectId });
    		this.toPutMap(this.state.active, projectId);
		}
	}

	handleRefresh =()=> {
    	this.toPutMap().then((r)=> {
    		if (r === 'success') {
				message.success('已刷新！');
			} else {
				message.error('刷新失败！');
			}
		});
	}

	render() {
		const data = this.state.data;
		const mapData = this.state.mapData;
		return (
			<Content className="page-no-side" style={{background:'transparent'}}>
				<Row gutter={24} className="generalList">
					<Col className="gutter-row" span={6}>
						<div className="gutter-box dashboard">
							<div className="text">
								<p>项目个数（个）</p>
								<h3>{data.projectSize}</h3>
							</div>
							<i className="icon_xmgs"></i>
						</div>
					</Col>
					<Col className="gutter-row" span={6}>
						<div className="gutter-box dashboard">
							<div className="text">
								<p>网关总数（个）</p>
								<h3>{data.gatewaySize}</h3>
							</div>
							<i className="icon_wgzs"></i>
						</div>
					</Col>
					<Col className="gutter-row" span={6}>
						<div className="gutter-box dashboard">
							<div className="text">
								<p>在线网关（个）</p>
								<h3>{data.onlineGatewaySize}</h3>
							</div>
							<i className="icon_zswg"></i>
						</div>
					</Col>
					<Col className="gutter-row" span={6}>
						<div className="gutter-box dashboard">
							<div className="text">
								<p>节点总数（个）</p>
								<h3>{data.deviceSize}</h3>
							</div>
							<i className="icon_jdzs"></i>
						</div>
					</Col>
				</Row>

				<div className="dashboard" style={{padding:'0'}}>
					<div className="generalTitle clearfix">
						<h3 className="fl">网关概况</h3>
						<div className="fr">
							<Icon type="sync" onClick={this.handleRefresh}/>
							<Select
								showSearch
								style={{ width: 200 }}
								defaultValue={this.state.projectId}
								optionFilterProp="children"
								onChange={this.handleSelect}
								filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
							>
								<Select.Option value="all">全部</Select.Option>
								{
									this.state.projects.map((p, index)=> {
										return (
											<Select.Option key={'p'+index} value={p.id}>{p.name}</Select.Option>
										)
									})
								}
							</Select>
						</div>
					</div>
					<ul className="gatewayList clearfix">
						<li>
							<p>网关上行总数（条）</p>
							<h3>{!!mapData.uplinkSumCount?mapData.uplinkSumCount:0}</h3>
						</li>
						<li>
							<p>网关下行总数（条）</p>
							<h3>{!!mapData.downlinkSumCount?mapData.downlinkSumCount:0}</h3>
						</li>
						<li>
							<p>网关平均负载率（%）</p>
							<h3>{!!mapData.avgLoadRate?mapData.avgLoadRate:0}</h3>
						</li>
						<li>
							<p>离线网关数量（个）</p>
							<h3>{!!mapData.offlineGatewayCount?mapData.offlineGatewayCount:0}</h3>
						</li>
					</ul>
					<ul className="tableColor">
						<li>
							<i className="dot-blue"></i>在线网关
						</li>
						<li>
							<i className="dot-gray"></i>离线网关
						</li>
					</ul>
					<div className="myTabs">
						<div id="up-map" className="dash-map map" style={{height:'440px'}}>
						</div>
					</div>
					{/*<Tabs defaultActiveKey={this.state.active} onChange={this.handleTab} className="myTabs">
						<TabPane tab="" key="up">
							<div id="up-map" className="dash-map map myTabs" style={{height:'440px'}}>
							</div>
						</TabPane>
						<TabPane tab="下行" key="down">
							<div id="down-map" className="dash-map map" style={{height:'440px'}}>
							</div>
						</TabPane>
					</Tabs>*/}
				</div>
			</Content>
		)
	}
}