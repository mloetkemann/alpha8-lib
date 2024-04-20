import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(  
  //...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    files: ['./src/**/*.ts'],
    ignores: ['./src/**/*.spec.ts', '*.js', '*.mjs', '*.cjs']
    
  }
); 