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
  'contains':     (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
  'not-contains': (a, b) => !String(a).toLowerCase().includes(String(b).toLowerCase()),

  // Country, Plan
  'is':     (a, b) => String(a).toLowerCase() === String(b).toLowerCase(),
  'is-not': (a, b) => String(a).toLowerCase() !== String(b).toLowerCase(),

  // Signup date (ISO string comparison is lexicographically safe for yyyy-mm-dd)
  'before': (a, b) => new Date(String(a)) < new Date(String(b)),
  'after':  (a, b) => new Date(String(a)) > new Date(String(b)),

  // Purchase count
  'equals': (a, b) => Number(a) === Number(b),
  'greater-than':     (a, b) => Number(a) >  Number(b),
  'less-than':     (a, b) => Number(a) <  Number(b),
};

// ─── Field → allowed operators map (for validation) ───────────────────────────

export const FIELD_OPERATORS: Partial<Record<keyof Contact, Operator[]>> = {
  email:         ['contains', 'not-contains'],
  country:       ['is', 'is-not'],
  signupDate:    ['before', 'after'],
  purchaseCount: ['equals', 'greater-than', 'less-than'],
  plan:          ['is', 'is-not'],
};