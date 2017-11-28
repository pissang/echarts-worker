const webpack = require('webpack');
const path = require('path');

module.exports = [{
    entry: __dirname + '/src/main.js',
    output: {
        libraryTarget: 'umd',
        library: 'echarts',
        filename: 'dist/echarts.js'
    },
    target: 'web'
}, {
    entry: __dirname + '/src/worker.js',
    output: {
        filename: 'dist/echarts-worker.js'
    },
    target: 'webworker'
}];