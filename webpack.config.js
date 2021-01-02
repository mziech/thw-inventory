const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const path = require('path');

module.exports = (env, argv) => ({
    entry: './src/static/index.js',
    plugins: [
        new WebpackManifestPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.(scss)$/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                    loader: 'postcss-loader', // Run postcss actions
                    options: {
                        postcssOptions: {
                            plugins: [
                                'autoprefixer',
                            ]
                        }
                    }
                }, {
                    loader: 'sass-loader' // compiles Sass to CSS
                }]
            }, {
                test: /\.m?jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },  {
                test: /\.(png|woff|woff2|eot|ttf|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: 'url-loader'
                }
            }
        ]
    },
    output: {
        publicPath: '',
        filename: argv.mode === 'development' ? 'bundle.js' : 'bundle-[contenthash].js',
        path: path.resolve(__dirname, 'src/main/resources/static/dist')
    }
});

