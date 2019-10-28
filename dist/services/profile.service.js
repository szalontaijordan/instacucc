"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var node_fetch_1 = __importDefault(require("node-fetch"));
var ProfileService = /** @class */ (function () {
    function ProfileService(browser) {
        this.browser = browser;
    }
    ProfileService.prototype.getUserPosts = function (username, $top, $skip) {
        return __awaiter(this, void 0, void 0, function () {
            var page, getGraphQLQueryURL, url, end_cursor, e_1, posts, initialEdges, response, json;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createProfilePage()];
                    case 1:
                        page = _a.sent();
                        getGraphQLQueryURL = new Promise(function (resolve, reject) {
                            page.on('response', function (response) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (this.isGraphURL(response)) {
                                        resolve(response.json());
                                    }
                                    if (response.url().includes('user_id')) {
                                        setTimeout(function () { return reject('There is only one page of this profile'); }, 1000);
                                    }
                                    return [2 /*return*/];
                                });
                            }); });
                        });
                        return [4 /*yield*/, page.goto("https://instagram.com/" + username)];
                    case 2:
                        _a.sent();
                        url = '';
                        end_cursor = '';
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, getGraphQLQueryURL];
                    case 4:
                        url = (_a.sent()).url;
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        posts = [];
                        return [4 /*yield*/, page.evaluate(function () {
                                return window._sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
                            })];
                    case 7:
                        initialEdges = _a.sent();
                        return [4 /*yield*/, page.close()];
                    case 8:
                        _a.sent();
                        posts = __spreadArrays(posts, initialEdges.map(function (edge) { return _this.mapEdgeToPost(edge); }));
                        if (posts.length >= $skip + $top) {
                            return [2 /*return*/, {
                                    posts: posts.slice($skip, $skip + $top)
                                }];
                        }
                        if (!url) return [3 /*break*/, 13];
                        _a.label = 9;
                    case 9: return [4 /*yield*/, node_fetch_1["default"](url)];
                    case 10:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 11:
                        json = _a.sent();
                        posts = __spreadArrays(posts, json.data.user.edge_owner_to_timeline_media.edges.map(function (edge) { return _this.mapEdgeToPost(edge); }));
                        if (json.data.user.edge_owner_to_timeline_media.page_info.has_next_page) {
                            end_cursor = json.data.user.edge_owner_to_timeline_media.page_info.end_cursor;
                            url = url.replace(/%22after%22%3A\w+/, "%22after%22%3A" + end_cursor);
                        }
                        else {
                            return [3 /*break*/, 13];
                        }
                        _a.label = 12;
                    case 12:
                        if (posts.length < $skip + $top) return [3 /*break*/, 9];
                        _a.label = 13;
                    case 13: return [2 /*return*/, {
                            posts: posts.slice($skip, $skip + $top)
                        }];
                }
            });
        });
    };
    ProfileService.prototype.createProfilePage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var page;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        page.setRequestInterception(true);
                        page.on('console', function (x) { return console.log(x.text()); });
                        page.on('request', function (request) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (this.isGraphURL(request)) {
                                    request.respond({
                                        status: 200,
                                        body: JSON.stringify({ url: request.url().replace(/%22first%22%3A[0-9]+/, '%22first%22%3A50') }),
                                        contentType: 'application/json'
                                    });
                                }
                                else {
                                    request["continue"]();
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/, page];
                }
            });
        });
    };
    ProfileService.prototype.mapEdgeToPost = function (edge) {
        var node = edge.node;
        var caption = node.edge_media_to_caption.edges[0].node.text;
        var shortCode = node.shortcode;
        var hashTags = caption.match(/\#\w+/gi);
        return { caption: caption, shortCode: shortCode, hashTags: hashTags };
    };
    ProfileService.prototype.isGraphURL = function (x) {
        return x.url().includes('graph') && !x.url().includes('user_id');
    };
    return ProfileService;
}());
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map