import { Request, Response } from 'express';
import { matchContacts, validateRule } from '../services/ruleEngine';
import { ErrorResHandler, SuccessResHandler } from '../utils/responseHandlers';

export class ContactsController {
    public async getContacts(req: Request, res: Response): Promise<void> {
        const rule = req.body;
        const errors = validateRule(rule);
    
        if (errors.length) {
            ErrorResHandler(res, 'Invalid rule definition', 400, errors);
            return;
        }
    
        try {
            const matched = matchContacts(rule);
            SuccessResHandler(
                res,
                { rule, matched_count: matched.length, contacts: matched },
                `Found ${matched.length} matching contact(s)`,
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            ErrorResHandler(res, message, 500);
        }
        
    }
}