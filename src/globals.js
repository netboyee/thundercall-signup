export const globals= {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "https://api.thundercall.com",
    THUNDERCALL_SIGNUP_PROXY_URL: process.env.REACT_APP_THUNDERCALL_SIGNUP_PROXY_URL || "/api/signup",
    TURNSTILE_SITE_KEY: process.env.REACT_APP_TURNSTILE_SITE_KEY || "",
    LEGACY_API_BASE_URL: process.env.REACT_APP_LEGACY_API_BASE_URL || "https://dataload.voloos.com",
    LEGACY_API_PRODUCT_ID: process.env.REACT_APP_LEGACY_API_PRODUCT_ID || "7J8vvMy85MkrcQLqM6ZZTl",
    LEGACY_API_COMPANY_HEADER: process.env.REACT_APP_LEGACY_API_COMPANY_HEADER || "1w1ZyzqeL4OAGpiTBS5SKX",
    LEGACY_API_AUTHORIZATION: process.env.REACT_APP_LEGACY_API_AUTHORIZATION || "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MGU0NGFlMS1iNTRmLTRhYWMtOGQyNy03MzU1Y2MyZGU3NWQiLCJqdGkiOiJlMDNlYTQ5OC1lOTUxLTRkMWUtODkyMS03OThmNzNlMjRiY2EiLCJpYXQiOjE2NTI5NzA4NjQsIlJvbGUiOiJQdWJsaWNBcGlVc2VyIiwiQ29tcGFueSI6IjBjODA5YjNmLWE1NDYtNGU3Yy04M2JmLThmYmUwZjgwYjBlMSIsIm5iZiI6MTY1Mjk3MDg2MywiZXhwIjoyMTQ1OTE2Nzk5LCJpc3MiOiJodHRwczovL2RhdGFsb2FkLnZvbG9vcy5jb20vIiwiYXVkIjoiaHR0cHM6Ly9kYXRhbG9hZC52b2xvb3MuY29tLyJ9.zEEzDAaFdlMSuQIWOG-Du5ejc4v1TMKiRh_A4sjn7ss",
    usStates: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
              "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", 
              "NJ", "NM", "NY", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
               "VA", "WA", "WV", "WI", "WY"],
    WebsiteBanner: process.env.REACT_APP_HEADER
};
