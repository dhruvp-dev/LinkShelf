// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Per-icon imports resolve through the package `exports` map, which eslint-plugin-import can't read.
      'import/no-unresolved': ['error', { ignore: ['^@tabler/icons-react-native/'] }],
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/component-creation-during-render': 'off',
    },
  },
]);
