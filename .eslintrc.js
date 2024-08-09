module.exports = { 
  "overrides": [
    {
      "files": ["src/**/*"],
      "env": {
        "browser": true,
        "es2021": true
      },
      "extends": [ 
        "eslint:recommended", 
        "plugin:react/recommended", 
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:storybook/recommended"
      ], 
      "parserOptions": {
        "sourceType": "module",
        "ecmaFeatures": {
          "jsx": true
        }
      },
      "settings": {
        "react": {
          "version": "16"
        }
      },
      "plugins": ["react", "react-hooks", "jsx-a11y"],
      "rules": {
        "react/prop-types": "off",
      }
    }
  ]
}