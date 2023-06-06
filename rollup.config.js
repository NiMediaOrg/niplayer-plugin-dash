import { defineConfig } from "rollup"
import ts from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import px2rem from 'postcss-pxtorem'
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
const extensions = [".ts","less"];
export default defineConfig({
    input: "./package/index.ts",
    output: {
        file: "./dist/niplayer-plugin-dash.esm.js",
        format: "esm"
    },
    treeshake: true,
    plugins: [
        ts({
            compilerOptions: {}
        }),
        postcss({
            plugins: [
                autoprefixer(),
                px2rem({
                    rootValue: 16,
                    propList: [
                        'margin-left',
                        'min-width',
                        'height',
                        'font-size',
                        'bottom',
                        'width',
                        'padding',
                        'transform',
                    ]
                }),
            ]
        }),
        commonjs(),
        nodeResolve({
            extensions
        }),
    ]
})