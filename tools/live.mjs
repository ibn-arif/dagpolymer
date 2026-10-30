let s = ''; for await (const c of process.stdin) s += c;
const ok = s.includes('<h1') && s.includes('ДагПолимер') && s.includes('img/mark.svg');
console.log(ok ? 'live ok' : 'live page missing markers'); process.exit(ok ? 0 : 1);
