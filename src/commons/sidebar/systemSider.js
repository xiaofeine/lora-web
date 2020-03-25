import React from 'react';
import {render} from 'react-dom';
import {Menu, Icon, Layout, Button} from 'antd';

const {Sider} = Layout;

export default class SystemSider extends React.Component {
    static defaultProps = {
        menus: [
            {
                href: '#',
                icon: 'left-xmxq',
                text: 'OTA管理',
                children: [
                    {
                        href: '/user/system',
                        text: '固件列表',
                    },
                    {
                        href: '/user/system/firmHistory',
                        icon: 'left-zbgl',
                        text: '升级历史',
                    },
                ]
            },
            {
                href: '/user/system/bands',
                icon: 'left-yyjk',
                text: '频段管理',
            },
        ],
    }

    state = {
        active: this.props.history && this.props.history.location.pathname,
    }

    handleMenu = (e) => {
        this.setState({active: e.key});
        this.props.history.push(e.key);
    }

    getMenus = () => {
        return this.props.menus.map((m) => {
            return (
                !m.children ?
                    <Menu.Item key={m.href}>
                        <i className={`iconLeft ${m.icon}`}></i>
                        <span>{m.text}</span>
                    </Menu.Item> :
                    <Menu.SubMenu key={m.href} title={<span><i className={`iconLeft ${m.icon}`}></i>{m.text}</span>}>
                        {m.children.map((item) => {
                            return (
                                <Menu.Item key={item.href}>{item.text}</Menu.Item>
                            )
                        })}
                    </Menu.SubMenu>
            )
        });
    }

    render() {
        console.log(this.props)
        const menus = this.getMenus();
        return (
            <Sider theme="light">
                <Menu
                    mode="inline"
                    onClick={this.handleMenu}
                    defaultSelectedKeys={[this.state.active]}
                    style={{height: '100%'}}
                >
                    {menus}
                </Menu>
            </Sider>
        )
    }
}