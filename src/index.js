/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/7/30
 * Description:
 */
import React from 'react';
import ReactDOM from 'react-dom';
import AppRoute from './router/index';
import { LocaleProvider } from 'antd';
/*import 'ant-design-pro/dist/ant-design-pro.css';*/
import zhCN from 'antd/lib/locale-provider/zh_CN';

ReactDOM.render(
	<LocaleProvider locale={zhCN}>
		<AppRoute />
	</LocaleProvider>,
	document.getElementById("app")
);