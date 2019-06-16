// tslint:disable:object-literal-sort-keys
// tslint:disable:no-default-export
import fs from 'fs';
import webpack from 'webpack';
import { options, packageJson } from './options';

const deps = {};
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
            modules: [options.alias['@npm']],
        },
        resolveLoader: {
            alias: options.alias,
            moduleExtensions: ['-loader'],
            modules: [options.alias['@npm']],
        },
        plugins: [
            new webpack.DefinePlugin({
                VERSION: JSON.stringify(packageJson.version),
            }),
        ],
    };

    const tsRule = (target: 'src' | 'examples') => ({
        test: /\.tsx?$/,
        use: [
            {
                // awesome-typescript-loader cannot be used until https://github.com/s-panferov/awesome-typescript-loader/issues/411 is not resolved.
                // loader: 'awesome-typescript-loader',
                loader: 'ts-loader',
                options: {
                    // configFileName: `${options.alias['@root']}/${target}/tsconfig.json`, // ATL
                    configFile: `${options.alias['@root']}/${target}/tsconfig.json`, // TSL
                },
            },
        ],
    });

    const examplesEntryPoint = {};
    fs.readdirSync(options.alias['@examples'])
        .filter(file => file.includes('.ts'))
        .forEach(file => {
            examplesEntryPoint[file.replace('.ts', '')] = `${options.alias['@examples']}/${file}`;
        });

    return [
        {
            ...baseConfig,
            name: 'build',
            mode: BUILD ? 'production' : 'development',
            entry: {
                app: `${options.alias['@app']}/index.ts`,
            },
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
                        exclude: [options.alias['@examples'], options.alias['@test']],
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
                        exclude: [options.alias['@examples'], options.alias['@test']],
                    },
                ],
            },
            node: {
                Buffer: false,
                process: false,
            },
            plugins: [...baseConfig.plugins, new (require('webpack-visualizer-plugin'))()],
        },
        {
            ...baseConfig,
            name: 'examples',
            entry: examplesEntryPoint,
            output: {
                path: options.alias['@examples'],
            },
            resolve: {
                ...baseConfig.resolve,
                alias: {
                    '@wynd/sdk-api$': `${options.alias['@app']}/index.ts`,
                },
            },
            devServer: {
                contentBase: options.alias['@examples'],
            },
            node: {
                fs: 'empty',
            },
            module: {
                rules: [
                    {
                        ...tsRule('examples'),
                        exclude: [options.alias['@test']],
                    },
                ],
            },
            plugins: [...baseConfig.plugins, new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
        },
    ];
}
