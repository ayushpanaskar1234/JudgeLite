// seed-batch-3.js
// Adds 10 more problems to reach 40 total

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

const problems = [
  {
    slug: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return **\`true\`** *if it is a palindrome*, or **\`false\`** *otherwise*.

### Input Format
A single line containing the string \`s\`.

### Output Format
Print \`true\` or \`false\`.

### Example 1
**Input:**
\`\`\`text
A man, a plan, a canal: Panama
\`\`\`
**Output:**
\`\`\`text
true
\`\`\`
**Explanation:** "amanaplanacanalpanama" is a palindrome.

### Example 2
**Input:**
\`\`\`text
race a car
\`\`\`
**Output:**
\`\`\`text
false
\`\`\`
**Explanation:** "raceacar" is not a palindrome.

### Constraints
- \`1 <= s.length <= 2 * 10^5\`
- \`s\` consists only of printable ASCII characters.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    if (getline(cin, s)) {
        string filtered = "";
        for (char c : s) {
            if (isalnum(c)) filtered += tolower(c);
        }
        string rev = filtered;
        reverse(rev.begin(), rev.end());
        cout << (filtered == rev ? "true" : "false") << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            StringBuilder sb = new StringBuilder();
            for (char c : s.toCharArray()) {
                if (Character.isLetterOrDigit(c)) sb.append(Character.toLowerCase(c));
            }
            String filtered = sb.toString();
            String rev = sb.reverse().toString();
            System.out.println(filtered.equals(rev) ? "true" : "false");
        }
    }
}`,
      python: `import sys

def main():
    s = sys.stdin.read().strip()
    filtered = [c.lower() for c in s if c.isalnum()]
    print("true" if filtered == filtered[::-1] else "false")

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: 'A man, a plan, a canal: Panama', expected_output: 'true', is_sample: true },
      { input: 'race a car', expected_output: 'false', is_sample: true },
      { input: ' ', expected_output: 'true', is_sample: false },
      { input: '0P', expected_output: 'false', is_sample: false }
    ]
  },
  {
    slug: 'is-subsequence',
    title: 'Is Subsequence',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given two strings \`s\` and \`t\`, return **\`true\`** *if \`s\` is a **subsequence** of \`t\`, or **\`false\`** otherwise*.

A **subsequence** of a string is a new string that is formed from the original string by deleting some (can be none) of the characters without disturbing the relative positions of the remaining characters.

### Input Format
- First line: string \`s\`.
- Second line: string \`t\`.

### Output Format
Print \`true\` or \`false\`.

### Example 1
**Input:**
\`\`\`text
abc
ahbgdc
\`\`\`
**Output:**
\`\`\`text
true
\`\`\`

### Example 2
**Input:**
\`\`\`text
axc
ahbgdc
\`\`\`
**Output:**
\`\`\`text
false
\`\`\`

### Constraints
- \`0 <= s.length <= 100\`
- \`0 <= t.length <= 10^4\`
- \`s\` and \`t\` consist only of lowercase English letters.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, t;
    if (cin >> s >> t) {
        int i = 0, j = 0;
        while (i < (int)s.size() && j < (int)t.size()) {
            if (s[i] == t[j]) i++;
            j++;
        }
        cout << (i == (int)s.size() ? "true" : "false") << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            String t = sc.next();
            int i = 0, j = 0;
            while (i < s.length() && j < t.length()) {
                if (s.charAt(i) == t.charAt(j)) i++;
                j++;
            }
            System.out.println(i == s.length() ? "true" : "false");
        }
    }
}`,
      python: `import sys

def main():
    parts = sys.stdin.read().split()
    if len(parts) >= 2:
        s, t = parts[0], parts[1]
        i = 0
        for c in t:
            if i < len(s) and s[i] == c:
                i += 1
        print("true" if i == len(s) else "false")

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: 'abc\nahbgdc', expected_output: 'true', is_sample: true },
      { input: 'axc\nahbgdc', expected_output: 'false', is_sample: true },
      { input: 'ace\nabcde', expected_output: 'true', is_sample: false },
      { input: 'aec\nabcde', expected_output: 'false', is_sample: false }
    ]
  },
  {
    slug: 'rotate-array',
    title: 'Rotate Array',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

Given an integer array \`nums\`, rotate the array to the right by \`k\` steps, where \`k\` is non-negative.

### Input Format
- First line: two integers \`n\` and \`k\`.
- Second line: \`n\` space-separated integers.

### Output Format
Print the rotated array space-separated.

### Example 1
**Input:**
\`\`\`text
7 3
1 2 3 4 5 6 7
\`\`\`
**Output:**
\`\`\`text
5 6 7 1 2 3 4
\`\`\`
**Explanation:**
rotate 1 steps to the right: [7,1,2,3,4,5,6]
rotate 2 steps to the right: [6,7,1,2,3,4,5]
rotate 3 steps to the right: [5,6,7,1,2,3,4]

### Constraints
- \`1 <= nums.length <= 10^5\`
- \`-2^31 <= nums[i] <= 2^31 - 1\`
- \`0 <= k <= 10^5\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    if (cin >> n >> k) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        k %= n;
        rotate(a.begin(), a.begin() + (n - k), a.end());
        for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\\n");
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int k = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = sc.nextInt();
            k %= n;
            int[] res = new int[n];
            for (int i = 0; i < n; i++) {
                res[(i + k) % n] = a[i];
            }
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < n; i++) {
                if (i > 0) sb.append(" ");
                sb.append(res[i]);
            }
            System.out.println(sb);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n, k = int(tokens[0]), int(tokens[1])
    a = list(map(int, tokens[2:2+n]))
    k %= n
    rotated = a[-k:] + a[:-k] if k > 0 else a
    print(" ".join(map(str, rotated)))

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '7 3\n1 2 3 4 5 6 7', expected_output: '5 6 7 1 2 3 4', is_sample: true },
      { input: '4 2\n-1 -100 3 99', expected_output: '3 99 -1 -100', is_sample: true },
      { input: '1 0\n10', expected_output: '10', is_sample: false },
      { input: '2 3\n1 2', expected_output: '2 1', is_sample: false }
    ]
  },
  {
    slug: 'daily-temperatures',
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

Given an array of integers \`temperatures\` represents the daily temperatures, return *an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the \`i\`-th day to get a warmer temperature*. If there is no future day for which this is possible, keep \`answer[i] == 0\` instead.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated temperatures.

### Output Format
Print \`n\` space-separated integers representing the wait days.

### Example 1
**Input:**
\`\`\`text
8
73 74 75 71 69 72 76 73
\`\`\`
**Output:**
\`\`\`text
1 1 4 2 1 1 0 0
\`\`\`

### Example 2
**Input:**
\`\`\`text
4
30 40 50 60
\`\`\`
**Output:**
\`\`\`text
1 1 1 0
\`\`\`

### Constraints
- \`1 <= temperatures.length <= 10^5\`
- \`30 <= temperatures[i] <= 100\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> t(n), ans(n, 0);
        for (int i = 0; i < n; i++) cin >> t[i];
        stack<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && t[i] > t[st.top()]) {
                int prev = st.top(); st.pop();
                ans[prev] = i - prev;
            }
            st.push(i);
        }
        for (int i = 0; i < n; i++) cout << ans[i] << (i + 1 < n ? " " : "\\n");
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] t = new int[n], ans = new int[n];
            for (int i = 0; i < n; i++) t[i] = sc.nextInt();
            Deque<Integer> st = new ArrayDeque<>();
            for (int i = 0; i < n; i++) {
                while (!st.isEmpty() && t[i] > t[st.peek()]) {
                    int prev = st.pop();
                    ans[prev] = i - prev;
                }
                st.push(i);
            }
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < n; i++) {
                if (i > 0) sb.append(" ");
                sb.append(ans[i]);
            }
            System.out.println(sb);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    t = list(map(int, tokens[1:n+1]))
    ans = [0] * n
    st = []
    for i, temp in enumerate(t):
        while st and temp > t[st[-1]]:
            prev = st.pop()
            ans[prev] = i - prev
        st.append(i)
    print(" ".join(map(str, ans)))

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '8\n73 74 75 71 69 72 76 73', expected_output: '1 1 4 2 1 1 0 0', is_sample: true },
      { input: '4\n30 40 50 60', expected_output: '1 1 1 0', is_sample: true },
      { input: '3\n30 60 90', expected_output: '1 1 0', is_sample: false },
      { input: '1\n80', expected_output: '0', is_sample: false }
    ]
  },
  {
    slug: 'longest-consecutive-sequence',
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

Given an unsorted array of integers \`nums\`, return *the length of the longest consecutive elements sequence*.

You must write an algorithm that runs in \`O(n)\` time.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers.

### Output Format
Print the length of the longest consecutive elements sequence.

### Example 1
**Input:**
\`\`\`text
6
100 4 200 1 3 2
\`\`\`
**Output:**
\`\`\`text
4
\`\`\`
**Explanation:** The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.

### Example 2
**Input:**
\`\`\`text
10
0 3 7 2 5 8 4 6 0 1
\`\`\`
**Output:**
\`\`\`text
9
\`\`\`

### Constraints
- \`0 <= nums.length <= 10^5\`
- \`-10^9 <= nums[i] <= 10^9\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        if (n == 0) { cout << 0 << "\\n"; return 0; }
        unordered_set<int> s;
        for (int i = 0; i < n; i++) { int x; cin >> x; s.insert(x); }
        int maxLen = 0;
        for (int x : s) {
            if (!s.count(x - 1)) {
                int cur = x, len = 1;
                while (s.count(cur + 1)) { cur++; len++; }
                maxLen = max(maxLen, len);
            }
        }
        cout << maxLen << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            if (n == 0) { System.out.println(0); return; }
            Set<Integer> s = new HashSet<>();
            for (int i = 0; i < n; i++) s.add(sc.nextInt());
            int maxLen = 0;
            for (int x : s) {
                if (!s.contains(x - 1)) {
                    int cur = x, len = 1;
                    while (s.contains(cur + 1)) { cur++; len++; }
                    maxLen = Math.max(maxLen, len);
                }
            }
            System.out.println(maxLen);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = set(map(int, tokens[1:n+1]))
    max_len = 0
    for x in nums:
        if x - 1 not in nums:
            cur = x
            curr_len = 1
            while cur + 1 in nums:
                cur += 1
                curr_len += 1
            max_len = max(max_len, curr_len)
    print(max_len)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '6\n100 4 200 1 3 2', expected_output: '4', is_sample: true },
      { input: '10\n0 3 7 2 5 8 4 6 0 1', expected_output: '9', is_sample: true },
      { input: '1\n10', expected_output: '1', is_sample: false },
      { input: '5\n1 2 0 1 2', expected_output: '3', is_sample: false }
    ]
  }
];

async function main() {
  console.log(`\n🚀 Seeding Batch 3 (${problems.length} problems)...`);

  let added = 0;
  for (const p of problems) {
    const checkRes = await req('GET', `/problems?slug=eq.${p.slug}&select=id`);
    let problemId = null;

    if (Array.isArray(checkRes.body) && checkRes.body.length > 0) {
      problemId = checkRes.body[0].id;
      await req('PATCH', `/problems?id=eq.${problemId}`, {
        title: p.title,
        description_markdown: p.description,
        difficulty: p.difficulty,
        points: p.points,
        starter_code: p.starter_code
      });
      console.log(`  ↻ Updated: ${p.title}`);
    } else {
      const insRes = await req('POST', '/problems', [{
        slug: p.slug,
        title: p.title,
        description_markdown: p.description,
        difficulty: p.difficulty,
        points: p.points,
        time_limit_ms: 2000,
        memory_limit_kb: 262144,
        starter_code: p.starter_code
      }]);
      if (Array.isArray(insRes.body) && insRes.body.length > 0) {
        problemId = insRes.body[0].id;
        added++;
        console.log(`  + Inserted: ${p.title} (${p.difficulty})`);
      } else {
        console.error(`  ✗ Failed inserting ${p.title}:`, insRes.body);
        continue;
      }
    }

    await req('DELETE', `/test_cases?problem_id=eq.${problemId}`);
    const tcRows = p.test_cases.map((tc, idx) => ({
      problem_id: problemId,
      input: tc.input,
      expected_output: tc.expected_output,
      is_sample: tc.is_sample,
      order_index: idx + 1
    }));
    await req('POST', '/test_cases', tcRows);
  }

  const countRes = await req('GET', '/problems?select=id');
  const total = Array.isArray(countRes.body) ? countRes.body.length : 'unknown';

  console.log(`\n🎉 Success! Added ${added} new problems.`);
  console.log(`📊 Grand total problems currently in database: ${total}`);
}

main().catch(console.error);
