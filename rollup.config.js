import { defineConfig } from "rollup"
import ts from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
const extensions = [".ts","less"];
export default defineConfig({
    input: "./package/index.ts",
    output: {
        file: "./dist/niplayer-plugin-dash.esm.js",
        format: "esm"
    },
    plugins: [
        ts(),
        postcss({
            plugins: [
                autoprefixer()
            ]
        }),
        commonjs(),
        nodeResolve({
            extensions
        })
    ]
})