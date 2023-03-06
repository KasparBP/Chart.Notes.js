// rollup.config.js
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
    input: 'src/chart.notes.js',
    output: [{
        file: 'build/chart.notes.umd.js',
        name: 'notes',
        format: 'umd',
        globals: {
            'chart.js': 'Chart',
            'chart.js/helpers': 'Chart.helpers'
        },
    }, {
        file: 'build/chart.notes.js',
        format: 'es',
        globals: {
            'chart.js': 'Chart',
            'chart.js/helpers': 'Chart.helpers'
        },
    }],
    external: [
        'chart.js',
        'chart.js/helpers'
    ],
    plugins: [
        nodeResolve()
    ]
};
