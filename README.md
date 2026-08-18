# thundercall-signup
This project provides branded public signup forms for ThunderCall. It currently supports the KLTV, KTRE, and KWTX signup experiences and now posts directly to the ThunderCall Go HTTP API public signup endpoint instead of the legacy dataload API.

## Getting Started
### Install Dependencies

`npm install`


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm run start:kltv`
### `npm run start:ktre`
### `npm run start:kwtx`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

The current test API target for all three environments is `http://lyon-network.com:8080`.
Each station env file also sets:

- `REACT_APP_API_BASE_URL`
- `REACT_APP_ACCOUNT_ID`

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build:kltv`
### `npm run build:ktre`
### `npm run build:kwtx`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!\
See the *publish-to-prod.sh* section below for the preferred deployment method.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

### `publish-to-prod.sh`

This is still the legacy deployment script. Before using it in the future, it should be updated to deploy the new ThunderCall signup app and point at the production Go API hostname.
