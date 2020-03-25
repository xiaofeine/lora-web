/**
 * FileName: utils
 * Auth: Linn
 * Created at: 2018/8/3
 * Description:
 */

/**
 * 服务器请求地址
 */
const domain = requestUrl;

Date.prototype.toJSON = function () {
	let date = this;
	let y = date.getFullYear();
	let m = date.getMonth()+1;
	let d = date.getDate();
	let h = date.getHours();
	let mm = date.getMinutes();
	let s = date.getSeconds();
	let ms = date.getMilliseconds();
	m = m<10?'0'+m:m;
	d = d<10?'0'+d:d;
	h = h<10?'0'+h:h;
	mm = mm<10?'0'+mm:mm;
	s = s<10?'0'+s:s;
	return `${y}-${m}-${d} ${h}:${mm}:${s}.${ms}`;
};

Number.prototype.toLocaleExponential = function (n=2, v=1000) {
	return this?(this>v?this.toExponential(n):this):0;
}

Number.prototype.getProperValue = function () {
	if (this === 0) {
		return 0;
	} else {
		return this?this:'----';
	}
}

const isEqualObject = (a, b)=> {
	if (b&&a) {
		let keys1 = Object.keys(a);
		let keys2 = Object.keys(b);
		if (keys1.length === keys2.length) {
			for (let i=0; i<keys1.length; i++) {
				let k = keys1[i];
				if (!Object.is(a[k], b[k])) {
					return false;
				}
			}
			return true;
		}
	} else {
		return false;
	}
}

const getProperValue = (a, b)=> {
	if (a === 0) {
		return 0;
	} else {
		return a?a:'----';
	}
}


/**
 * 生成验证码
 * @param codeLength
 * @returns {string}
 */
const createCode = function (codeLength) {
	let code = ``;
	//所有候选组成验证码的字符，当然也可以用中文的
	let selectChar = new Array(2, 3, 4, 5, 6, 7, 8, 9,
		'A','B','C','D','E','F','G','H','J','K','M','N',
		'P','Q','R','S','T','U','V','W','X','Y','Z',
		'a','b','c','d','e','f','g','h','j','k','m','n',
		'p','q','r','s','t','u','v','w','x','y','z');
	for (let i = 0; i < codeLength; i++) {
		let charIndex = Math.floor(Math.random() * 54);
		code += selectChar[charIndex];
	}
	return code;
}

/**
 * 生成随机数
 * @param codeLength
 * @returns {string}
 */
const getCode = function (codeLength) {
	let code = ``;
	//所有候选组成验证码的字符，当然也可以用中文的
	let selectChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
		'A','B','C','D','E','F');
	for (let i = 0; i < codeLength; i++) {
		let charIndex = Math.floor(Math.random() * 16);
		code += selectChar[charIndex];
	}
	return code;
}

/**
 * 生成渐变色
 */
const gradientColor = (startRGB, endRGB,step)=> {
	let startR = startRGB[0];
	let startG = startRGB[1];
	let startB = startRGB[2];

	let endR = endRGB[0];
	let endG = endRGB[1];
	let endB = endRGB[2];

	step = Math.ceil(step);

	let sR = (endR-startR)/step;//总差值
	let sG = (endG-startG)/step;
	let sB = (endB-startB)/step;

	var colorArr = [];
	for(var i=0;i<step;i++){
		//计算每一步的hex值
		var hex = colorToHex('rgb('+parseInt((sR*i+startR))+','+parseInt((sG*i+startG))+','+parseInt((sB*i+startB))+')');
		colorArr.push(hex);
	}
	return colorArr;
}

// 将rgb表示方式转换为hex表示方式
function colorToHex(rgb){
	var _this = rgb;
	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	if(/^(rgb|RGB)/.test(_this)){
		var aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
		var strHex = "#";
		for(var i=0; i<aColor.length; i++){
			var hex = Number(aColor[i]).toString(16);
			hex = hex<10 ? 0+''+hex :hex;// 保证每个rgb的值为2位
			if(hex === "0"){
				hex += hex;
			}
			strHex += hex;
		}
		if(strHex.length !== 7){
			strHex = _this;
		}

		return strHex;
	}else if(reg.test(_this)){
		var aNum = _this.replace(/#/,"").split("");
		if(aNum.length === 6){
			return _this;
		}else if(aNum.length === 3){
			var numHex = "#";
			for(var i=0; i<aNum.length; i+=1){
				numHex += (aNum[i]+aNum[i]);
			}
			return numHex;
		}
	}else{
		return _this;
	}
}

export {
	createCode, domain, getCode, getProperValue, gradientColor, isEqualObject
}

