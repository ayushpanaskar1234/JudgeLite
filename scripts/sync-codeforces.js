// sync-codeforces.js
// Run: node sync-codeforces.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const k = line.substring(0, eqIdx).trim();
      const v = line.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      env[k] = v;
    }
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
console.log('Supabase URL:', SUPABASE_URL);

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'JudgeLite-Sync/1.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ raw: data }); }
      });
    }).on('error', reject);
  });
}

function supabaseReq(method, endpoint, body) {
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
    const req = https.request(options, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(out) }); }
        catch (e) { resolve({ status: res.statusCode, body: out }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function ratingToJudgeLite(rating) {
  if (!rating || rating < 1000) return { difficulty: 'Easy', points: 100 };
  if (rating < 1300) return { difficulty: 'Medium', points: 200 };
  return { difficulty: 'Hard', points: 300 };
}

function makeSlug(contestId, index, title) {
  const titlePart = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 35);
  return `cf-${contestId}${index.toLowerCase()}-${titlePart}`;
}

function makeDescription(p) {
  const cfLink = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
  const tags = (p.tags || []).filter(t => !t.startsWith('*')).join(', ');
  return [
    `## Problem Statement`,
    ``,
    `Read the full problem statement and input specifications on Codeforces: [${p.contestId}${p.index} - ${p.name}](${cfLink})`,
    ``,
    `**Difficulty Rating:** ${p.rating || 'Unrated'}  `,
    `**Tags:** ${tags || 'implementation'}`,
    ``,
    `---`,
    ``,
    `### Input / Output`,
    `Please refer to the Codeforces problem description for the exact input and output formats and constraints.`,
    ``,
    `> **Note:** Submit your code in C++, Java, or Python using standard input/output.`,
  ].join('\n');
}

const DEFAULT_STARTER_CODE = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // Write your solution here
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
  python: `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    # Write your solution here

if __name__ == '__main__':
    main()`
};

async function main() {
  console.log('\n🔄 Fetching problems from Codeforces API...');

  const cfData = await httpsGet('https://codeforces.com/api/problemset.problems?tags=implementation&lang=en');
  if (!cfData.status || cfData.status !== 'OK') {
    console.error('Codeforces API failed:', JSON.stringify(cfData).substring(0, 300));
    process.exit(1);
  }

  const all = cfData.result.problems;
  console.log(`✓ CF returned ${all.length} problems`);

  const picks = all
    .filter(p => p.rating && p.rating >= 800 && p.rating <= 1300 && !p.tags.includes('*special'))
    .slice(0, 30);

  console.log(`→ Selected ${picks.length} candidate problems (rating 800–1300)\n`);

  const existRes = await supabaseReq('GET', '/problems?select=slug', null);
  const existingSlugs = new Set(
    Array.isArray(existRes.body) ? existRes.body.map(r => r.slug) : []
  );
  console.log(`Current problems in DB: ${existingSlugs.size}\n`);

  let ok = 0, skip = 0, fail = 0;

  for (const p of picks) {
    const slug = makeSlug(p.contestId, p.index, p.name);
    if (existingSlugs.has(slug)) {
      skip++;
      continue;
    }

    const { difficulty, points } = ratingToJudgeLite(p.rating);

    const row = {
      slug,
      title: `${p.name}`,
      description_markdown: makeDescription(p),
      difficulty,
      points,
      time_limit_ms: 2000,
      memory_limit_kb: 262144,
      starter_code: DEFAULT_STARTER_CODE,
    };

    const res = await supabaseReq('POST', '/problems', [row]);
    if (res.status === 201 || res.status === 200) {
      ok++;
      console.log(`  ✓ [${difficulty}] ${p.name} (CF ${p.contestId}${p.index})`);
    } else {
      fail++;
      console.warn(`  ✗ Failed [HTTP ${res.status}]: ${p.name}`);
      console.warn('    Response:', JSON.stringify(res.body).substring(0, 200));
    }

    await new Promise(r => setTimeout(r, 80));
  }

  console.log(`\n📊 Results: ${ok} inserted, ${skip} skipped (duplicate), ${fail} failed`);
  if (ok > 0) console.log(`\n✅ Successfully added ${ok} problems! Visit http://localhost:3000/problems to see them.`);
}

main().catch(e => { console.error(e); process.exit(1); });
