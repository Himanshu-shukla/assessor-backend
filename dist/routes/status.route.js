"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const Assessment_1 = require("../models/Assessment");
async function default_1(fastify) {
    fastify.get("/status/:id", async (req, reply) => {
        const { id } = req.params;
        const assessment = await Assessment_1.Assessment.findById(id);
        if (!assessment) {
            return reply.code(404).send({ error: "Assessment not found" });
        }
        return {
            status: assessment.status,
            ready: assessment.status === "ready",
        };
    });
}
//# sourceMappingURL=status.route.js.map