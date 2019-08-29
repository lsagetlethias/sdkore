// tslint:disable:object-literal-sort-keys
// tslint:disable:no-default-export
import webpack from 'webpack';
import { options, packageJson } from './options';

const deps: { [dependency: string]: string } = {};
Object.keys(packageJson.dependencies).forEach(dep => {
    deps[dep] = dep;
});

// Enable if peer
// if (packageJson.peerDependencies) {
//     Object.keys(packageJson.peerDependencies).forEach(dep => {
//         deps[dep] = dep;
//     });
// }

deps['qrcode/lib/browser'] = 'qrcode/lib/browser';
deps['qrcode/lib/server'] = 'qrcode/lib/server';
deps['axios/lib/helpers/buildURL'] = 'axios/lib/helpers/buildURL';

export default function webpackConfig(environment: string): webpack.Configuration[] {
    const BUILD = environment === 'production';

    const baseConfig: webpack.Configuration = {
        devtool: 'source-map',
        mode: 'development',
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
        resolveLoader: {
            alias: options.alias,
            moduleExtensions: ['-loader'],
        },
        plugins: [
            new webpack.DefinePlugin({
                VERSION: JSON.stringify(packageJson.version),
            }),
        ],
    };

    const tsRule = (_target: 'src' | 'examples') => ({
        test: /\.tsx?$/,
        use: [
            {
                // awesome-typescript-loader cannot be used until https://github.com/s-panferov/awesome-typescript-loader/issues/411 is not resolved.
                // loader: 'awesome-typescript-loader',
                loader: 'ts-loader',
                options: {
                    // configFileName: `${options.alias['@root']}/${target}/tsconfig.json`, // ATL
                    configFile: `${options.alias['@app']}/tsconfig.json`, // TSL
                },
            },
        ],
    });

    return [
        {
            ...baseConfig,
            name: 'build',
            mode: BUILD ? 'production' : 'development',
            entry: `${options.alias['@app']}/index.ts`,
            externals: deps,
            output: {
                path: options.alias['@output'],
                filename: 'index.js',
                libraryTarget: 'commonjs',
                chunkFilename: '[name].chunk.js',
            },
            module: {
                rules: [
                    {
                        enforce: 'pre',
                        test: /\.tsx?$/,
                        exclude: [options.alias['@test']],
                        use: [
                            {
                                loader: 'tslint-loader',
                                options: {
                                    typeCheck: false,
                                    fix: true,
                                },
                            },
                        ],
                    },
                    {
                        ...tsRule('src'),
                        exclude: [options.alias['@test']],
                    },
                ],
            },
            node: {
                Buffer: false,
                process: false,
            },
            plugins: [...baseConfig.plugins!, new (require('webpack-visualizer-plugin'))()],
        },
    ];
}
