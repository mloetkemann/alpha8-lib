import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const config = tseslint.config(  
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          project: true,
        },
      },
    },
    {
      files: ['*.js'],
      ...tseslint.configs.disableTypeChecked,
    },
    {
        ignores: ['src/**/*.spec.ts']
    }
);

export default config

