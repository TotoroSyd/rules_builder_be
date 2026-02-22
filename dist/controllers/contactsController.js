"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsController = void 0;
const ruleEngine_1 = require("../services/ruleEngine");
const responseHandlers_1 = require("../utils/responseHandlers");
class ContactsController {
    async getContacts(req, res) {
        const rule = req.body;
        const errors = (0, ruleEngine_1.validateRule)(rule);
        if (errors.length) {
            (0, responseHandlers_1.ErrorResHandler)(res, 'Invalid rule definition', 400, errors);
            return;
        }
        try {
            const matched = (0, ruleEngine_1.matchContacts)(rule);
            (0, responseHandlers_1.SuccessResHandler)(res, { rule, matched_count: matched.length, contacts: matched }, `Found ${matched.length} matching contact(s)`);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            (0, responseHandlers_1.ErrorResHandler)(res, message, 500);
        }
    }
}
exports.ContactsController = ContactsController;
//# sourceMappingURL=contactsController.js.map