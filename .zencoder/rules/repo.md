---
description: Repository Information Overview
alwaysApply: true
---

# SM Chit Fund React Application Information

## Summary
A React application for managing chit funds with support for multiple languages (English, Hindi, Tamil) and environment-specific configurations. The application provides features for user authentication, payment processing, and transaction history tracking.

## Structure
- **src/**: Main source code directory
  - **assets/**: Images and SASS files for styling
  - **components/**: Reusable React components
  - **hooks/**: Custom React hooks for Redux state
  - **locales/**: Internationalization files (en, hi, ta)
  - **pages/**: Main application pages/routes
  - **redux/**: Redux state management
  - **services/**: API service modules
  - **types/**: TypeScript type definitions
  - **utils/**: Utility functions
  - **view/**: UI layout components
- **public/**: Static assets and HTML template
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
- i18next 23.10.0 (Internationalization)
- Axios 1.8.4 (HTTP client)
- React QR Code 2.0.15
- Redux 5.0.1 (State management)
- React Redux 9.2.0
- Redux Toolkit 2.x
- Redux Thunk 3.1.0
- Redux Logger 3.0.6

**Development Dependencies**:
- Sass 1.86.0
- env-cmd 10.1.0
- Testing libraries (Jest, React Testing Library)
- Storybook for component documentation

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for different environments
npm run build           # Default build
npm run build:staging   # Staging environment
npm run build:prod      # Production environment
```

## Testing
**Framework**: Jest with React Testing Library
**Test Location**: Files with `.test.js` extension alongside components
**Configuration**: src/setupTests.js
**Run Command**:
```bash
npm test
```

## Environment Configuration
**Configuration Files**:
- `.env`: Default environment variables
- `.env.development`: Development environment variables
- `.env.staging`: Staging environment variables
- `.env.production`: Production environment variables

**Key Variables**:
- REACT_APP_API_URL: Backend API URL
- REACT_APP_ENV: Current environment
- REACT_APP_DEBUG: Enable debug logging

## Internationalization
**Supported Languages**: English, Hindi, Tamil
**Configuration**: src/i18n.js
**Implementation**: Uses react-i18next with language detection

## Redux Implementation
**Store Configuration**: src/redux/store.ts
**Slices**:
- authSlice: Authentication state management
- themeSlice: Theme preferences (light/dark mode)
- languageSlice: Internationalization state
- userSlice: User profile management
- paymentSlice: Payment processing and history
- dataSlice: Application data management
- dashboardSlice: Dashboard statistics and metrics

**Key Features**:
- Async thunks for API calls
- TypeScript integration
- Redux DevTools support
- Redux Logger for development
- Middleware for async operations
- Custom hooks for accessing Redux state