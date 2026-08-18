export const globals= {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://lyon-network.com:8080",
    usStates: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
              "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", 
              "NJ", "NM", "NY", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
               "VA", "WA", "WV", "WI", "WY"],
    WebsiteBanner: process.env.REACT_APP_HEADER
};
