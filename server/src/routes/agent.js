import { Router } from 'express';
import { parseCommand, summarizeResult } from '../agent/gemini.js';
import { executePlan } from '../agent/executor.js';

const router = Router();

router.post('/command', async (req, res, next) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string' || !command.trim()) {
      return res.status(400).json({ error: 'command is required and must be a non-empty string' });
    }

    const plan = await parseCommand(command.trim());
    const result = await executePlan(plan);
    const summary = await summarizeResult(plan, result);

    res.json({ plan, result, summary });
  } catch (err) {
    next(err);
  }
});

export default router;
