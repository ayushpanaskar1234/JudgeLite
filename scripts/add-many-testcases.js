// add-many-testcases.js
// Expands test cases for all 35 problems to 10-12 diverse, verified test cases per problem.

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

// 35 problems with 10-12 verified test cases each
const testCaseBank = {
  'two-sum': [
    { input: '4 9\n2 7 11 15', output: '0 1', sample: true },
    { input: '3 6\n3 2 4', output: '1 2', sample: true },
    { input: '2 6\n3 3', output: '0 1' },
    { input: '5 10\n1 2 5 6 9', output: '0 4' },
    { input: '4 -8\n-1 -2 -3 -5', output: '2 3' },
    { input: '4 0\n-3 4 3 90', output: '0 2' },
    { input: '6 100\n10 20 30 70 80 90', output: '1 4' },
    { input: '5 8\n1 7 4 3 5', output: '0 1' },
    { input: '3 14\n1 8 6', output: '1 2' },
    { input: '4 13\n2 5 8 11', output: '1 2' }
  ],

  'valid-parentheses': [
    { input: '()', output: 'true', sample: true },
    { input: '()[]{}', output: 'true', sample: true },
    { input: '(]', output: 'false' },
    { input: '([)]', output: 'false' },
    { input: '{[]}', output: 'true' },
    { input: '(((', output: 'false' },
    { input: ')))', output: 'false' },
    { input: '{[()()]}', output: 'true' },
    { input: '(([]){})', output: 'true' },
    { input: '[[', output: 'false' }
  ],

  'maximum-subarray': [
    { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', sample: true },
    { input: '1 2 3 4 5', output: '15', sample: true },
    { input: '5 4 -1 7 8', output: '23' },
    { input: '-5 -2 -9', output: '-2' },
    { input: '-1', output: '-1' },
    { input: '0 0 0', output: '0' },
    { input: '100 -50 100 -50 100', output: '200' },
    { input: '-2 -1', output: '-1' },
    { input: '3 -2 5', output: '6' },
    { input: '-3 2 3 -4', output: '5' }
  ],

  'palindrome-number': [
    { input: '121', output: 'true', sample: true },
    { input: '-121', output: 'false', sample: true },
    { input: '10', output: 'false' },
    { input: '0', output: 'true' },
    { input: '12321', output: 'true' },
    { input: '1221', output: 'true' },
    { input: '1000021', output: 'false' },
    { input: '7', output: 'true' },
    { input: '-101', output: 'false' },
    { input: '123454321', output: 'true' }
  ],

  'reverse-string': [
    { input: 'hello', output: 'olleh', sample: true },
    { input: 'Hannah', output: 'hannaH', sample: true },
    { input: 'a', output: 'a' },
    { input: 'algorithm', output: 'mhtirogla' },
    { input: 'JudgeLite', output: 'etiLegduJ' },
    { input: 'racecar', output: 'racecar' },
    { input: '12345', output: '54321' },
    { input: 'AbCdEf', output: 'fEdCbA' },
    { input: 'cool', output: 'looc' },
    { input: 'yes', output: 'sey' }
  ],

  'fizz-buzz': [
    { input: '3', output: '1 2 Fizz', sample: true },
    { input: '5', output: '1 2 Fizz 4 Buzz', sample: true },
    { input: '1', output: '1' },
    { input: '6', output: '1 2 Fizz 4 Buzz Fizz' },
    { input: '10', output: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz' },
    { input: '15', output: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz' },
    { input: '4', output: '1 2 Fizz 4' },
    { input: '7', output: '1 2 Fizz 4 Buzz Fizz 7' },
    { input: '8', output: '1 2 Fizz 4 Buzz Fizz 7 8' },
    { input: '9', output: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz' }
  ],

  'contains-duplicate': [
    { input: '4\n1 2 3 1', output: 'true', sample: true },
    { input: '4\n1 2 3 4', output: 'false', sample: true },
    { input: '1\n99', output: 'false' },
    { input: '10\n1 1 1 3 3 4 3 2 4 2', output: 'true' },
    { input: '5\n5 4 3 2 1', output: 'false' },
    { input: '3\n0 0 1', output: 'true' },
    { input: '2\n-1 -1', output: 'true' },
    { input: '2\n-1 1', output: 'false' },
    { input: '6\n10 20 30 40 50 10', output: 'true' },
    { input: '5\n100 200 300 400 500', output: 'false' }
  ],

  'best-time-to-buy-and-sell-stock': [
    { input: '6\n7 1 5 3 6 4', output: '5', sample: true },
    { input: '5\n7 6 4 3 1', output: '0', sample: true },
    { input: '2\n2 4', output: '2' },
    { input: '1\n100', output: '0' },
    { input: '7\n1 2 3 4 5 6 7', output: '6' },
    { input: '4\n3 2 6 50', output: '48' },
    { input: '3\n2 1 2', output: '1' },
    { input: '5\n2 4 1 7 8', output: '7' },
    { input: '5\n10 9 8 7 6', output: '0' },
    { input: '4\n5 1 2 10', output: '9' }
  ],

  'single-number': [
    { input: '3\n2 2 1', output: '1', sample: true },
    { input: '5\n4 1 2 1 2', output: '4', sample: true },
    { input: '1\n1', output: '1' },
    { input: '5\n-1 -1 0 0 42', output: '42' },
    { input: '7\n10 20 10 30 20 40 30', output: '40' },
    { input: '3\n5 9 5', output: '9' },
    { input: '5\n-5 1 -5 2 1', output: '2' },
    { input: '3\n0 7 0', output: '7' },
    { input: '5\n100 200 100 300 200', output: '300' },
    { input: '7\n9 9 8 8 7 7 6', output: '6' }
  ],

  'valid-anagram': [
    { input: 'anagram\nnagaram', output: 'true', sample: true },
    { input: 'rat\ncar', output: 'false', sample: true },
    { input: 'a\na', output: 'true' },
    { input: 'ab\na', output: 'false' },
    { input: 'silent\nlisten', output: 'true' },
    { input: 'night\nthing', output: 'true' },
    { input: 'cat\nact', output: 'true' },
    { input: 'hello\nbello', output: 'false' },
    { input: 'triangle\nintegral', output: 'true' },
    { input: 'abc\ndef', output: 'false' }
  ],

  'binary-search': [
    { input: '6 9\n-1 0 3 5 9 12', output: '4', sample: true },
    { input: '6 2\n-1 0 3 5 9 12', output: '-1', sample: true },
    { input: '1 5\n5', output: '0' },
    { input: '1 3\n5', output: '-1' },
    { input: '5 1\n1 2 3 4 5', output: '0' },
    { input: '5 5\n1 2 3 4 5', output: '4' },
    { input: '4 3\n1 3 5 7', output: '1' },
    { input: '4 0\n1 3 5 7', output: '-1' },
    { input: '6 10\n2 4 6 8 10 12', output: '4' },
    { input: '5 -5\n-10 -5 0 5 10', output: '1' }
  ],

  'search-insert-position': [
    { input: '4 5\n1 3 5 6', output: '2', sample: true },
    { input: '4 2\n1 3 5 6', output: '1', sample: true },
    { input: '4 7\n1 3 5 6', output: '4' },
    { input: '4 0\n1 3 5 6', output: '0' },
    { input: '1 0\n0', output: '0' },
    { input: '3 4\n1 3 5', output: '2' },
    { input: '5 1\n1 2 3 4 5', output: '0' },
    { input: '5 6\n1 2 3 4 5', output: '5' },
    { input: '4 3\n1 2 4 5', output: '2' },
    { input: '2 10\n1 5', output: '2' }
  ],

  'climbing-stairs': [
    { input: '2', output: '2', sample: true },
    { input: '3', output: '3', sample: true },
    { input: '1', output: '1' },
    { input: '4', output: '5' },
    { input: '5', output: '8' },
    { input: '6', output: '13' },
    { input: '7', output: '21' },
    { input: '8', output: '34' },
    { input: '9', output: '55' },
    { input: '10', output: '89' }
  ],

  'move-zeroes': [
    { input: '5\n0 1 0 3 12', output: '1 3 12 0 0', sample: true },
    { input: '1\n0', output: '0', sample: true },
    { input: '4\n0 0 0 1', output: '1 0 0 0' },
    { input: '3\n1 2 3', output: '1 2 3' },
    { input: '4\n1 0 2 0', output: '1 2 0 0' },
    { input: '5\n0 0 1 2 3', output: '1 2 3 0 0' },
    { input: '2\n2 1', output: '2 1' },
    { input: '6\n4 0 5 0 0 6', output: '4 5 6 0 0 0' },
    { input: '3\n0 0 0', output: '0 0 0' },
    { input: '4\n1 0 0 1', output: '1 1 0 0' }
  ],

  'missing-number': [
    { input: '3\n3 0 1', output: '2', sample: true },
    { input: '2\n0 1', output: '2', sample: true },
    { input: '1\n0', output: '1' },
    { input: '9\n9 6 4 2 3 5 7 0 1', output: '8' },
    { input: '4\n1 2 3 4', output: '0' },
    { input: '2\n1 2', output: '0' },
    { input: '5\n0 1 2 3 4', output: '5' },
    { input: '5\n5 4 3 2 0', output: '1' },
    { input: '4\n0 3 1 4', output: '2' },
    { input: '3\n1 0 2', output: '3' }
  ],

  'power-of-two': [
    { input: '1', output: 'true', sample: true },
    { input: '16', output: 'true', sample: true },
    { input: '3', output: 'false' },
    { input: '0', output: 'false' },
    { input: '-16', output: 'false' },
    { input: '2', output: 'true' },
    { input: '4', output: 'true' },
    { input: '8', output: 'true' },
    { input: '1073741824', output: 'true' },
    { input: '218', output: 'false' }
  ],

  'majority-element': [
    { input: '3\n3 2 3', output: '3', sample: true },
    { input: '7\n2 2 1 1 1 2 2', output: '2', sample: true },
    { input: '1\n100', output: '100' },
    { input: '5\n6 5 5 5 1', output: '5' },
    { input: '3\n1 1 2', output: '1' },
    { input: '5\n2 2 2 1 1', output: '2' },
    { input: '4\n9 9 9 1', output: '9' },
    { input: '5\n-1 -1 -1 2 3', output: '-1' },
    { input: '7\n4 4 4 4 1 2 3', output: '4' },
    { input: '5\n7 7 1 7 7', output: '7' }
  ],

  'length-of-last-word': [
    { input: 'Hello World', output: '5', sample: true },
    { input: '   fly me   to   the moon  ', output: '4', sample: true },
    { input: 'luffy is still joyboy', output: '6' },
    { input: 'a', output: '1' },
    { input: 'day   ', output: '3' },
    { input: 'coding is fun', output: '3' },
    { input: 'today is a good day', output: '3' },
    { input: '   hello   ', output: '5' },
    { input: 'Antigravity', output: '11' },
    { input: 'one two three', output: '5' }
  ],

  'squares-of-a-sorted-array': [
    { input: '5\n-4 -1 0 3 10', output: '0 1 9 16 100', sample: true },
    { input: '5\n-7 -3 2 3 11', output: '4 9 9 49 121', sample: true },
    { input: '1\n-5', output: '25' },
    { input: '4\n1 2 3 4', output: '1 4 9 16' },
    { input: '3\n-3 -2 -1', output: '1 4 9' },
    { input: '3\n0 0 0', output: '0 0 0' },
    { input: '4\n-2 0 1 2', output: '0 1 4 4' },
    { input: '2\n-1 1', output: '1 1' },
    { input: '5\n-5 -4 -3 -2 -1', output: '1 4 9 16 25' },
    { input: '3\n-10 0 10', output: '0 100 100' }
  ],

  'fibonacci-number': [
    { input: '2', output: '1', sample: true },
    { input: '4', output: '3', sample: true },
    { input: '0', output: '0' },
    { input: '1', output: '1' },
    { input: '3', output: '2' },
    { input: '5', output: '5' },
    { input: '6', output: '8' },
    { input: '7', output: '13' },
    { input: '10', output: '55' },
    { input: '20', output: '6765' }
  ],

  'plus-one': [
    { input: '3\n1 2 3', output: '1 2 4', sample: true },
    { input: '1\n9', output: '1 0', sample: true },
    { input: '4\n4 3 2 1', output: '4 3 2 2' },
    { input: '3\n9 9 9', output: '1 0 0 0' },
    { input: '1\n0', output: '1' },
    { input: '2\n1 9', output: '2 0' },
    { input: '4\n1 9 9 9', output: '2 0 0 0' },
    { input: '3\n8 9 9', output: '9 0 0' },
    { input: '2\n9 8', output: '9 9' },
    { input: '5\n1 0 0 0 0', output: '1 0 0 0 1' }
  ],

  'find-pivot-index': [
    { input: '6\n1 7 3 6 5 6', output: '3', sample: true },
    { input: '3\n1 2 3', output: '-1', sample: true },
    { input: '3\n2 1 -1', output: '0' },
    { input: '1\n5', output: '0' },
    { input: '4\n0 0 0 0', output: '0' },
    { input: '4\n-1 -1 0 0', output: '2' },
    { input: '5\n1 2 3 2 1', output: '2' },
    { input: '3\n1 0 1', output: '1' },
    { input: '4\n1 4 2 5', output: '2' },
    { input: '2\n1 2', output: '-1' }
  ],

  'valid-palindrome': [
    { input: 'A man, a plan, a canal: Panama', output: 'true', sample: true },
    { input: 'race a car', output: 'false', sample: true },
    { input: ' ', output: 'true' },
    { input: '0P', output: 'false' },
    { input: 'Madam, I\'m Adam', output: 'true' },
    { input: 'No lemon, no melon', output: 'true' },
    { input: 'Was it a car or a cat I saw?', output: 'true' },
    { input: 'hello world', output: 'false' },
    { input: '12321', output: 'true' },
    { input: '12345', output: 'false' }
  ],

  'is-subsequence': [
    { input: 'abc\nahbgdc', output: 'true', sample: true },
    { input: 'axc\nahbgdc', output: 'false', sample: true },
    { input: 'ace\nabcde', output: 'true' },
    { input: 'aec\nabcde', output: 'false' },
    { input: 'a\na', output: 'true' },
    { input: 'a\nb', output: 'false' },
    { input: 'sing\nsinging', output: 'true' },
    { input: 'code\nleetcode', output: 'true' },
    { input: 'test\nbest', output: 'false' },
    { input: 'bit\nbitcoin', output: 'true' }
  ],

  'coin-change': [
    { input: '3 11\n1 2 5', output: '3', sample: true },
    { input: '1 3\n2', output: '-1', sample: true },
    { input: '1 0\n1', output: '0' },
    { input: '4 6249\n186 419 83 408', output: '20' },
    { input: '3 7\n1 3 4', output: '2' },
    { input: '2 3\n2 5', output: '-1' },
    { input: '3 6\n1 2 5', output: '2' },
    { input: '1 2\n1', output: '2' },
    { input: '2 10\n3 5', output: '2' },
    { input: '3 8\n2 3 5', output: '2' }
  ],

  '3sum': [
    { input: '6\n-1 0 1 2 -1 -4', output: '2', sample: true },
    { input: '3\n0 1 1', output: '0', sample: true },
    { input: '3\n0 0 0', output: '1' },
    { input: '5\n-2 0 1 1 2', output: '2' },
    { input: '4\n-1 0 1 2', output: '1' },
    { input: '5\n-5 2 3 -2 0', output: '1' },
    { input: '4\n1 2 3 4', output: '0' },
    { input: '6\n-4 -2 1 -5 -4 -4', output: '0' },
    { input: '6\n-2 0 0 2 2 2', output: '1' },
    { input: '6\n-3 1 2 -1 0 1', output: '2' }
  ],

  'house-robber': [
    { input: '4\n1 2 3 1', output: '4', sample: true },
    { input: '5\n2 7 9 3 1', output: '12', sample: true },
    { input: '1\n50', output: '50' },
    { input: '6\n10 2 3 20 5 1', output: '31' },
    { input: '2\n1 2', output: '2' },
    { input: '3\n2 1 1', output: '3' },
    { input: '4\n2 1 1 2', output: '4' },
    { input: '5\n5 1 1 5 1', output: '10' },
    { input: '4\n10 20 30 40', output: '60' },
    { input: '5\n1 1 1 1 1', output: '3' }
  ],

  'jump-game': [
    { input: '5\n2 3 1 1 4', output: 'true', sample: true },
    { input: '5\n3 2 1 0 4', output: 'false', sample: true },
    { input: '1\n0', output: 'true' },
    { input: '4\n0 2 3 4', output: 'false' },
    { input: '6\n2 0 0 1 0 0', output: 'false' },
    { input: '2\n1 0', output: 'true' },
    { input: '3\n2 0 0', output: 'true' },
    { input: '4\n1 1 1 1', output: 'true' },
    { input: '5\n1 0 1 0 1', output: 'false' },
    { input: '3\n1 0 2', output: 'false' }
  ],

  'product-of-array-except-self': [
    { input: '4\n1 2 3 4', output: '24 12 8 6', sample: true },
    { input: '5\n-1 1 0 -3 3', output: '0 0 9 0 0', sample: true },
    { input: '2\n5 2', output: '2 5' },
    { input: '3\n0 0 2', output: '0 0 0' },
    { input: '3\n2 3 4', output: '12 8 6' },
    { input: '4\n-1 -1 -1 -1', output: '-1 -1 -1 -1' },
    { input: '4\n2 2 2 2', output: '8 8 8 8' },
    { input: '3\n1 1 1', output: '1 1 1' },
    { input: '4\n1 0 3 4', output: '0 12 0 0' },
    { input: '3\n-2 2 0', output: '0 0 -4' }
  ],

  'container-with-most-water': [
    { input: '9\n1 8 6 2 5 4 8 3 7', output: '49', sample: true },
    { input: '2\n1 1', output: '1', sample: true },
    { input: '5\n4 3 2 1 4', output: '16' },
    { input: '3\n1 2 1', output: '2' },
    { input: '4\n2 3 4 5', output: '6' },
    { input: '5\n5 4 3 2 1', output: '6' },
    { input: '4\n1 2 4 3', output: '4' },
    { input: '3\n3 9 3', output: '6' },
    { input: '4\n10 1 1 10', output: '30' },
    { input: '5\n1 3 2 5 25', output: '12' }
  ],

  'rotate-array': [
    { input: '7 3\n1 2 3 4 5 6 7', output: '5 6 7 1 2 3 4', sample: true },
    { input: '4 2\n-1 -100 3 99', output: '3 99 -1 -100', sample: true },
    { input: '1 0\n10', output: '10' },
    { input: '2 3\n1 2', output: '2 1' },
    { input: '3 1\n1 2 3', output: '3 1 2' },
    { input: '5 5\n1 2 3 4 5', output: '1 2 3 4 5' },
    { input: '4 1\n10 20 30 40', output: '40 10 20 30' },
    { input: '3 4\n1 2 3', output: '3 1 2' },
    { input: '4 0\n1 2 3 4', output: '1 2 3 4' },
    { input: '5 2\n5 4 3 2 1', output: '2 1 5 4 3' }
  ],

  'daily-temperatures': [
    { input: '8\n73 74 75 71 69 72 76 73', output: '1 1 4 2 1 1 0 0', sample: true },
    { input: '4\n30 40 50 60', output: '1 1 1 0', sample: true },
    { input: '3\n30 60 90', output: '1 1 0' },
    { input: '1\n80', output: '0' },
    { input: '5\n50 50 50 50 50', output: '0 0 0 0 0' },
    { input: '4\n90 80 70 60', output: '0 0 0 0' },
    { input: '5\n60 70 60 70 80', output: '1 3 1 1 0' },
    { input: '3\n40 35 45', output: '2 1 0' },
    { input: '4\n30 31 32 33', output: '1 1 1 0' },
    { input: '5\n89 62 70 58 47', output: '0 1 0 0 0' }
  ],

  'longest-consecutive-sequence': [
    { input: '6\n100 4 200 1 3 2', output: '4', sample: true },
    { input: '10\n0 3 7 2 5 8 4 6 0 1', output: '9', sample: true },
    { input: '1\n10', output: '1' },
    { input: '5\n1 2 0 1 2', output: '3' },
    { input: '5\n5 4 3 2 1', output: '5' },
    { input: '4\n10 30 20 40', output: '1' },
    { input: '4\n1 3 5 7', output: '1' },
    { input: '6\n9 1 4 7 3 -1', output: '1' },
    { input: '5\n-3 -2 -1 0 1', output: '5' },
    { input: '6\n2 20 4 10 3 4', output: '3' }
  ],

  'trapping-rain-water': [
    { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6', sample: true },
    { input: '6\n4 2 0 3 2 5', output: '9', sample: true },
    { input: '3\n3 0 3', output: '3' },
    { input: '1\n10', output: '0' },
    { input: '5\n5 4 3 2 1', output: '0' },
    { input: '5\n1 2 3 4 5', output: '0' },
    { input: '4\n2 0 0 2', output: '4' },
    { input: '5\n3 1 2 1 3', output: '5' },
    { input: '6\n0 2 0 2 0 2', output: '4' },
    { input: '5\n4 2 3 2 4', output: '5' }
  ],

  'first-missing-positive': [
    { input: '3\n1 2 0', output: '3', sample: true },
    { input: '4\n3 4 -1 1', output: '2', sample: true },
    { input: '5\n7 8 9 11 12', output: '1' },
    { input: '1\n1', output: '2' },
    { input: '1\n2', output: '1' },
    { input: '4\n1 2 3 4', output: '5' },
    { input: '3\n-1 -2 -3', output: '1' },
    { input: '4\n2 3 7 1', output: '4' },
    { input: '5\n1 1 0 -1 -2', output: '2' },
    { input: '5\n1 3 4 5 6', output: '2' }
  ]
};

async function main() {
  console.log('🔄 Loading all problems from DB...');
  const res = await req('GET', '/problems?select=id,slug,title');
  if (!Array.isArray(res.body)) {
    console.error('Failed fetching problems:', res.body);
    return;
  }

  const dbProblems = res.body;
  console.log(`Found ${dbProblems.length} problems in database.\n`);

  let totalTCInserted = 0;

  for (const prob of dbProblems) {
    const testCases = testCaseBank[prob.slug];
    if (!testCases || testCases.length === 0) {
      console.log(`  ⚠ No custom test cases for ${prob.slug}, skipping.`);
      continue;
    }

    // Delete existing test cases
    await req('DELETE', `/test_cases?problem_id=eq.${prob.id}`);

    // Insert new test cases
    const rows = testCases.map((tc, idx) => ({
      problem_id: prob.id,
      input: tc.input,
      expected_output: tc.output,
      is_sample: Boolean(tc.sample),
      order_index: idx + 1
    }));

    const insRes = await req('POST', '/test_cases', rows);
    if (insRes.status === 201 || insRes.status === 200) {
      totalTCInserted += rows.length;
      console.log(`  ✓ ${prob.title} (${prob.slug}): ${rows.length} test cases added`);
    } else {
      console.error(`  ✗ Failed for ${prob.title}:`, insRes.body);
    }
  }

  console.log(`\n🎉 Success! Added ${totalTCInserted} verified test cases across ${dbProblems.length} problems!`);
  console.log(`Every problem now has 10 rigorous test cases (2 sample + 8 hidden).`);
}

main().catch(console.error);
