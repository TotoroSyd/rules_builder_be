"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesController = void 0;
const uuid_1 = require("uuid");
const ruleEngine_1 = require("../services/ruleEngine");
const responseHandlers_1 = require("../utils/responseHandlers");
class RulesController {
    constructor() {
        this.rulesStore = [];
    }
    async createRule(req, res) {
        const { name, description, rule } = req?.body;
        if (!name) {
            (0, responseHandlers_1.ErrorResHandler)(res, 'Validation failed', 400, ['name is required']);
            return;
        }
        const errors = (0, ruleEngine_1.validateRule)(rule);
        if (errors.length) {
            (0, responseHandlers_1.ErrorResHandler)(res, 'Invalid rule definition', 400, errors);
            return;
        }
        try {
            // no errors, save the rule
            const saved = {
                id: (0, uuid_1.v4)(),
                name,
                description: description ?? '',
                rule,
                created_at: new Date().toISOString(),
            };
            this.rulesStore.push(saved);
            (0, responseHandlers_1.SuccessResHandler)(res, { saved }, 'Rule saved successfully', 201);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            (0, responseHandlers_1.ErrorResHandler)(res, message, 500);
        }
    }
    async getRules(req, res) {
        try {
            (0, responseHandlers_1.SuccessResHandler)(res, { count: this.rulesStore.length, rules: this.rulesStore }, 'Rules retrieved successfully');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            (0, responseHandlers_1.ErrorResHandler)(res, message, 500);
        }
    }
    async deleteRule(req, res) {
        const { id } = req?.body;
        if (!id) {
            (0, responseHandlers_1.ErrorResHandler)(res, 'Validation failed', 400, ['id is required']);
            return;
        }
        try {
            const index = this.rulesStore.findIndex(rule => rule.id === id);
            if (index === -1) {
                (0, responseHandlers_1.ErrorResHandler)(res, 'Rule not found', 404);
                return;
            }
            this.rulesStore.splice(index, 1);
            (0, responseHandlers_1.SuccessResHandler)(res, null, `Rule with id ${id} deleted successfully`);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            (0, responseHandlers_1.ErrorResHandler)(res, message, 500);
        }
    }
}
exports.RulesController = RulesController;
//# sourceMappingURL=rulesControlle.js.map