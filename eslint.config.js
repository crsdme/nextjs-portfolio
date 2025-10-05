const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  nextjs: true,
  stylistic: true,
  typescript: true,
  ignores: [
    '.next',
    'node_modules',
    'public',
    'dist',
    'dist-test',
    'drizzle',
    'coverage',
    '.turbo',
    'postgres_data',
  ],
})
