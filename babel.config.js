const {NODE_ENV} = process.env;

// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['> 5%'],
          node: '12',
        },
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        modules: false,
        loose: true,
      },
    ],
  ],
  plugins: [
    // Don't use `loose` mode here - need to copy symbols when spreading
    '@babel/proposal-object-rest-spread',
    NODE_ENV === 'test' && '@babel/transform-modules-commonjs',
  ].filter(Boolean),
};
