import { Condition, Contact, Operator } from "../types";
/**
 * Dummy token for development.
 * Replace with real JWT / OAuth validation in production.
 */
export declare const VALID_TOKEN = "dummy-secret-token-2024";
export declare const planOptions: string[];
type FieldValue = Contact[keyof Contact];
type ConditionValue = Condition['value'];
type OperatorFn = (fieldValue: FieldValue, conditionValue: ConditionValue) => boolean;
export declare const OPERATORS: Record<Operator, OperatorFn>;
export declare const FIELD_OPERATORS: Partial<Record<keyof Contact, Operator[]>>;
export {};
//# sourceMappingURL=constants.d.ts.map