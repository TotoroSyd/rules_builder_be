// ─── Contact ──────────────────────────────────────────────────────────────────

export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Contact {
  id: string;
  name: string;
  email: string;
  country: string;
  signupDate: string;   // ISO 8601 date string e.g. "2023-06-15"
  purchaseCount: number;
  plan: Plan;
}

// ─── Operators (field-specific) ───────────────────────────────────────────────

export type EmailOperator       = 'email-contains' | 'email-not-contains';
export type CountryOperator     = 'country-is' | 'country-is-not';
export type SignupDateOperator  = 'date-before' | 'date-after';
export type PurchaseOperator    = 'count-equals' | 'count-gt' | 'count-lt';
export type PlanOperator        = 'plan-is' | 'plan-is-not';

export type Operator =
  | EmailOperator
  | CountryOperator
  | SignupDateOperator
  | PurchaseOperator
  | PlanOperator;

export type LogicOperator = 'AND' | 'OR';

// ─── Rule condition ───────────────────────────────────────────────────────────

export interface Condition {
  field: keyof Contact;
  operator: Operator;
  value: string | number | string[];
}

export interface Rule {
  logic?: LogicOperator;
  conditions: Condition[];
}

// ─── Saved rule ───────────────────────────────────────────────────────────────

export interface SavedRule {
  id: string;
  name: string;
  description?: string;
  rule: Rule;
  created_at: string;
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export type EvaluateRequestBody = Rule;

export interface CreateRuleRequestBody {
  name: string;
  description?: string;
  rule: Rule;
}

// ─── Response util types ──────────────────────────────────────────────────────
// T is a generic type as a placeholder, it can be replaced with any specific type depending on the context
// unknown is a default incase no specific type is declared
export interface ApiSuccessPayload<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorPayload {
  success: false;
  error: string;
  details?: string[];
}

// ─── Health check ─────────────────────────────────────────────────────────────

export interface HealthData {
  status: 'ok' | 'degraded';
  contacts_loaded: number;
  sample_contact: Contact | null;
  timestamp: string;
}
