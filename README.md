# react-native-signature-pad

[![npm version](https://badge.fury.io/js/react-native-signature-pad.svg)](//npmjs.com/package/react-native-signature-pad)
[![star this repo](http://githubbadges.com/star.svg?user=yz1311&repo=react-native-signature-pad&style=flat)](https://github.com/yz1311/react-native-signature-pad) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![All Contributors](https://img.shields.io/badge/all_contributors-12-orange.svg?style=flat-square)](#contributors) [![Known Vulnerabilities](https://snyk.io/test/github/yz1311/react-native-signature-pad/badge.svg?style=flat-square)](https://snyk.io/test/github/yz1311/react-native-signature-pad) 



React Native wrapper around @[szimek's](https://github.com/szimek) HTML5 Canvas based [Signature Pad](https://github.com/szimek/signature_pad)

- Supports Android and iOS
- Pure JavaScript implementation with no native dependencies
- Tested with RN 0.40
- Can easily be rotated using the "transform" style
- Generates a base64 encoded png image of the signature

这个库跟最原始的有啥区别:

-  修复部分android手机上间歇性出现无法手写的情况(oppo、vivo的情况特别严重)
   
-  添加清空画板功能(清空画板也可以通过更改组件的key属性或者隐藏再显示的方式来实现)

## 更新日志

`2019/09/02`

对使用webview相关的库绝望了，

官方库:  在部分oppo/vivo手机上面无法手写，或者清空后无法手写

https://github.com/JamesMcIntosh/react-native-signature-pad  :该库没有兼容性问题，但是很卡，特别是手写较快(真的不是很快)的情况下

https://github.com/YanYuanFE/react-native-signature-canvas   :跟官方库一样的毛病

https://github.com/RepairShopr/react-native-signature-capture   :最有希望的库了,基于原生，但是不支持还原签名数据和设置透明背景


`2019/09/20`

https://github.com/JamesMcIntosh/react-native-signature-pad

在该库的基础上面，改变了数据返回的方式，不是画完就返回，而是手动去获取数据然后返回(卡的原因就是每次画完都返回，传输速度慢了))

`2019/09/21`

修复ios下面postMessage无法传递参数到web的问题，目前两端已能正常使用

## Demo

![SignaturePadDemo](https://cloud.githubusercontent.com/assets/7293984/13297035/303fefc6-dae5-11e5-99e8-edb8335633b5.gif) ![SignaturePadDemoAndroid](https://cloud.githubusercontent.com/assets/7293984/13299954/72bc3bf4-daf2-11e5-8606-388c05c26d6d.gif)

## Installation

```sh
$ yarn add @yz1311/react-native-signature-pad  react-native-webview
```

## Using a Custom Signature Font

There is an option to generate a signature based off the user's name. You can use your own custom font. Currently, we recommend converting your font file into a data URL (we used [dataurl.net](http://dataurl.net/#dataurlmaker)). Store that in a .js file with the contents similar to something like below:

```js
var content = `
  @font-face {
    font-family: 'SignatureFont';
    src: url(/* data url of your font */) format(/* orig font file type i.e. 'ttf' */);
  }
`;

export default content;
```

## Generating a Signature from a String

If you would like to generate a signature as opposed to manually writing your own, you can enable the `useFont` prop to `true` and use the prop `name` where the generated signature will be based from.

```js
...

var signatureFont = require('./signature-font');

...

var aName = 'John Doe';

<SignaturePad
  ...
  useFont={true}
  name={aName}
  fontStyle={signatureFont}
/>
```

## Example

```js
import React, {Component} from 'react';
import {View} from 'react-native';
import SignaturePad from '@yz1311/react-native-signature-pad';

var penMinWidth = 2;  // Default value: 1
var penMaxWidth = 3;  // Default value: 4

export default class Demo extends Component {
  render = () => {
    return (
      <View style={{flex: 1}}>
        <SignaturePad
          ref=(ref=>this.signaturePad=ref)
          onError={this._signaturePadError}
          onChange={this._signaturePadChange}  //该事件已失效，影响性能
          penMinWidth={penMinWidth}
          penMaxWidth={penMaxWidth}
          style={{flex: 1, backgroundColor: 'white'}}
          useFont={false}
        />
      </View>
    )
  };

  _signaturePadError = (error) => {
    console.error(error);
  };

  _signaturePadChange = ({base64DataUrl}) => {
    console.log("Got new signature: " + base64DataUrl);
  };

  getDataURL = async () => {
    try{
      //主动获取结果
        let base64Str = await this.signaturePad.getDataURL();
    } catch(e) {

    }  
  }

  getIsEmpty = async () => {
    //获取是否有手写,true/false表示有结果，undefined表示获取失败
    const isEmpty = await this.signaturePad.getIsEmpty();
  }
}
```

## Android 7 WebView Changes

Google changed the default behaviour for WebViews with Android 7 (Nougat). In apps that use WebViews, it no longer uses the WebView APK in previous versions but instead it uses the Chrome WebView.

Source: https://developer.android.com/about/versions/nougat/android-7.0.html#webview

Because of this, WebView's `onMessage` prop replaces `onChange` previously used. However, `onMessage` was not implemented in React Native WebView until React Native v0.37. 
