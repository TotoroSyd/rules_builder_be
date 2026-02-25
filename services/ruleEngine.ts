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
  const { logic = 'AND', conditions, groups = [] } = rule;

  const results: boolean[] = [
    ...conditions.map(c => evaluateCondition(contact, c)),
    ...groups.map(g => evaluateRule(contact, g)),
  ];

  if (!results.length) return false;

  return logic.toUpperCase() === 'OR'
    ? results.some(Boolean)
    : results.every(Boolean);
}

export function matchContacts(rule: Rule): Contact[] {
  return contacts.filter(contact => {
    try { return evaluateRule(contact, rule); }
    catch (e) {
      console.error(`[matchContacts] error evaluating contact ${contact.id}:`, e);
      return false;
    }
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateCondition(c: unknown, path: string, errors: string[]): void {
  if (!c || typeof c !== 'object') {
    errors.push(`${path}: must be an object`);
    return;
  }
  const cond = c as Record<string, unknown>;
  const field = cond['field'] as keyof Contact | undefined;
  const operator = cond['operator'] as Operator | undefined;

  if (!field) {
    errors.push(`${path}: field is required`);
  } else if (!Object.keys(contacts[0]).includes(field)) {
    errors.push(`${path}: unknown field "${field}"`);
  }

  if (!operator) {
    errors.push(`${path}: operator is required`);
  } else if (!VALID_OPERATORS.includes(operator)) {
    errors.push(`${path}: unknown operator "${operator}"`);
  }

  if (cond['value'] === undefined) {
    errors.push(`${path}: value is required`);
  } else if (field === 'plan' && !planOptions.includes(String(cond['value']).toLowerCase())) {
    errors.push(`${path}: invalid value "${cond['value']}" for field "plan". Allowed: ${planOptions.join(', ')}`);
  }

  if (field && operator && VALID_OPERATORS.includes(operator)) {
    const allowed = FIELD_OPERATORS[field];
    if (allowed && !allowed.includes(operator)) {
      errors.push(
        `${path}: operator "${operator}" is not valid for field "${field}". ` +
        `Allowed: ${allowed.join(', ')}`,
      );
    }
  }
}

function validateGroup(group: unknown, path: string, errors: string[]): void {
  if (!group || typeof group !== 'object' || Array.isArray(group)) {
    errors.push(`${path}: must be a non-null object`);
    return;
  }
  const g = group as Record<string, unknown>;

  if (g['logic'] !== undefined) {
    const logic = String(g['logic']).toUpperCase();
    if (logic !== 'AND' && logic !== 'OR') {
      errors.push(`${path}.logic: must be "AND" or "OR"`);
    }
  }

  const hasConditions = Array.isArray(g['conditions']) && (g['conditions'] as unknown[]).length > 0;
  const hasGroups = Array.isArray(g['groups']) && (g['groups'] as unknown[]).length > 0;

  if (!hasConditions && !hasGroups) {
    errors.push(`${path}: must have at least one condition or nested group`);
    return;
  }

  if (Array.isArray(g['conditions'])) {
    (g['conditions'] as unknown[]).forEach((c, i) =>
      validateCondition(c, `${path}.conditions[${i}]`, errors),
    );
  }

  if (Array.isArray(g['groups'])) {
    (g['groups'] as unknown[]).forEach((sub, i) =>
      validateGroup(sub, `${path}.groups[${i}]`, errors),
    );
  }
}

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

  const hasConditions = Array.isArray(rule['conditions']) && (rule['conditions'] as unknown[]).length > 0;
  const hasGroups = Array.isArray(rule['groups']) && (rule['groups'] as unknown[]).length > 0;

  if (!Array.isArray(rule['conditions'])) {
    errors.push('conditions must be an array');
  } else if (!hasConditions && !hasGroups) {
    errors.push('conditions must be a non-empty array');
  } else if (hasConditions) {
    (rule['conditions'] as unknown[]).forEach((c, i) =>
      validateCondition(c, `conditions[${i}]`, errors),
    );
  }

  if (hasGroups) {
    (rule['groups'] as unknown[]).forEach((g, i) =>
      validateGroup(g, `groups[${i}]`, errors),
    );
  }

  return errors;
}
