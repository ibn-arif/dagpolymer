import { readFileSync } from 'node:fs';
const log = readFileSync(process.argv[2], 'utf8');
const fails = log.split('\n').filter(l => /\bFAIL\b/.test(l) && !/0 FAIL/.test(l));
if (!/1440|desktop/i.test(log)) { console.log('inspector did not run'); process.exit(1); }
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
console.log('inspect zero-fail');
