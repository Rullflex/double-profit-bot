import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'n/prefer-global/process': ['off'],
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'no-console': 'off',
  },
  typescript: {
    overrides: {
      'no-restricted-syntax': ['error', 'TSExportAssignment'],
    },
  },
})
