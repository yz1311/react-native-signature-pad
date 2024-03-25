'use strict';

import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {
    StyleSheet
} from 'react-native';
import {WebView} from 'react-native-webview';
import {ViewPropTypes} from 'deprecated-react-native-prop-types';


import htmlContent from './injectedHtml';
import injectedSignaturePad from './injectedJavaScript/signaturePad';
import injectedApplication from './injectedJavaScript/application';
import injectedErrorHandler from './injectedJavaScript/errorHandler';
import injectedExecuteNativeFunction from './injectedJavaScript/executeNativeFunction';

class SignaturePad extends Component {
    static propTypes = {
        onChange: PropTypes.func,
        onResult: PropTypes.func,
        onError: PropTypes.func,
        style: ViewPropTypes.style,
        penColor: PropTypes.string,
        dataURL: PropTypes.string,
        height: PropTypes.number,
        width: PropTypes.number,
        penMinWidth: PropTypes.number,
        penMaxWidth: PropTypes.number,
        useFont: PropTypes.bool,
        name: PropTypes.string,
        fontStyle: PropTypes.string,
        initTimeout: PropTypes.number
    };

    static defaultProps = {
        onChange: () => {
        },
        onResult: () => {

        },
        onError: () => {
        },
        style: {},
        useFont: false,
        name: ''
    };

    constructor(props) {
        super(props);
        var escapedName = props.name.replace(/"/, `\\"`);
        this.state = {base64DataUrl: props.dataURL || null, name: escapedName};
        const {backgroundColor} = StyleSheet.flatten(props.style);
        var injectedJavaScript = injectedExecuteNativeFunction
            + injectedErrorHandler
            + injectedSignaturePad
            + injectedApplication(
                props.penColor,
                backgroundColor,
                props.dataURL,
                props.penMinWidth,
                props.penMaxWidth,
                props.useFont,
                escapedName,
                props.height,
                props.width,
                props.initTimeout
            );
        var html = htmlContent(injectedJavaScript, props.fontStyle);
        this.source = {html};
        // We don't use WebView's injectedJavaScript because on Android,
        //  the WebView re-injects the JavaScript upon every url change.
        // Given that we use url changes to communicate signature changes to the
        //  React Native app, the JS is re-injected every time a stroke is drawn.
    }

    UNSAFE_componentWillReceiveProps = (nextProps) => {
        if (this.props.useFont && this.state.name !== nextProps.name) {
            var escapedName = nextProps.name.replace(/"/, `\\"`);
            this.setState({name: escapedName});

            const {backgroundColor} = StyleSheet.flatten(this.props.style);
            var injectedJavaScript = injectedExecuteNativeFunction
                + injectedErrorHandler
                + injectedSignaturePad
                + injectedApplication(
                    this.props.penColor,
                    backgroundColor,
                    this.props.dataURL,
                    this.props.penMinWidth,
                    this.props.penMaxWidth,
                    this.props.useFont,
                    escapedName,
                    this.props.height,
                    this.props.width,
                    this.props.initTimeout
                );
            var html = htmlContent(injectedJavaScript, this.props.fontStyle);
            this.source = {html};
        }
    };
    

    _onNavigationChange = (args) => {
        this._parseMessageFromWebViewNavigationChange(unescape(args.url));
    };

    _parseMessageFromWebViewNavigationChange = (newUrl) => {
        // Example input:
        // applewebdata://4985ECDA-4C2B-4E37-87ED-0070D14EB985#executeFunction=jsError&arguments=%7B%22message%22:%22ReferenceError:%20Can't%20find%20variable:%20WHADDUP%22,%22url%22:%22applewebdata://4985ECDA-4C2B-4E37-87ED-0070D14EB985%22,%22line%22:340,%22column%22:10%7D"
        // All parameters to the native world are passed via a hash url where
        //  every parameter is passed as &[ParameterName]<-[Content]&
        var hashUrlIndex = newUrl.lastIndexOf('#');
        if (hashUrlIndex === -1) {
            return;
        }

        var hashUrl = newUrl.substring(hashUrlIndex);
        hashUrl = decodeURIComponent(hashUrl);
        var regexFindAllSubmittedParameters = /&(.*?)&/g;

        var parameters = {};
        var parameterMatch = regexFindAllSubmittedParameters.exec(hashUrl);
        if (!parameterMatch) {
            return;
        }

        while (parameterMatch) {
            var parameterPair = parameterMatch[1]; //For example executeFunction=jsError or arguments=...

            var parameterPairSplit = parameterPair.split('<-');
            if (parameterPairSplit.length === 2) {
                parameters[parameterPairSplit[0]] = parameterPairSplit[1];
            }

            parameterMatch = regexFindAllSubmittedParameters.exec(hashUrl);
        }

        if (!this._attemptToExecuteNativeFunctionFromWebViewMessage(parameters)) {
            logger.warn(
                {parameters, hashUrl},
                'Received an unknown set of parameters from WebView'
            );
        }
    };

    _attemptToExecuteNativeFunctionFromWebViewMessage = (message) => {
        if (message.executeFunction && message.arguments) {
            var parsedArguments = JSON.parse(message.arguments);
            var referencedFunction = this['_bridged_' + message.executeFunction];
            if (typeof(referencedFunction) === 'function') {
                referencedFunction.apply(this, [parsedArguments]);
                return true;
            }
        }

        return false;
    };

    _bridged_jsError = (args) => {
        this.props.onError({details: args});
    };

    _bridged_finishedStroke = ({base64DataUrl}) => {
        this.props.onChange({base64DataUrl});
        // this.setState({base64DataUrl});
    };

    _bridged_getDataURL = ({base64DataUrl}) => {
        this.tempResolve&&this.tempResolve(base64DataUrl);
        this.props.onResult({base64DataUrl});
    };

    _bridged_getIsEmpty = ({data}) => {
        this.tempIsEmptyResolve&&this.tempIsEmptyResolve(data);
    };

    _bridged_canvasSize = (data) => {
        this.props.onChange(data);
        // this.setState({base64DataUrl});
    };

    _renderError = (args) => {
        this.props.onError({details: args});
    };

    _renderLoading = (args) => {
    };

    _onMessage = (event) => {
        var data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
            case 'canvasSize':
                this._bridged_canvasSize(data);
                break;
            case 'finishedStroke':
                this._bridged_finishedStroke(data);
                break;
            case 'getDataURL':
                this._bridged_getDataURL(data);
                break;
            case 'getIsEmpty':
                this._bridged_getIsEmpty(data);
                break;
        }
    }

    clear = () => {
        this._webview.postMessage(JSON.stringify({ action: 'clear' }));
    }

    getDataURL = async () => {
        return new Promise((resolve,reject)=>{
            this.tempResolve=resolve;
            this._webview.postMessage(JSON.stringify({ action: 'getDataURL' }));
            setTimeout(()=>{
                reject('获取失败');
            },2000);
        })
    }

    getIsEmpty = async () => {
        return new Promise((resolve,reject)=>{
            this.tempIsEmptyResolve=resolve;
            this._webview.postMessage(JSON.stringify({ action: 'getIsEmpty' }));
            setTimeout(()=>{
                resolve(undefined);
            },2000);
        })
    }

    render = () => {
        return (
            <WebView
                ref={(ref) => { this._webview = ref }}
                automaticallyAdjustContentInsets={false}
                onNavigationStateChange={this._onNavigationChange}
                onMessage={this._onMessage}
                renderError={this._renderError}
                renderLoading={this._renderLoading}
                source={this.source}
                scrollEnabled={false}
                javaScriptEnabled={true}
                style={this.props.style}
            />
        );
    };
}

export { SignaturePad as default }