/**
 * FileName: index
 * Auth: Linn
 * Created at: 2018/8/8
 * Description:
 */
import React from 'react';
import { render } from 'react-dom';
import { Layout, Breadcrumb } from 'antd';

export default class LoraBread extends React.Component {

	render() {
		return (
			<Breadcrumb separator="/">
				{
					this.props.breads.map((b, index)=> {
						if (index+1 === this.props.breads.length || index === 0) {
							return (
								<Breadcrumb.Item key={b.href}>
									{b.text}
								</Breadcrumb.Item>
							)
						}
						return (
							<Breadcrumb.Item key={b.href} href={b.href}>
								{b.text}
							</Breadcrumb.Item>
						)
					})
				}
			</Breadcrumb>
		)
	}
 }