import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { validateRule } from "../services/ruleEngine";
import { SavedRule } from "../types";
import { SuccessResHandler, ErrorResHandler } from "../utils/responseHandlers";

export class RulesController {
    private rulesStore: SavedRule[] = [];
    
    public async createRule(req: Request, res: Response): Promise<void> {
        const { name, description, rule } = req?.body;
        
        if (!name) {
            ErrorResHandler(res, 'Validation failed', 400, ['name is required']);
            return;
        }
        
        const errors = validateRule(rule);
        if (errors.length) {
            ErrorResHandler(res, 'Invalid rule definition', 400, errors);
            return;
        }

        try {
            // no errors, save the rule
            const saved: SavedRule = {
                id: uuidv4(),
                name,
                description: description ?? '',
                rule,
                created_at: new Date().toISOString(),
            };
            
            this.rulesStore.push(saved);
            SuccessResHandler(res, { saved }, 'Rule saved successfully', 201);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            ErrorResHandler(res, message, 500);
        }
    }

    public async getRules(req: Request, res: Response): Promise<void> {
        try {
            SuccessResHandler(res, { count: this.rulesStore.length, rules: this.rulesStore }, 'Rules retrieved successfully');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            ErrorResHandler(res, message, 500);
        }
    }

    public async deleteRule(req: Request, res: Response): Promise<void> {
        const { id } = req?.body;
        if (!id) {
            ErrorResHandler(res, 'Validation failed', 400, ['id is required']);
            return;
        }
        
        try {
            const index = this.rulesStore.findIndex(rule => rule.id === id);
            if (index === -1) {
                ErrorResHandler(res, 'Rule not found', 404);
                return;
            }
            this.rulesStore.splice(index, 1);
            SuccessResHandler(res, null, `Rule with id ${id} deleted successfully`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            ErrorResHandler(res, message, 500);
        }
    }
}

