---
description: Repository Information Overview
alwaysApply: true
---

# SM Chit Fund React Application

## Summary
A React application for managing chit funds with support for multiple languages (English, Hindi, Tamil), user authentication, payment processing, and transaction tracking. The application provides a dashboard, payment interface, and transaction history views.

## Structure
- **public/**: Static assets and HTML template
- **src/**: Source code for the application
  - **assets/**: Images and stylesheets
  - **components/**: Reusable UI components
  - **context/**: React context providers
  - **locales/**: Internationalization files
  - **pages/**: Main application pages
  - **redux/**: State management
  - **services/**: API and service integrations
  - **utils/**: Utility functions
  - **__tests__/**: Test files
- **.storybook/**: Storybook configuration for component documentation

## Language & Runtime
**Language**: JavaScript/TypeScript
**Version**: TypeScript 4.9.5
**Build System**: Create React App
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 18.2.0
- React Router DOM 7.3.0
- Material UI 6.4.8
- Bootstrap 5.3.3
- i18next 23.10.0
- Axios 1.8.4
- React-i18next 15.4.1

**Development Dependencies**:
- Jest (via react-scripts)
- Testing Library
- Sass 1.86.0
- Storybook
- env-cmd 10.1.0

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Build for staging
npm run build:staging

# Build for production (alternative)
npm run build:prod
```

## Testing
**Framework**: Jest with React Testing Library
**Test Location**: src/__tests__/
**Naming Convention**: *.test.js, *.spec.js
**Configuration**: jest.config.js
**Run Command**:
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:integration
npm run test:performance
npm run test:100users
npm run test:chit-transaction
```

## Internationalization
**Supported Languages**: English (en), Hindi (hi), Tamil (ta)
**Configuration**: src/i18n.js
**Translation Files**: src/locales/{language}/translation.json
**Implementation**: Uses react-i18next with browser language detection

## Environment Configuration
**Files**:
- .env: Common variables
- .env.development: Development environment
- .env.staging: Staging environment
- .env.production: Production environment

**Key Variables**:
- REACT_APP_API_URL: Backend API URL
- REACT_APP_ENV: Current environment
- REACT_APP_DEBUG: Enable debug logging