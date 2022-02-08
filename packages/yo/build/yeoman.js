"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yogenerator = exports.yoInput = void 0;
var plugin_1 = require("@fx/plugin");
var zod_1 = require("zod");
exports.yoInput = zod_1.z.object({
    generator: zod_1.z.string().describe("the name of the generator"),
});
function yogenerator() {
    return {
        type: "foo",
        methods: {
            create: (0, plugin_1.method)({
                inputShape: exports.yoInput,
                body: function (_a) {
                    var input = _a.input;
                    return {
                        description: "runs the ".concat(input.generator, " yo generator"),
                        effects: [],
                    };
                },
            }),
        },
    };
}
exports.yogenerator = yogenerator;
//# sourceMappingURL=yeoman.js.map