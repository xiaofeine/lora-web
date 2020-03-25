/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/7
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout } from 'antd';
const { Content } = Layout;


export default class Five extends React.Component {

    render() {
        return (
            <Content>
                <div className="project-no">
                    <img src="../static/images/ts-500.png" className="no-content-image"/>
                </div>
            </Content>
        )
    }
}