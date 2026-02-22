import { Contact, Condition, Rule, Operator } from './types';
import { contacts } from './contacts';

// ─── Operator implementations ─────────────────────────────────────────────────

type FieldValue = Contact[keyof Contact];
type ConditionValue = Condition['value'];
type OperatorFn = (fieldValue: FieldValue, conditionValue: ConditionValue) => boolean;

const OPERATORS: Record<Operator, OperatorFn> = {
  // Email
  'email-contains':     (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
  'email-not-contains': (a, b) => !String(a).toLowerCase().includes(String(b).toLowerCase()),

  // Country
  'country-is':     (a, b) => String(a).toLowerCase() === String(b).toLowerCase(),
  'country-is-not': (a, b) => String(a).toLowerCase() !== String(b).toLowerCase(),

  // Signup date (ISO string comparison is lexicographically safe for yyyy-mm-dd)
  'date-before': (a, b) => new Date(String(a)) < new Date(String(b)),
  'date-after':  (a, b) => new Date(String(a)) > new Date(String(b)),

  // Purchase count
  'count-equals': (a, b) => Number(a) === Number(b),
  'count-gt':     (a, b) => Number(a) >  Number(b),
  'count-lt':     (a, b) => Number(a) <  Number(b),

  // Plan
  'plan-is':     (a, b) => String(a).toLowerCase() === String(b).toLowerCase(),
  'plan-is-not': (a, b) => String(a).toLowerCase() !== String(b).toLowerCase(),
};

export const VALID_OPERATORS = Object.keys(OPERATORS) as Operator[];

// ─── Field → allowed operators map (for validation) ───────────────────────────

const FIELD_OPERATORS: Partial<Record<keyof Contact, Operator[]>> = {
  email:         ['email-contains', 'email-not-contains'],
  country:       ['country-is', 'country-is-not'],
  signupDate:    ['date-before', 'date-after'],
  purchaseCount: ['count-equals', 'count-gt', 'count-lt'],
  plan:          ['plan-is', 'plan-is-not'],
};

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

      if (!field)                errors.push(`conditions[${i}]: field is required`);
      if (!operator)             errors.push(`conditions[${i}]: operator is required`);
      if (cond['value'] === undefined) errors.push(`conditions[${i}]: value is required`);

      // Validate operator is known
      if (operator && !VALID_OPERATORS.includes(operator)) {
        errors.push(`conditions[${i}]: unknown operator "${operator}"`);
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
