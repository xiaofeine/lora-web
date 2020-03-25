/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/8
 * Description:
 */

import React from 'react';
import { render } from 'react-dom';
import { Layout } from 'antd';

export default class LoraFooter extends React.Component {

	render() {
		return (
			<Layout.Footer className="lora-footer">
				<div className="footerText">
					<a>帮助</a>
					<a>隐私</a>
					<a>条款</a>
				</div>
				<div className="footerText">Copyright ©2018 浙江利尔达物联网技术有限公司</div>
			</Layout.Footer>
		)
	}
}