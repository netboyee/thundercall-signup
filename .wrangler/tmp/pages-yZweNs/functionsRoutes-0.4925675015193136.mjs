import { onRequestOptions as __api_signup_js_onRequestOptions } from "/Users/ernie/Projects/VOLO/ThunderCall/thundercall-signup/functions/api/signup.js"
import { onRequestPost as __api_signup_js_onRequestPost } from "/Users/ernie/Projects/VOLO/ThunderCall/thundercall-signup/functions/api/signup.js"

export const routes = [
    {
      routePath: "/api/signup",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_signup_js_onRequestOptions],
    },
  {
      routePath: "/api/signup",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_signup_js_onRequestPost],
    },
  ]