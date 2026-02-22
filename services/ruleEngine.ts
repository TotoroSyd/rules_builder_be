import { Contact, Condition, Rule, Operator } from '../types';
import { contacts } from '../constants/contacts';
import { FIELD_OPERATORS, OPERATORS } from '../constants/constants';
import { planOptions } from '../constants/constants';

export const VALID_OPERATORS = Object.keys(OPERATORS) as Operator[];

// ─── Evaluation ───────────────────────────────────────────────────────────────

function evaluateCondition(contact: Contact, condition: Condition): boolean {
  const { field, operator, value } = condition;
  const fieldValue = contact[field];
  if (fieldValue === undefined) return false;
  return OPERATORS[operator](fieldValue, value);
}

function evaluateRule(contact: Contact, rule: Rule): boolean {
  const { logic = 'AND', conditions } = rule;
  if (!conditions.length) return false;
  return logic.toUpperCase() === 'OR'
    ? conditions.some(c => evaluateCondition(contact, c))
    : conditions.every(c => evaluateCondition(contact, c));
}

export function matchContacts(rule: Rule): Contact[] {
  return contacts.filter(contact => {
    try { return evaluateRule(contact, rule); }
    catch { return false; }
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateRule(body: unknown): string[] {
  const errors: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Rule must be a non-null object'];
  }

  const rule = body as Record<string, unknown>;

  if (rule['logic'] !== undefined) {
    const logic = String(rule['logic']).toUpperCase();
    if (logic !== 'AND' && logic !== 'OR') {
      errors.push('logic must be "AND" or "OR"');
    }
  }

  if (!Array.isArray(rule['conditions']) || (rule['conditions'] as unknown[]).length === 0) {
    errors.push('conditions must be a non-empty array');
  } else {
    (rule['conditions'] as unknown[]).forEach((c, i) => {
      if (!c || typeof c !== 'object') {
        errors.push(`conditions[${i}]: must be an object`);
        return;
      }
      const cond = c as Record<string, unknown>;
      const field = cond['field'] as keyof Contact | undefined;
      const operator = cond['operator'] as Operator | undefined;

      if (!field) {
        errors.push(`conditions[${i}]: field is required`);
      } else if (!Object.keys(contacts[0]).includes(field)) {
        errors.push(`conditions[${i}]: unknown field "${field}"`);
      }

      if (!operator) {
        errors.push(`conditions[${i}]: operator is required`);
      } else if (operator && !VALID_OPERATORS.includes(operator)) {
        errors.push(`conditions[${i}]: unknown operator "${operator}"`);
      }

      if (cond['value'] === undefined) {
        errors.push(`conditions[${i}]: value is required`);
      } else if (field === 'plan' && !planOptions.includes(String(cond['value']).toLowerCase())) {
        errors.push(`conditions[${i}]: invalid value "${cond['value']}" for field "plan". Allowed: ${planOptions.join(', ')}`);
      }

      // Validate operator is valid for the given field
      if (field && operator && VALID_OPERATORS.includes(operator)) {
        const allowed = FIELD_OPERATORS[field];
        if (allowed && !allowed.includes(operator)) {
          errors.push(
            `conditions[${i}]: operator "${operator}" is not valid for field "${field}". ` +
            `Allowed: ${allowed.join(', ')}`,
          );
        }
      }
    });
  }

  return errors;
}
