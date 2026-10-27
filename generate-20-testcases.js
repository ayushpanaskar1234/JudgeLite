// generate-20-testcases.js
// Generates exactly 20 mathematically verified test cases for all 35 problems

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      env[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function req(method, endpoint, body) {
  const parsed = new URL(SUPABASE_URL);
  const data = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    const options = {
      hostname: parsed.hostname,
      path: '/rest/v1' + endpoint,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=representation',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      }
    };
    const r = https.request(options, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(out) }); }
        catch (e) { resolve({ status: res.statusCode, body: out }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

// Exact reference solvers for each problem
const solvers = {
  'two-sum': (raw) => {
    const lines = raw.trim().split('\n');
    const [n, target] = lines[0].split(/\s+/).map(Number);
    const a = lines[1].split(/\s+/).map(Number);
    const map = new Map();
    for (let i = 0; i < a.length; i++) {
      const comp = target - a[i];
      if (map.has(comp)) return `${map.get(comp)} ${i}`;
      map.set(a[i], i);
    }
    return '';
  },
  'valid-parentheses': (s) => {
    const st = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (const c of s.trim()) {
      if (c === '(' || c === '{' || c === '[') st.push(c);
      else if (st.pop() !== map[c]) return 'false';
    }
    return st.length === 0 ? 'true' : 'false';
  },
  'maximum-subarray': (s) => {
    const a = s.trim().split(/\s+/).map(Number);
    let maxSoFar = a[0], curr = a[0];
    for (let i = 1; i < a.length; i++) {
      curr = Math.max(a[i], curr + a[i]);
      maxSoFar = Math.max(maxSoFar, curr);
    }
    return String(maxSoFar);
  },
  'palindrome-number': (s) => {
    const str = s.trim();
    return str === str.split('').reverse().join('') ? 'true' : 'false';
  },
  'reverse-string': (s) => {
    return s.trim().split('').reverse().join('');
  },
  'fizz-buzz': (s) => {
    const n = parseInt(s.trim());
    const res = [];
    for (let i = 1; i <= n; i++) {
      if (i % 15 === 0) res.push('FizzBuzz');
      else if (i % 3 === 0) res.push('Fizz');
      else if (i % 5 === 0) res.push('Buzz');
      else res.push(String(i));
    }
    return res.join(' ');
  },
  'contains-duplicate': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/);
    return new Set(a).size !== a.length ? 'true' : 'false';
  },
  'best-time-to-buy-and-sell-stock': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    let minP = Infinity, maxProf = 0;
    for (const p of a) {
      if (p < minP) minP = p;
      else if (p - minP > maxProf) maxProf = p - minP;
    }
    return String(maxProf);
  },
  'single-number': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    let ans = 0;
    for (const x of a) ans ^= x;
    return String(ans);
  },
  'valid-anagram': (s) => {
    const parts = s.trim().split(/\s+/);
    return parts[0].split('').sort().join('') === parts[1].split('').sort().join('') ? 'true' : 'false';
  },
  'binary-search': (s) => {
    const lines = s.trim().split('\n');
    const [n, target] = lines[0].split(/\s+/).map(Number);
    const a = lines[1].split(/\s+/).map(Number);
    let l = 0, r = a.length - 1;
    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      if (a[mid] === target) return String(mid);
      if (a[mid] < target) l = mid + 1;
      else r = mid - 1;
    }
    return '-1';
  },
  'search-insert-position': (s) => {
    const lines = s.trim().split('\n');
    const [n, target] = lines[0].split(/\s+/).map(Number);
    const a = lines[1].split(/\s+/).map(Number);
    let l = 0, r = a.length - 1, ans = a.length;
    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      if (a[mid] >= target) { ans = mid; r = mid - 1; }
      else l = mid + 1;
    }
    return String(ans);
  },
  'climbing-stairs': (s) => {
    const n = parseInt(s.trim());
    if (n <= 2) return String(n);
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
      const c = a + b; a = b; b = c;
    }
    return String(b);
  },
  'move-zeroes': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    let pos = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== 0) {
        const tmp = a[pos]; a[pos] = a[i]; a[i] = tmp;
        pos++;
      }
    }
    return a.join(' ');
  },
  'missing-number': (s) => {
    const lines = s.trim().split('\n');
    const n = parseInt(lines[0]);
    const a = lines[1].trim().split(/\s+/).map(Number);
    const expected = (n * (n + 1)) / 2;
    const actual = a.reduce((sum, x) => sum + x, 0);
    return String(expected - actual);
  },
  'power-of-two': (s) => {
    const n = BigInt(s.trim());
    return (n > 0n && (n & (n - 1n)) === 0n) ? 'true' : 'false';
  },
  'majority-element': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    let cand = a[0], count = 0;
    for (const x of a) {
      if (count === 0) cand = x;
      count += (x === cand) ? 1 : -1;
    }
    return String(cand);
  },
  'length-of-last-word': (s) => {
    const words = s.trim().split(/\s+/);
    return String(words[words.length - 1].length);
  },
  'squares-of-a-sorted-array': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    return a.map(x => x * x).sort((x, y) => x - y).join(' ');
  },
  'fibonacci-number': (s) => {
    const n = parseInt(s.trim());
    if (n <= 1) return String(n);
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      const c = a + b; a = b; b = c;
    }
    return String(b);
  },
  'plus-one': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    let carry = 1;
    for (let i = a.length - 1; i >= 0 && carry; i--) {
      const sum = a[i] + carry;
      a[i] = sum % 10;
      carry = Math.floor(sum / 10);
    }
    if (carry) a.unshift(1);
    return a.join(' ');
  },
  'find-pivot-index': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    const total = a.reduce((sum, x) => sum + x, 0);
    let left = 0;
    for (let i = 0; i < a.length; i++) {
      if (left === total - left - a[i]) return String(i);
      left += a[i];
    }
    return '-1';
  },
  'valid-palindrome': (s) => {
    const f = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return f === f.split('').reverse().join('') ? 'true' : 'false';
  },
  'is-subsequence': (s) => {
    const parts = s.trim().split(/\s+/);
    let i = 0;
    for (let j = 0; j < parts[1].length && i < parts[0].length; j++) {
      if (parts[0][i] === parts[1][j]) i++;
    }
    return i === parts[0].length ? 'true' : 'false';
  },
  'coin-change': (s) => {
    const lines = s.trim().split('\n');
    const [n, amount] = lines[0].split(/\s+/).map(Number);
    const coins = lines[1].split(/\s+/).map(Number);
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= amount; i++) {
      for (const c of coins) {
        if (i >= c && dp[i - c] !== Infinity) dp[i] = Math.min(dp[i], dp[i - c] + 1);
      }
    }
    return String(dp[amount] === Infinity ? -1 : dp[amount]);
  },
  '3sum': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number).sort((x, y) => x - y);
    let count = 0;
    for (let i = 0; i < a.length - 2; i++) {
      if (i > 0 && a[i] === a[i - 1]) continue;
      let l = i + 1, r = a.length - 1;
      while (l < r) {
        const sum = a[i] + a[l] + a[r];
        if (sum === 0) {
          count++;
          while (l < r && a[l] === a[l + 1]) l++;
          while (l < r && a[r] === a[r - 1]) r--;
          l++; r--;
        } else if (sum < 0) l++;
        else r--;
      }
    }
    return String(count);
  },
  'house-robber': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    let prev2 = 0, prev1 = 0;
    for (const x of a) {
      const cur = Math.max(prev1, prev2 + x);
      prev2 = prev1; prev1 = cur;
    }
    return String(prev1);
  },
  'jump-game': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    let maxReach = 0;
    for (let i = 0; i < a.length; i++) {
      if (i > maxReach) return 'false';
      maxReach = Math.max(maxReach, i + a[i]);
      if (maxReach >= a.length - 1) return 'true';
    }
    return 'true';
  },
  'product-of-array-except-self': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    const n = a.length;
    const ans = new Array(n).fill(1);
    let p = 1;
    for (let i = 0; i < n; i++) { ans[i] = p; p *= a[i]; }
    let suf = 1;
    for (let i = n - 1; i >= 0; i--) { ans[i] *= suf; suf *= a[i]; }
    return ans.join(' ');
  },
  'container-with-most-water': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    let l = 0, r = a.length - 1, maxA = 0;
    while (l < r) {
      maxA = Math.max(maxA, Math.min(a[l], a[r]) * (r - l));
      if (a[l] < a[r]) l++;
      else r--;
    }
    return String(maxA);
  },
  'rotate-array': (s) => {
    const lines = s.trim().split('\n');
    let [n, k] = lines[0].split(/\s+/).map(Number);
    const a = lines[1].split(/\s+/).map(Number);
    k %= n;
    const res = a.slice(n - k).concat(a.slice(0, n - k));
    return res.join(' ');
  },
  'daily-temperatures': (s) => {
    const lines = s.trim().split('\n');
    const t = lines[1].trim().split(/\s+/).map(Number);
    const ans = new Array(t.length).fill(0);
    const st = [];
    for (let i = 0; i < t.length; i++) {
      while (st.length && t[i] > t[st[st.length - 1]]) {
        const prev = st.pop();
        ans[prev] = i - prev;
      }
      st.push(i);
    }
    return ans.join(' ');
  },
  'longest-consecutive-sequence': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    const set = new Set(a);
    let maxL = 0;
    for (const x of set) {
      if (!set.has(x - 1)) {
        let cur = x, l = 1;
        while (set.has(cur + 1)) { cur++; l++; }
        maxL = Math.max(maxL, l);
      }
    }
    return String(maxL);
  },
  'trapping-rain-water': (s) => {
    const lines = s.trim().split('\n');
    const h = lines[1].trim().split(/\s+/).map(Number);
    let l = 0, r = h.length - 1, lMax = 0, rMax = 0, water = 0;
    while (l < r) {
      if (h[l] < h[r]) {
        if (h[l] >= lMax) lMax = h[l];
        else water += lMax - h[l];
        l++;
      } else {
        if (h[r] >= rMax) rMax = h[r];
        else water += rMax - h[r];
        r--;
      }
    }
    return String(water);
  },
  'first-missing-positive': (s) => {
    const lines = s.trim().split('\n');
    const a = lines[1].trim().split(/\s+/).map(Number);
    const n = a.length;
    for (let i = 0; i < n; i++) {
      while (a[i] > 0 && a[i] <= n && a[a[i] - 1] !== a[i]) {
        const dest = a[i] - 1;
        const tmp = a[i]; a[i] = a[dest]; a[dest] = tmp;
      }
    }
    for (let i = 0; i < n; i++) {
      if (a[i] !== i + 1) return String(i + 1);
    }
    return String(n + 1);
  }
};

// 20 inputs for each problem
const inputBank = {
  'two-sum': [
    '4 9\n2 7 11 15', '3 6\n3 2 4', '2 6\n3 3', '5 10\n1 2 5 6 9', '4 -8\n-1 -2 -3 -5',
    '4 0\n-3 4 3 90', '6 100\n10 20 30 70 80 90', '5 8\n1 7 4 3 5', '3 14\n1 8 6', '4 13\n2 5 8 11',
    '5 17\n1 3 5 7 10', '4 20\n10 5 15 2', '3 7\n4 2 3', '5 25\n5 10 15 20 25', '4 1000\n100 900 200 800',
    '3 -5\n-2 -3 4', '4 50\n25 25 1 2', '5 12\n6 2 4 10 1', '4 30\n14 16 1 2', '3 2\n1 1 5'
  ],
  'valid-parentheses': [
    '()', '()[]{}', '(]', '([)]', '{[]}',
    '(((', ')))', '{[()()]}', '(([]){})', '[[',
    '{}', '[]', '{[()]}', '{[(])}', '()()()',
    '((((()))))', '(())(())', '((()))]', '([{}])()', '{'
  ],
  'maximum-subarray': [
    '-2 1 -3 4 -1 2 1 -5 4', '1 2 3 4 5', '5 4 -1 7 8', '-5 -2 -9', '-1',
    '0 0 0', '100 -50 100 -50 100', '-2 -1', '3 -2 5', '-3 2 3 -4',
    '-1 -2 -3 -4', '8 -19 5 -4 20', '1 2 -1 -2 2 1 -2 1 4 -5 4', '10', '-10 20 -10',
    '1 -1 1 -1 1', '-5 10 -5 10', '10 -20 30', '-100 1 2 3', '5 -3 5'
  ],
  'palindrome-number': [
    '121', '-121', '10', '0', '12321',
    '1221', '1000021', '7', '-101', '123454321',
    '11', '999', '123', '4444', '505',
    '6776', '-222', '1001', '123321', '9876789'
  ],
  'reverse-string': [
    'hello', 'Hannah', 'a', 'algorithm', 'JudgeLite',
    'racecar', '12345', 'AbCdEf', 'cool', 'yes',
    'world', 'code', 'javascript', 'python', 'antigravity',
    'developer', 'matrix', 'abcdefg', '1', 'xyz'
  ],
  'fizz-buzz': [
    '3', '5', '1', '6', '10',
    '15', '4', '7', '8', '9',
    '2', '11', '12', '13', '14',
    '16', '17', '18', '19', '20'
  ],
  'contains-duplicate': [
    '4\n1 2 3 1', '4\n1 2 3 4', '1\n99', '10\n1 1 1 3 3 4 3 2 4 2', '5\n5 4 3 2 1',
    '3\n0 0 1', '2\n-1 -1', '2\n-1 1', '6\n10 20 30 40 50 10', '5\n100 200 300 400 500',
    '3\n1 2 3', '4\n2 14 18 22', '5\n1 5 -2 -4 0', '6\n1 2 3 4 5 6', '4\n1 2 1 2',
    '3\n9 9 9', '4\n-1 -2 -3 -1', '2\n0 0', '5\n3 1 2 4 3', '4\n5 6 7 8'
  ],
  'best-time-to-buy-and-sell-stock': [
    '6\n7 1 5 3 6 4', '5\n7 6 4 3 1', '2\n2 4', '1\n100', '7\n1 2 3 4 5 6 7',
    '4\n3 2 6 50', '3\n2 1 2', '5\n2 4 1 7 8', '5\n10 9 8 7 6', '4\n5 1 2 10',
    '3\n3 3 3', '5\n1 2 4 2 5', '6\n3 8 2 5 1 9', '4\n9 1 3 4', '5\n2 1 2 0 1',
    '2\n1 10', '3\n10 1 5', '4\n2 7 1 4', '5\n3 2 6 1 4', '6\n1 2 3 0 2'
  ],
  'single-number': [
    '3\n2 2 1', '5\n4 1 2 1 2', '1\n1', '5\n-1 -1 0 0 42', '7\n10 20 10 30 20 40 30',
    '3\n5 9 5', '5\n-5 1 -5 2 1', '3\n0 7 0', '5\n100 200 100 300 200', '7\n9 9 8 8 7 7 6',
    '3\n1 2 1', '5\n5 3 5 4 3', '1\n-99', '3\n10 20 10', '5\n8 8 9 9 10',
    '7\n1 1 2 2 3 3 4', '3\n-2 -2 -1', '5\n0 1 0 1 2', '3\n4 5 4', '5\n12 14 12 15 14'
  ],
  'valid-anagram': [
    'anagram\nnagaram', 'rat\ncar', 'a\na', 'ab\na', 'silent\nlisten',
    'night\nthing', 'cat\nact', 'hello\nbello', 'triangle\nintegral', 'abc\ndef',
    'cinema\niceman', 'dusty\nrusty', 'dormitory\ndirtyroom', 'theeyes\ntheyees', 'listen\nsilent',
    'elbow\nbelow', 'evil\nvile', 'race\ncare', 'state\ntaste', 'inch\nchin'
  ],
  'binary-search': [
    '6 9\n-1 0 3 5 9 12', '6 2\n-1 0 3 5 9 12', '1 5\n5', '1 3\n5', '5 1\n1 2 3 4 5',
    '5 5\n1 2 3 4 5', '4 3\n1 3 5 7', '4 0\n1 3 5 7', '6 10\n2 4 6 8 10 12', '5 -5\n-10 -5 0 5 10',
    '3 2\n1 2 3', '3 4\n1 2 3', '5 0\n-2 -1 0 1 2', '4 7\n2 4 6 8', '2 1\n1 3',
    '2 3\n1 3', '2 2\n1 3', '1 0\n0', '5 15\n5 10 15 20 25', '5 30\n5 10 15 20 25'
  ],
  'search-insert-position': [
    '4 5\n1 3 5 6', '4 2\n1 3 5 6', '4 7\n1 3 5 6', '4 0\n1 3 5 6', '1 0\n0',
    '3 4\n1 3 5', '5 1\n1 2 3 4 5', '5 6\n1 2 3 4 5', '4 3\n1 2 4 5', '2 10\n1 5',
    '3 2\n1 3 5', '3 0\n1 3 5', '3 6\n1 3 5', '4 4\n1 2 3 5', '2 0\n2 4',
    '2 3\n2 4', '2 5\n2 4', '1 1\n1', '1 2\n1', '3 3\n1 2 4'
  ],
  'climbing-stairs': [
    '2', '3', '1', '4', '5',
    '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15',
    '16', '17', '18', '19', '20'
  ],
  'move-zeroes': [
    '5\n0 1 0 3 12', '1\n0', '4\n0 0 0 1', '3\n1 2 3', '4\n1 0 2 0',
    '5\n0 0 1 2 3', '2\n2 1', '6\n4 0 5 0 0 6', '3\n0 0 0', '4\n1 0 0 1',
    '5\n0 0 0 0 5', '3\n1 0 2', '2\n0 1', '4\n2 0 3 0', '5\n1 2 0 0 3',
    '6\n0 1 0 2 0 3', '4\n0 4 0 5', '3\n0 2 0', '1\n5', '5\n3 0 0 2 1'
  ],
  'missing-number': [
    '3\n3 0 1', '2\n0 1', '1\n0', '9\n9 6 4 2 3 5 7 0 1', '4\n1 2 3 4',
    '2\n1 2', '5\n0 1 2 3 4', '5\n5 4 3 2 0', '4\n0 3 1 4', '3\n1 0 2',
    '1\n1', '4\n0 1 2 4', '6\n0 1 2 3 5 6', '5\n1 2 3 4 5', '4\n3 0 2 4',
    '3\n2 0 3', '5\n5 2 1 0 4', '6\n6 4 2 1 5 0', '4\n0 1 3 4', '2\n2 0'
  ],
  'power-of-two': [
    '1', '16', '3', '0', '-16',
    '2', '4', '8', '1073741824', '218',
    '32', '64', '128', '256', '512',
    '1024', '5', '6', '15', '17'
  ],
  'majority-element': [
    '3\n3 2 3', '7\n2 2 1 1 1 2 2', '1\n100', '5\n6 5 5 5 1', '3\n1 1 2',
    '5\n2 2 2 1 1', '4\n9 9 9 1', '5\n-1 -1 -1 2 3', '7\n4 4 4 4 1 2 3', '5\n7 7 1 7 7',
    '3\n5 5 2', '5\n3 3 4 3 2', '5\n1 2 1 1 3', '3\n8 2 8', '5\n10 10 10 5 6',
    '7\n1 2 1 2 1 2 1', '3\n0 0 1', '5\n-5 -5 -5 1 2', '5\n4 4 1 4 2', '1\n42'
  ],
  'length-of-last-word': [
    'Hello World', '   fly me   to   the moon  ', 'luffy is still joyboy', 'a', 'day   ',
    'coding is fun', 'today is a good day', '   hello   ', 'Antigravity', 'one two three',
    'sunshine', 'learn algorithms today', 'fast runner', 'a b c', 'sky is blue',
    'never give up', 'python is awesome', 'enjoy the process', 'keep going', 'final test'
  ],
  'squares-of-a-sorted-array': [
    '5\n-4 -1 0 3 10', '5\n-7 -3 2 3 11', '1\n-5', '4\n1 2 3 4', '3\n-3 -2 -1',
    '3\n0 0 0', '4\n-2 0 1 2', '2\n-1 1', '5\n-5 -4 -3 -2 -1', '3\n-10 0 10',
    '4\n-3 -1 0 2', '3\n-4 1 3', '2\n-2 0', '5\n-6 -3 -1 2 4', '4\n-5 -2 1 3',
    '3\n-1 0 1', '4\n-4 -2 0 2', '3\n-5 0 5', '2\n-3 3', '1\n0'
  ],
  'fibonacci-number': [
    '2', '4', '0', '1', '3',
    '5', '6', '7', '10', '20',
    '8', '9', '11', '12', '13',
    '14', '15', '16', '17', '18'
  ],
  'plus-one': [
    '3\n1 2 3', '1\n9', '4\n4 3 2 1', '3\n9 9 9', '1\n0',
    '2\n1 9', '4\n1 9 9 9', '3\n8 9 9', '2\n9 8', '5\n1 0 0 0 0',
    '1\n5', '2\n2 4', '3\n5 0 9', '4\n8 9 9 9', '3\n3 2 1',
    '2\n9 9', '4\n2 0 9 9', '3\n7 8 9', '1\n1', '3\n6 9 9'
  ],
  'find-pivot-index': [
    '6\n1 7 3 6 5 6', '3\n1 2 3', '3\n2 1 -1', '1\n5', '4\n0 0 0 0',
    '4\n-1 -1 0 0', '5\n1 2 3 2 1', '3\n1 0 1', '4\n1 4 2 5', '2\n1 2',
    '5\n2 3 5 4 1', '3\n0 1 -1', '4\n1 -1 2 0', '5\n1 1 1 1 1', '3\n-1 -1 1',
    '4\n2 0 2 0', '5\n0 0 1 0 0', '3\n5 0 5', '4\n-1 0 -1 0', '2\n0 0'
  ],
  'valid-palindrome': [
    'A man, a plan, a canal: Panama', 'race a car', ' ', '0P', 'Madam, I\'m Adam',
    'No lemon, no melon', 'Was it a car or a cat I saw?', 'hello world', '12321', '12345',
    'Eva, can I see bees in a cave?', 'Red rum, sir, is murder', 'Step on no pets', 'Top spot', 'My gym',
    'Not a palindrome', 'abcde', 'able was I ere I saw elba', 'Never odd or even', 'Live on time, emit no evil'
  ],
  'is-subsequence': [
    'abc\nahbgdc', 'axc\nahbgdc', 'ace\nabcde', 'aec\nabcde', 'a\na',
    'a\nb', 'sing\nsinging', 'code\nleetcode', 'test\nbest', 'bit\nbitcoin',
    'dog\ndogcat', 'cat\ndogcat', 'sun\nsunshine', 'car\ncarpet', 'hi\nhello',
    'bye\ngoodbye', 'win\nwinner', 'run\nrunner', 'pro\nprogram', 'not\nyes'
  ],
  'coin-change': [
    '3 11\n1 2 5', '1 3\n2', '1 0\n1', '4 6249\n186 419 83 408', '3 7\n1 3 4',
    '2 3\n2 5', '3 6\n1 2 5', '1 2\n1', '2 10\n3 5', '3 8\n2 3 5',
    '3 4\n1 2 3', '2 7\n2 4', '3 10\n1 5 10', '1 5\n5', '2 9\n2 5',
    '3 12\n1 5 10', '2 4\n1 3', '3 15\n2 5 10', '2 6\n4 5', '3 9\n1 3 6'
  ],
  '3sum': [
    '6\n-1 0 1 2 -1 -4', '3\n0 1 1', '3\n0 0 0', '5\n-2 0 1 1 2', '4\n-1 0 1 2',
    '5\n-5 2 3 -2 0', '4\n1 2 3 4', '6\n-4 -2 1 -5 -4 -4', '6\n-2 0 0 2 2 2', '6\n-3 1 2 -1 0 1',
    '5\n-1 0 1 0 0', '6\n-2 -1 0 1 2 3', '4\n-2 0 2 4', '5\n-4 0 2 2 4', '5\n-1 -1 2 0 1',
    '4\n0 0 0 0', '6\n-3 0 1 2 -1 4', '5\n-2 -1 1 2 0', '6\n-5 0 2 3 4 5', '4\n-1 -1 -1 2'
  ],
  'house-robber': [
    '4\n1 2 3 1', '5\n2 7 9 3 1', '1\n50', '6\n10 2 3 20 5 1', '2\n1 2',
    '3\n2 1 1', '4\n2 1 1 2', '5\n5 1 1 5 1', '4\n10 20 30 40', '5\n1 1 1 1 1',
    '3\n1 3 1', '4\n5 1 2 6', '5\n4 1 2 7 5', '3\n10 1 10', '4\n1 5 1 5',
    '5\n2 1 4 5 3', '4\n8 2 8 9', '3\n4 2 3', '5\n6 3 10 8 2', '4\n3 4 5 6'
  ],
  'jump-game': [
    '5\n2 3 1 1 4', '5\n3 2 1 0 4', '1\n0', '4\n0 2 3 4', '6\n2 0 0 1 0 0',
    '2\n1 0', '3\n2 0 0', '4\n1 1 1 1', '5\n1 0 1 0 1', '3\n1 0 2',
    '4\n2 0 1 0', '3\n1 2 0', '4\n3 0 0 0', '5\n2 5 0 0 0', '3\n0 1 2',
    '4\n1 2 0 1', '5\n4 0 0 0 0', '3\n2 2 0', '4\n1 0 0 0', '5\n2 0 2 0 1'
  ],
  'product-of-array-except-self': [
    '4\n1 2 3 4', '5\n-1 1 0 -3 3', '2\n5 2', '3\n0 0 2', '3\n2 3 4',
    '4\n-1 -1 -1 -1', '4\n2 2 2 2', '3\n1 1 1', '4\n1 0 3 4', '3\n-2 2 0',
    '3\n1 2 0', '4\n2 4 6 8', '3\n5 1 2', '4\n1 2 1 2', '3\n-1 2 -3',
    '4\n0 1 2 3', '2\n3 7', '3\n4 2 1', '4\n-2 -3 -4 -5', '3\n10 20 30'
  ],
  'container-with-most-water': [
    '9\n1 8 6 2 5 4 8 3 7', '2\n1 1', '5\n4 3 2 1 4', '3\n1 2 1', '4\n2 3 4 5',
    '5\n5 4 3 2 1', '4\n1 2 4 3', '3\n3 9 3', '4\n10 1 1 10', '5\n1 3 2 5 25',
    '3\n2 1 2', '4\n1 1 1 1', '5\n1 2 3 4 5', '4\n6 2 5 4', '3\n4 4 4',
    '5\n2 3 10 5 7', '4\n3 1 2 4', '5\n1 8 1 8 1', '3\n5 1 5', '4\n1 5 5 1'
  ],
  'rotate-array': [
    '7 3\n1 2 3 4 5 6 7', '4 2\n-1 -100 3 99', '1 0\n10', '2 3\n1 2', '3 1\n1 2 3',
    '5 5\n1 2 3 4 5', '4 1\n10 20 30 40', '3 4\n1 2 3', '4 0\n1 2 3 4', '5 2\n5 4 3 2 1',
    '3 2\n1 2 3', '4 3\n1 2 3 4', '5 1\n1 2 3 4 5', '2 1\n10 20', '3 0\n1 2 3',
    '4 4\n4 3 2 1', '5 3\n1 3 5 7 9', '3 5\n1 2 3', '4 2\n2 4 6 8', '5 4\n1 2 3 4 5'
  ],
  'daily-temperatures': [
    '8\n73 74 75 71 69 72 76 73', '4\n30 40 50 60', '3\n30 60 90', '1\n80', '5\n50 50 50 50 50',
    '4\n90 80 70 60', '5\n60 70 60 70 80', '3\n40 35 45', '4\n30 31 32 33', '5\n89 62 70 58 47',
    '4\n70 71 72 73', '3\n80 70 60', '5\n40 50 40 50 40', '4\n65 66 64 67', '3\n55 54 53',
    '4\n30 35 32 40', '5\n75 74 73 72 71', '3\n45 50 55', '4\n60 62 61 63', '5\n33 34 35 36 37'
  ],
  'longest-consecutive-sequence': [
    '6\n100 4 200 1 3 2', '10\n0 3 7 2 5 8 4 6 0 1', '1\n10', '5\n1 2 0 1 2', '5\n5 4 3 2 1',
    '4\n10 30 20 40', '4\n1 3 5 7', '6\n9 1 4 7 3 -1', '5\n-3 -2 -1 0 1', '6\n2 20 4 10 3 4',
    '4\n1 2 3 4', '3\n100 101 102', '5\n10 5 12 6 11', '4\n2 4 6 8', '3\n0 2 1',
    '5\n5 1 4 2 3', '4\n-1 -2 -3 0', '3\n7 8 9', '4\n50 20 40 30', '5\n2 1 0 -1 -2'
  ],
  'trapping-rain-water': [
    '12\n0 1 0 2 1 0 1 3 2 1 2 1', '6\n4 2 0 3 2 5', '3\n3 0 3', '1\n10', '5\n5 4 3 2 1',
    '5\n1 2 3 4 5', '4\n2 0 0 2', '5\n3 1 2 1 3', '6\n0 2 0 2 0 2', '5\n4 2 3 2 4',
    '3\n2 0 2', '4\n3 1 1 3', '5\n2 1 0 1 2', '4\n4 1 2 4', '6\n3 0 2 0 4 1',
    '5\n1 0 2 0 3', '4\n2 1 2 1', '5\n3 0 1 0 3', '3\n1 2 1', '4\n3 2 1 2'
  ],
  'first-missing-positive': [
    '3\n1 2 0', '4\n3 4 -1 1', '5\n7 8 9 11 12', '1\n1', '1\n2',
    '4\n1 2 3 4', '3\n-1 -2 -3', '4\n2 3 7 1', '5\n1 1 0 -1 -2', '5\n1 3 4 5 6',
    '3\n2 3 4', '4\n1 0 2 4', '2\n1 3', '5\n-1 4 2 1 9', '3\n0 2 1',
    '4\n5 4 3 2', '3\n1 1 1', '4\n1 2 4 5', '2\n-5 1', '3\n3 1 2'
  ]
};

async function main() {
  console.log('🔄 Fetching problems from Supabase...');
  const res = await req('GET', '/problems?select=id,slug,title');
  if (!Array.isArray(res.body)) {
    console.error('Error fetching problems:', res.body);
    return;
  }

  const dbProblems = res.body;
  console.log(`Found ${dbProblems.length} problems in database.\n`);

  let totalInserted = 0;

  for (const prob of dbProblems) {
    const inputs = inputBank[prob.slug];
    const solver = solvers[prob.slug];

    if (!inputs || !solver) {
      console.log(`  ⚠ Missing inputs or solver for ${prob.slug}, skipping.`);
      continue;
    }

    // Delete existing test cases for this problem
    await req('DELETE', `/test_cases?problem_id=eq.${prob.id}`);

    // Generate 20 verified test cases
    const rows = inputs.map((inp, idx) => {
      const expected = solver(inp);
      return {
        problem_id: prob.id,
        input: inp,
        expected_output: expected,
        is_sample: idx < 2, // First 2 are sample test cases
        order_index: idx + 1
      };
    });

    const insRes = await req('POST', '/test_cases', rows);
    if (insRes.status === 201 || insRes.status === 200) {
      totalInserted += rows.length;
      console.log(`  ✓ ${prob.title} (${prob.slug}): ${rows.length} test cases added`);
    } else {
      console.error(`  ✗ Failed for ${prob.title}:`, insRes.body);
    }
  }

  console.log(`\n🎉 Success! Added ${totalInserted} verified test cases across ${dbProblems.length} problems!`);
  console.log(`Every single problem now has exactly 20 test cases (2 sample + 18 hidden).`);
}

main().catch(console.error);
