# thundercall-signup
This project provides branded public signup forms for ThunderCall. It currently supports the KLTV, KTRE, and KWTX signup experiences and posts each signup to both:

- the existing legacy dataload API
- the new ThunderCall Go HTTP API

During cutover, the two submissions are intentionally independent:

- the legacy request still goes directly from the browser to the legacy API
- the new ThunderCall request now goes from the browser to a same-origin Cloudflare Pages Function at `/api/signup`
- the Cloudflare function optionally verifies a Turnstile token, signs the request with a shared secret, and forwards it to `https://api.thundercall.com/api/users/signup`

That means the legacy flow is left untouched, while only the new ThunderCall path is protected behind the Cloudflare proxy.

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

The default ThunderCall API target for all three environments is `https://api.thundercall.com`.
Each station env file also sets:

- `REACT_APP_API_BASE_URL`
- `REACT_APP_THUNDERCALL_SIGNUP_PROXY_URL`
- `REACT_APP_ACCOUNT_ID`
- `REACT_APP_COMPANYID`
- `REACT_APP_LOCATION`
- `REACT_APP_TURNSTILE_SITE_KEY`

Optional legacy overrides are also supported:

- `REACT_APP_LEGACY_API_BASE_URL`
- `REACT_APP_LEGACY_API_PRODUCT_ID`
- `REACT_APP_LEGACY_API_COMPANY_HEADER`
- `REACT_APP_LEGACY_API_AUTHORIZATION`

### Cloudflare Pages Function

This repo now includes a Cloudflare Pages Function at:

- `functions/api/signup.js`

That function handles only the new ThunderCall submission. It does not proxy or modify the legacy request.

Required Cloudflare Pages runtime secrets/vars for the new API path:

- `THUNDERCALL_API_BASE_URL`
  - recommended value: `https://api.thundercall.com`
- `THUNDERCALL_API_PUBLIC_SIGNUP_PROXY_SHARED_SECRET`
  - must match the Go API env var of the same name
- `TURNSTILE_SECRET_KEY`
  - optional but recommended; when set, the function requires a valid Turnstile token

Build-time browser env vars:

- `REACT_APP_THUNDERCALL_SIGNUP_PROXY_URL`
  - default: `/api/signup`
- `REACT_APP_TURNSTILE_SITE_KEY`
  - optional; when set, the form renders a Turnstile widget and forwards its token to the Pages Function

If `REACT_APP_TURNSTILE_SITE_KEY` is empty, the form still renders and still dual-submits, but the new API path will only be protected by the signed Cloudflare proxy and API-side rate limiting.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build:kltv`
### `npm run build:ktre`
### `npm run build:kwtx`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed.

For the secure new ThunderCall signup path, prefer a repo-based Cloudflare Pages deployment so the included Pages Function is active. A drag-and-drop static upload will not include `functions/api/signup.js`.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

### `publish-to-prod.sh`

This is still the legacy deployment script. Before using it in the future, it should be updated to deploy the new ThunderCall signup app and confirm the Cloudflare Pages build/runtime settings you want to ship.
