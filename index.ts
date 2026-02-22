import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SavedRule, CreateRuleRequestBody, EvaluateRequestBody, HealthData } from '../types';
import { validateRule, matchContacts } from '../ruleEngine';
import { contacts } from '../contacts';
import { SuccessResHandler, ErrorResHandler } from '../utils/responseHandlers';

const router = Router();

// ══════════════════════════════════════════════════════════════
//  /evaluate
// ══════════════════════════════════════════════════════════════

/**
 * POST /evaluate
 * Evaluate an ad-hoc rule against the contacts dataset.
 */
router.post('/evaluate', (req: Request<{}, {}, EvaluateRequestBody>, res: Response) => {
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
});

// ══════════════════════════════════════════════════════════════
//  /rules
// ══════════════════════════════════════════════════════════════

const rulesStore: SavedRule[] = [];

/**
 * GET /rules
 * List all saved rules.
 */
router.get('/rules', (_req: Request, res: Response) => {
  SuccessResHandler(
    res,
    { count: rulesStore.length, rules: rulesStore },
    'Rules retrieved successfully',
  );
});

/**
 * POST /rules
 * Save a named rule.
 */
router.post('/rules', (req: Request<{}, {}, CreateRuleRequestBody>, res: Response) => {
  const { name, description, rule } = req.body;

  if (!name) {
    ErrorResHandler(res, 'Validation failed', 400, ['name is required']);
    return;
  }

  const errors = validateRule(rule);
  if (errors.length) {
    ErrorResHandler(res, 'Invalid rule definition', 400, errors);
    return;
  }

  const saved: SavedRule = {
    id: uuidv4(),
    name,
    description: description ?? '',
    rule,
    created_at: new Date().toISOString(),
  };

  rulesStore.push(saved);
  SuccessResHandler(res, { saved }, 'Rule saved successfully', 201);
});

/**
 * DELETE /rules/:id
 * Remove a saved rule by UUID.
 */
router.delete('/rules/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const index = rulesStore.findIndex(r => r.id === id);

  if (index === -1) {
    ErrorResHandler(res, `Rule "${id}" not found`, 404);
    return;
  }

  const [deleted] = rulesStore.splice(index, 1);
  SuccessResHandler(res, { deleted }, 'Rule deleted successfully');
});

// ══════════════════════════════════════════════════════════════
//  /health  (no auth — mounted directly on app)
// ══════════════════════════════════════════════════════════════

/**
 * GET /health
 * Returns service health, contacts dataset size, and a sample contact probe.
 */
router.get('/health', (_req: Request, res: Response) => {
  const contactCount = contacts.length;
  const sampleContact = contactCount > 0 ? contacts[0] : null;

  const healthData: HealthData = {
    status: contactCount > 0 && sampleContact !== null ? 'ok' : 'degraded',
    contacts_loaded: contactCount,
    sample_contact: sampleContact,
    timestamp: new Date().toISOString(),
  };

  const httpStatus = healthData.status === 'ok' ? 200 : 503;
  SuccessResHandler(res, healthData, `Service is ${healthData.status}`, httpStatus);
});

export default router;
