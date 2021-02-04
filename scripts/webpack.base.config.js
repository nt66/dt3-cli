const webpackConfigBase = {
  //module此处为loader区域，一般文件内容解析，处理放在此处，如babel，less,postcss转换等
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          }
        }
      },
      {
        test: [/\.css$/, /\.less$/],
        use: [
          'style-loader',
          {
            loader:'css-loader',
            options:{
              modules:true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('autoprefixer')()
              ],
            }
          },
        ]
      }
    ]
  }
}

module.exports = webpackConfigBase;
