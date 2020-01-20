module.exports = {
    'env': {
      'es6': true,
      'node': true,
    },
    'extends': [
      'plugin:vue/essential',
      'google',
    ],
    'globals': {
      'Atomics': 'readonly',
      'SharedArrayBuffer': 'readonly',
    },
    'parserOptions': {
      'ecmaVersion': 2018,
      'parser': '@typescript-eslint/parser',
      'sourceType': 'module',
    },
    'plugins': [
      'vue',
      '@typescript-eslint',
    ],
    'rules': {
      'object-curly-spacing': [
        'error', 'always' 
      ],
      'semi': ["error", "never"],
      'indent': ['error', 2],
      'max-len': ['error', { 'code': 120 }],
      'require-jsdoc': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  };
