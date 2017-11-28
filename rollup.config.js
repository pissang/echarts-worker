import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: __dirname + '/src/worker.js',
    plugins: [
        nodeResolve(),
        commonjs()
    ],
    // sourceMap: true,
    output: [
        {
            format: 'iife',
            file: 'dist/echarts-worker.js'
        },
        {
            format: 'umd',
            name: 'echarts',
            file: 'dist/echarts.js'
        }
    ]
};