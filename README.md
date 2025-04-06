# SM Chit Fund React Application

This is a React application for managing chit funds.

## Internationalization (i18n)

The application supports multiple languages:
- English (en)
- Hindi (hi)
- Marathi (mr)
- Tamil (ta)

### How to Use Translations

1. Import the translation hook in your component:
```jsx
import { useTranslation } from 'react-i18next';
```

2. Use the hook to access the translation function:
```jsx
const { t } = useTranslation();
```

3. Use the translation function to translate text:
```jsx
<Typography>{t('common.search')}</Typography>
```

### Adding New Translations

1. Add new translation keys to the JSON files in the `src/locales` directory.
2. Follow the existing structure with namespaces (e.g., `common`, `auth`, etc.).
3. Make sure to add translations for all supported languages.

### Adding a New Language

1. Create a new translation file in the `src/locales` directory.
2. Add the language to the `languages` array in the `LanguageSelector.tsx` component.
3. Import and add the new language resource in the `i18n.ts` file.

## Environment Configuration

The application uses environment variables to configure different environments (development, staging, production). These are managed through `.env` files:

- `.env`: Default environment variables for all environments
- `.env.development`: Environment variables for development (used with `npm start`)
- `.env.staging`: Environment variables for staging
- `.env.production`: Environment variables for production

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:8000/api |
| REACT_APP_ENV | Current environment | development |
| REACT_APP_DEBUG | Enable debug logging | true |

### Adding New Environment Variables

1. Add the variable to the appropriate `.env` file(s)
2. Make sure to prefix with `REACT_APP_` for Create React App to recognize it
3. Access in code using `process.env.REACT_APP_VARIABLE_NAME`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode using `.env.development` configuration.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder using `.env.production` configuration.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run build:staging`

Builds the app for staging environment using `.env.staging` configuration.

### `npm run build:prod`

Builds the app for production environment using `.env.production` configuration.

### `npm test`

Launches the test runner in the interactive watch mode.# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
