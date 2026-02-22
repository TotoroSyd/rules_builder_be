import { Condition, Contact, Operator } from "../types";

/**
 * Dummy token for development.
 * Replace with real JWT / OAuth validation in production.
 */
export const VALID_TOKEN = 'dummy-secret-token-2024';
export const planOptions = ['free', 'starter', 'pro', 'enterprise'];

// ─── Operator implementations ─────────────────────────────────────────────────

type FieldValue = Contact[keyof Contact];
type ConditionValue = Condition['value'];
type OperatorFn = (fieldValue: FieldValue, conditionValue: ConditionValue) => boolean;

export const OPERATORS: Record<Operator, OperatorFn> = {
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

// ─── Field → allowed operators map (for validation) ───────────────────────────

export const FIELD_OPERATORS: Partial<Record<keyof Contact, Operator[]>> = {
  email:         ['email-contains', 'email-not-contains'],
  country:       ['country-is', 'country-is-not'],
  signupDate:    ['date-before', 'date-after'],
  purchaseCount: ['count-equals', 'count-gt', 'count-lt'],
  plan:          ['plan-is', 'plan-is-not'],
};