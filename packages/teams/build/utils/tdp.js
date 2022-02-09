"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppStudioEndpoint = void 0;
var axios_1 = __importDefault(require("axios"));
function getAppStudioEndpoint() {
    if (process.env.APP_STUDIO_ENV && process.env.APP_STUDIO_ENV === "int") {
        return "https://dev-int.teams.microsoft.com";
    }
    else {
        return "https://dev.teams.microsoft.com";
    }
}
exports.getAppStudioEndpoint = getAppStudioEndpoint;
var baseUrl = getAppStudioEndpoint();
/**
 * Creates a new axios instance to call app studio to prevent setting the accessToken on global instance.
 * @param {string}  appStudioToken
 * @returns {AxiosInstance}
 */
function createRequesterWithToken(appStudioToken) {
    var instance = axios_1.default.create({
        baseURL: baseUrl,
    });
    instance.defaults.headers.common["Authorization"] = "Bearer ".concat(appStudioToken);
    instance.defaults.headers.common["Client-Source"] = "teamstoolkit";
    instance.interceptors.request.use(function (config) {
        config.params = __assign({ teamstoolkit: true }, config.params);
        return config;
    });
    return instance;
}
//# sourceMappingURL=tdp.js.map