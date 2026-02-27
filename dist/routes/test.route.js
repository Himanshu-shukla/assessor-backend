"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const AssessmentQuestion_1 = require("../models/AssessmentQuestion");
const evaluation_service_1 = require("../services/evaluation.service");
async function default_1(fastify) {
    fastify.get("/test/:id/questions", async (req) => {
        return AssessmentQuestion_1.AssessmentQuestion.find({ assessmentId: req.params.id }).select("_id skill subtopic difficulty text options");
    });
    fastify.post("/test/:id/submit", async (req) => {
        return (0, evaluation_service_1.evaluateTest)(req.params.id, req.body.answers);
    });
}
//# sourceMappingURL=test.route.js.map