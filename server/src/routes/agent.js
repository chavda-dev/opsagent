import { Router } from 'express';
import { parseCommand, summarizeResults } from '../agent/gemini.js';
import { executePlan } from '../agent/executor.js';

const router = Router();

router.post('/command', async (req, res, next) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'command is required' });
    }

    const plan = await parseCommand(command);
    const results = await executePlan(plan);
    const summary = await summarizeResults(plan, results);

    res.json({ plan, results, summary });
  } catch (err) {
    next(err);
  }
});

export default router;
