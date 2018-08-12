import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import node_resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

module.exports = [{
    input: 'src/ts/index.ts',
    output: {
        file: './dist/bundle.min.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        typescript({
            rollupCommonJSResolveHack: true,
            tsconfig: './tsconfig.json'
        }),
        node_resolve(),
        commonjs(),
        uglify()
    ]
}, {
    input: 'src/ts/worker.ts',
    output: {
        file: './dist/worker.min.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        typescript({
            rollupCommonJSResolveHack: true,
            tsconfig: './tsconfig.webworker.json'
        }),
        node_resolve(),
        commonjs(),
        //uglify()
    ]
}];