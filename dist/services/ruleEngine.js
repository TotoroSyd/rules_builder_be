"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_OPERATORS = void 0;
exports.matchContacts = matchContacts;
exports.validateRule = validateRule;
const contacts_1 = require("../constants/contacts");
const constants_1 = require("../constants/constants");
const constants_2 = require("../constants/constants");
exports.VALID_OPERATORS = Object.keys(constants_1.OPERATORS);
// ─── Evaluation ───────────────────────────────────────────────────────────────
function evaluateCondition(contact, condition) {
    const { field, operator, value } = condition;
    const fieldValue = contact[field];
    if (fieldValue === undefined)
        return false;
    return constants_1.OPERATORS[operator](fieldValue, value);
}
function evaluateRule(contact, rule) {
    const { logic = 'AND', conditions } = rule;
    if (!conditions.length)
        return false;
    return logic.toUpperCase() === 'OR'
        ? conditions.some(c => evaluateCondition(contact, c))
        : conditions.every(c => evaluateCondition(contact, c));
}
function matchContacts(rule) {
    return contacts_1.contacts.filter(contact => {
        try {
            return evaluateRule(contact, rule);
        }
        catch {
            return false;
        }
    });
}
// ─── Validation ───────────────────────────────────────────────────────────────
function validateRule(body) {
    const errors = [];
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return ['Rule must be a non-null object'];
    }
    const rule = body;
    if (rule['logic'] !== undefined) {
        const logic = String(rule['logic']).toUpperCase();
        if (logic !== 'AND' && logic !== 'OR') {
            errors.push('logic must be "AND" or "OR"');
        }
    }
    if (!Array.isArray(rule['conditions']) || rule['conditions'].length === 0) {
        errors.push('conditions must be a non-empty array');
    }
    else {
        rule['conditions'].forEach((c, i) => {
            if (!c || typeof c !== 'object') {
                errors.push(`conditions[${i}]: must be an object`);
                return;
            }
            const cond = c;
            const field = cond['field'];
            const operator = cond['operator'];
            if (!field) {
                errors.push(`conditions[${i}]: field is required`);
            }
            else if (!Object.keys(contacts_1.contacts[0]).includes(field)) {
                errors.push(`conditions[${i}]: unknown field "${field}"`);
            }
            if (!operator) {
                errors.push(`conditions[${i}]: operator is required`);
            }
            else if (operator && !exports.VALID_OPERATORS.includes(operator)) {
                errors.push(`conditions[${i}]: unknown operator "${operator}"`);
            }
            if (cond['value'] === undefined) {
                errors.push(`conditions[${i}]: value is required`);
            }
            else if (field === 'plan' && !constants_2.planOptions.includes(String(cond['value']).toLowerCase())) {
                errors.push(`conditions[${i}]: invalid value "${cond['value']}" for field "plan". Allowed: ${constants_2.planOptions.join(', ')}`);
            }
            // Validate operator is valid for the given field
            if (field && operator && exports.VALID_OPERATORS.includes(operator)) {
                const allowed = constants_1.FIELD_OPERATORS[field];
                if (allowed && !allowed.includes(operator)) {
                    errors.push(`conditions[${i}]: operator "${operator}" is not valid for field "${field}". ` +
                        `Allowed: ${allowed.join(', ')}`);
                }
            }
        });
    }
    return errors;
}
//# sourceMappingURL=ruleEngine.js.map