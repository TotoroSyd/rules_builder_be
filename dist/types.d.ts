export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';
export interface Contact {
    id: string;
    name: string;
    email: string;
    country: string;
    signupDate: string;
    purchaseCount: number;
    plan: Plan;
}
export type EmailOperator = 'email-contains' | 'email-not-contains';
export type CountryOperator = 'country-is' | 'country-is-not';
export type SignupDateOperator = 'date-before' | 'date-after';
export type PurchaseOperator = 'count-equals' | 'count-gt' | 'count-lt';
export type PlanOperator = 'plan-is' | 'plan-is-not';
export type Operator = EmailOperator | CountryOperator | SignupDateOperator | PurchaseOperator | PlanOperator;
export type LogicOperator = 'AND' | 'OR';
export interface Condition {
    field: keyof Contact;
    operator: Operator;
    value: string | number | string[];
}
export interface Rule {
    logic?: LogicOperator;
    conditions: Condition[];
}
export interface SavedRule {
    id: string;
    name: string;
    description?: string;
    rule: Rule;
    created_at: string;
}
export type EvaluateRequestBody = Rule;
export interface CreateRuleRequestBody {
    name: string;
    description?: string;
    rule: Rule;
}
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
export interface HealthData {
    status: 'ok' | 'degraded';
    contacts_loaded: number;
    sample_contact: Contact | null;
    timestamp: string;
}
//# sourceMappingURL=types.d.ts.map