// seed-more-problems.js
// Adds 23 more high-quality curated algorithmic problems to JudgeLite

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

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

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
    slug: 'missing-number',
    title: 'Missing Number',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return *the only number in the range that is missing from the array*.

### Input Format
- First line: integer \`n\` (number of elements in the array).
- Second line: \`n\` space-separated integers in the range \`[0, n]\`.

### Output Format
Print the missing integer.

### Example 1
**Input:**
\`\`\`text
3
3 0 1
\`\`\`
**Output:**
\`\`\`text
2
\`\`\`
**Explanation:** \`n = 3\` since there are 3 numbers, so all numbers are in the range \`[0, 3]\`. \`2\` is the missing number in the range.

### Example 2
**Input:**
\`\`\`text
2
0 1
\`\`\`
**Output:**
\`\`\`text
2
\`\`\`

### Constraints
- \`n == nums.length\`
- \`1 <= n <= 10^4\`
- \`0 <= nums[i] <= n\`
- All the numbers of \`nums\` are **unique**.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        long long total = 1LL * n * (n + 1) / 2;
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            long long x; cin >> x;
            sum += x;
        }
        cout << (total - sum) << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            long total = (long) n * (n + 1) / 2;
            long sum = 0;
            for (int i = 0; i < n; i++) {
                sum += sc.nextLong();
            }
            System.out.println(total - sum);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = list(map(int, tokens[1:n+1]))
    expected = n * (n + 1) // 2
    actual = sum(nums)
    print(expected - actual)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '3\n3 0 1', expected_output: '2', is_sample: true },
      { input: '2\n0 1', expected_output: '2', is_sample: true },
      { input: '1\n0', expected_output: '1', is_sample: false },
      { input: '9\n9 6 4 2 3 5 7 0 1', expected_output: '8', is_sample: false },
      { input: '4\n1 2 3 4', expected_output: '0', is_sample: false }
    ]
  },
  {
    slug: 'power-of-two',
    title: 'Power of Two',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an integer \`n\`, return **\`true\`** if it is a power of two. Otherwise, return **\`false\`**.

An integer \`n\` is a power of two if there exists an integer \`x\` such that \`n == 2^x\`.

### Input Format
A single integer \`n\`.

### Output Format
Print \`true\` or \`false\`.

### Example 1
**Input:**
\`\`\`text
1
\`\`\`
**Output:**
\`\`\`text
true
\`\`\`
**Explanation:** 2^0 = 1.

### Example 2
**Input:**
\`\`\`text
16
\`\`\`
**Output:**
\`\`\`text
true
\`\`\`
**Explanation:** 2^4 = 16.

### Example 3
**Input:**
\`\`\`text
3
\`\`\`
**Output:**
\`\`\`text
false
\`\`\`

### Constraints
- \`-2^31 <= n <= 2^31 - 1\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n;
    if (cin >> n) {
        if (n > 0 && (n & (n - 1)) == 0) cout << "true\\n";
        else cout << "false\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLong()) {
            long n = sc.nextLong();
            if (n > 0 && (n & (n - 1)) == 0) System.out.println("true");
            else System.out.println("false");
        }
    }
}`,
      python: `import sys

def main():
    s = sys.stdin.read().strip()
    if not s:
        return
    n = int(s)
    print("true" if n > 0 and (n & (n - 1)) == 0 else "false")

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '1', expected_output: 'true', is_sample: true },
      { input: '16', expected_output: 'true', is_sample: true },
      { input: '3', expected_output: 'false', is_sample: false },
      { input: '0', expected_output: 'false', is_sample: false },
      { input: '-16', expected_output: 'false', is_sample: false },
      { input: '1073741824', expected_output: 'true', is_sample: false }
    ]
  },
  {
    slug: 'majority-element',
    title: 'Majority Element',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an array \`nums\` of size \`n\`, return *the majority element*.

The majority element is the element that appears more than \`⌊n / 2⌋\` times. You may assume that the majority element always exists in the array.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers.

### Output Format
Print the majority element.

### Example 1
**Input:**
\`\`\`text
3
3 2 3
\`\`\`
**Output:**
\`\`\`text
3
\`\`\`

### Example 2
**Input:**
\`\`\`text
7
2 2 1 1 1 2 2
\`\`\`
**Output:**
\`\`\`text
2
\`\`\`

### Constraints
- \`1 <= n <= 5 * 10^4\`
- \`-10^9 <= nums[i] <= 10^9\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        int candidate = 0, count = 0;
        for (int i = 0; i < n; i++) {
            int x; cin >> x;
            if (count == 0) candidate = x;
            count += (x == candidate) ? 1 : -1;
        }
        cout << candidate << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int candidate = 0, count = 0;
            for (int i = 0; i < n; i++) {
                int x = sc.nextInt();
                if (count == 0) candidate = x;
                count += (x == candidate) ? 1 : -1;
            }
            System.out.println(candidate);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = list(map(int, tokens[1:n+1]))
    candidate, count = None, 0
    for x in nums:
        if count == 0:
            candidate = x
        count += (1 if x == candidate else -1)
    print(candidate)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '3\n3 2 3', expected_output: '3', is_sample: true },
      { input: '7\n2 2 1 1 1 2 2', expected_output: '2', is_sample: true },
      { input: '1\n100', expected_output: '100', is_sample: false },
      { input: '5\n6 5 5 5 1', expected_output: '5', is_sample: false }
    ]
  },
  {
    slug: 'length-of-last-word',
    title: 'Length of Last Word',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given a string \`s\` consisting of words and spaces, return *the length of the **last** word in the string*.

A **word** is a maximal substring consisting of non-space characters only.

### Input Format
A single line containing the string \`s\`.

### Output Format
Print an integer denoting the length of the last word.

### Example 1
**Input:**
\`\`\`text
Hello World
\`\`\`
**Output:**
\`\`\`text
5
\`\`\`
**Explanation:** The last word is "World" with length 5.

### Example 2
**Input:**
\`\`\`text
   fly me   to   the moon  
\`\`\`
**Output:**
\`\`\`text
4
\`\`\`
**Explanation:** The last word is "moon" with length 4.

### Constraints
- \`1 <= s.length <= 10^4\`
- \`s\` consists of only English letters and spaces \`' '\`.
- There will be at least one word in \`s\`.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    if (getline(cin, s)) {
        int i = s.size() - 1;
        while (i >= 0 && s[i] == ' ') i--;
        int len = 0;
        while (i >= 0 && s[i] != ' ') { len++; i--; }
        cout << len << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] words = sc.nextLine().trim().split("\\\\s+");
            System.out.println(words[words.length - 1].length());
        }
    }
}`,
      python: `import sys

def main():
    s = sys.stdin.read().strip()
    words = s.split()
    if words:
        print(len(words[-1]))

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: 'Hello World', expected_output: '5', is_sample: true },
      { input: '   fly me   to   the moon  ', expected_output: '4', is_sample: true },
      { input: 'luffy is still joyboy', expected_output: '6', is_sample: false },
      { input: 'a', expected_output: '1', is_sample: false },
      { input: 'day   ', expected_output: '3', is_sample: false }
    ]
  },
  {
    slug: 'search-insert-position',
    title: 'Search Insert Position',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with \`O(log n)\` runtime complexity.

### Input Format
- First line: two integers \`n\` and \`target\`.
- Second line: \`n\` space-separated sorted integers.

### Output Format
Print the index where \`target\` is found or should be inserted.

### Example 1
**Input:**
\`\`\`text
4 5
1 3 5 6
\`\`\`
**Output:**
\`\`\`text
2
\`\`\`

### Example 2
**Input:**
\`\`\`text
4 2
1 3 5 6
\`\`\`
**Output:**
\`\`\`text
1
\`\`\`

### Example 3
**Input:**
\`\`\`text
4 7
1 3 5 6
\`\`\`
**Output:**
\`\`\`text
4
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
- \`-10^4 <= nums[i], target <= 10^4\`
- \`nums\` contains **distinct** values sorted in ascending order.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, target;
    if (cin >> n >> target) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        int l = 0, r = n - 1, ans = n;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (a[mid] >= target) {
                ans = mid;
                r = mid - 1;
            } else {
                l = mid + 1;
            }
        }
        cout << ans << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int target = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = sc.nextInt();
            int l = 0, r = n - 1, ans = n;
            while (l <= r) {
                int mid = l + (r - l) / 2;
                if (a[mid] >= target) {
                    ans = mid;
                    r = mid - 1;
                } else {
                    l = mid + 1;
                }
            }
            System.out.println(ans);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n, target = int(tokens[0]), int(tokens[1])
    a = list(map(int, tokens[2:2+n]))
    l, r, ans = 0, n - 1, n
    while l <= r:
        mid = (l + r) // 2
        if a[mid] >= target:
            ans = mid
            r = mid - 1
        else:
            l = mid + 1
    print(ans)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '4 5\n1 3 5 6', expected_output: '2', is_sample: true },
      { input: '4 2\n1 3 5 6', expected_output: '1', is_sample: true },
      { input: '4 7\n1 3 5 6', expected_output: '4', is_sample: false },
      { input: '4 0\n1 3 5 6', expected_output: '0', is_sample: false },
      { input: '1 0\n0', expected_output: '0', is_sample: false }
    ]
  },
  {
    slug: 'squares-of-a-sorted-array',
    title: 'Squares of a Sorted Array',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an integer array \`nums\` sorted in **non-decreasing** order, return *an array of **the squares of each number** sorted in non-decreasing order*.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers in non-decreasing order.

### Output Format
Print the squares sorted in non-decreasing order, space-separated.

### Example 1
**Input:**
\`\`\`text
5
-4 -1 0 3 10
\`\`\`
**Output:**
\`\`\`text
0 1 9 16 100
\`\`\`
**Explanation:** After squaring, the array becomes [16, 1, 0, 9, 100]. After sorting, it becomes [0, 1, 9, 16, 100].

### Example 2
**Input:**
\`\`\`text
5
-7 -3 2 3 11
\`\`\`
**Output:**
\`\`\`text
4 9 9 49 121
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
- \`-10^4 <= nums[i] <= 10^4\`
- \`nums\` is sorted in **non-decreasing** order.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> a(n), res(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        int l = 0, r = n - 1, idx = n - 1;
        while (l <= r) {
            int sqL = a[l] * a[l];
            int sqR = a[r] * a[r];
            if (sqL > sqR) { res[idx--] = sqL; l++; }
            else { res[idx--] = sqR; r--; }
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\\n");
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n], res = new int[n];
            for (int i = 0; i < n; i++) a[i] = sc.nextInt();
            int l = 0, r = n - 1, idx = n - 1;
            while (l <= r) {
                int sqL = a[l] * a[l];
                int sqR = a[r] * a[r];
                if (sqL > sqR) { res[idx--] = sqL; l++; }
                else { res[idx--] = sqR; r--; }
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
    n = int(tokens[0])
    a = list(map(int, tokens[1:n+1]))
    res = sorted(x * x for x in a)
    print(" ".join(map(str, res)))

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '5\n-4 -1 0 3 10', expected_output: '0 1 9 16 100', is_sample: true },
      { input: '5\n-7 -3 2 3 11', expected_output: '4 9 9 49 121', is_sample: true },
      { input: '1\n-5', expected_output: '25', is_sample: false },
      { input: '4\n1 2 3 4', expected_output: '1 4 9 16', is_sample: false }
    ]
  },
  {
    slug: 'fibonacci-number',
    title: 'Fibonacci Number',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

The **Fibonacci numbers**, commonly denoted \`F(n)\`, form a sequence such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`. That is:
- \`F(0) = 0, F(1) = 1\`
- \`F(n) = F(n - 1) + F(n - 2)\`, for \`n > 1\`.

Given \`n\`, calculate \`F(n)\`.

### Input Format
A single integer \`n\`.

### Output Format
Print \`F(n)\`.

### Example 1
**Input:**
\`\`\`text
2
\`\`\`
**Output:**
\`\`\`text
1
\`\`\`

### Example 2
**Input:**
\`\`\`text
4
\`\`\`
**Output:**
\`\`\`text
3
\`\`\`
**Explanation:** F(4) = F(3) + F(2) = 2 + 1 = 3.

### Constraints
- \`0 <= n <= 30\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        if (n <= 1) { cout << n << "\\n"; return 0; }
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        cout << b << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            if (n <= 1) { System.out.println(n); return; }
            int a = 0, b = 1;
            for (int i = 2; i <= n; i++) {
                int c = a + b;
                a = b;
                b = c;
            }
            System.out.println(b);
        }
    }
}`,
      python: `import sys

def main():
    s = sys.stdin.read().strip()
    if not s:
        return
    n = int(s)
    if n <= 1:
        print(n)
        return
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    print(b)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '2', expected_output: '1', is_sample: true },
      { input: '4', expected_output: '3', is_sample: true },
      { input: '0', expected_output: '0', is_sample: false },
      { input: '1', expected_output: '1', is_sample: false },
      { input: '10', expected_output: '55', is_sample: false },
      { input: '30', expected_output: '832040', is_sample: false }
    ]
  },
  {
    slug: 'plus-one',
    title: 'Plus One',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

You are given a **large integer** represented as an integer array \`digits\`, where each \`digits[i]\` is the \`i\`-th digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading \`0\`'s.

Increment the large integer by one and return *the resulting array of digits*.

### Input Format
- First line: integer \`n\` (number of digits).
- Second line: \`n\` space-separated digits.

### Output Format
Print the resulting digits space-separated.

### Example 1
**Input:**
\`\`\`text
3
1 2 3
\`\`\`
**Output:**
\`\`\`text
1 2 4
\`\`\`
**Explanation:** The array represents the integer 123. Incrementing by one gives 123 + 1 = 124.

### Example 2
**Input:**
\`\`\`text
1
9
\`\`\`
**Output:**
\`\`\`text
1 0
\`\`\`
**Explanation:** 9 + 1 = 10.

### Constraints
- \`1 <= digits.length <= 100\`
- \`0 <= digits[i] <= 9\`
- \`digits\` does not contain any leading \`0\`'s.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> d(n);
        for (int i = 0; i < n; i++) cin >> d[i];
        int carry = 1;
        for (int i = n - 1; i >= 0 && carry; i--) {
            int sum = d[i] + carry;
            d[i] = sum % 10;
            carry = sum / 10;
        }
        if (carry) d.insert(d.begin(), 1);
        for (size_t i = 0; i < d.size(); i++) {
            cout << d[i] << (i + 1 < d.size() ? " " : "\\n");
        }
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] d = new int[n];
            for (int i = 0; i < n; i++) d[i] = sc.nextInt();
            for (int i = n - 1; i >= 0; i--) {
                if (d[i] < 9) {
                    d[i]++;
                    for (int j = 0; j < n; j++) {
                        System.out.print(d[j] + (j + 1 < n ? " " : "\n"));
                    }
                    return;
                }
                d[i] = 0;
            }
            int[] res = new int[n + 1];
            res[0] = 1;
            for (int j = 0; j <= n; j++) {
                System.out.print(res[j] + (j < n ? " " : "\n"));
            }
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    d = list(map(int, tokens[1:n+1]))
    num = int("".join(map(str, d))) + 1
    print(" ".join(str(num)))

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '3\n1 2 3', expected_output: '1 2 4', is_sample: true },
      { input: '1\n9', expected_output: '1 0', is_sample: true },
      { input: '4\n4 3 2 1', expected_output: '4 3 2 2', is_sample: false },
      { input: '3\n9 9 9', expected_output: '1 0 0 0', is_sample: false }
    ]
  },
  {
    slug: 'find-pivot-index',
    title: 'Find Pivot Index',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an array of integers \`nums\`, calculate the **pivot index** of this array.

The **pivot index** is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the index's right.

If the index is on the left edge of the array, then the left sum is \`0\` because there are no elements to the left. This also applies to the right edge of the array.

Return *the leftmost pivot index*. If no such index exists, return \`-1\`.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers.

### Output Format
Print the leftmost pivot index, or \`-1\`.

### Example 1
**Input:**
\`\`\`text
6
1 7 3 6 5 6
\`\`\`
**Output:**
\`\`\`text
3
\`\`\`
**Explanation:**
The pivot index is 3.
Left sum = nums[0] + nums[1] + nums[2] = 1 + 7 + 3 = 11
Right sum = nums[4] + nums[5] = 5 + 6 = 11

### Example 2
**Input:**
\`\`\`text
3
1 2 3
\`\`\`
**Output:**
\`\`\`text
-1
\`\`\`

### Constraints
- \`1 <= nums.length <= 10^4\`
- \`-1000 <= nums[i] <= 1000\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> a(n);
        long long total = 0;
        for (int i = 0; i < n; i++) { cin >> a[i]; total += a[i]; }
        long long left = 0;
        int ans = -1;
        for (int i = 0; i < n; i++) {
            if (left == total - left - a[i]) { ans = i; break; }
            left += a[i];
        }
        cout << ans << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            long total = 0;
            for (int i = 0; i < n; i++) { a[i] = sc.nextInt(); total += a[i]; }
            long left = 0;
            int ans = -1;
            for (int i = 0; i < n; i++) {
                if (left == total - left - a[i]) { ans = i; break; }
                left += a[i];
            }
            System.out.println(ans);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    a = list(map(int, tokens[1:n+1]))
    total = sum(a)
    left = 0
    ans = -1
    for i, x in enumerate(a):
        if left == total - left - x:
            ans = i
            break
        left += x
    print(ans)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '6\n1 7 3 6 5 6', expected_output: '3', is_sample: true },
      { input: '3\n1 2 3', expected_output: '-1', is_sample: true },
      { input: '3\n2 1 -1', expected_output: '0', is_sample: false },
      { input: '1\n5', expected_output: '0', is_sample: false }
    ]
  },
  {
    slug: 'house-robber',
    title: 'House Robber',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array \`nums\` representing the amount of money of each house, return *the maximum amount of money you can rob tonight **without alerting the police***.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers representing money in each house.

### Output Format
Print the maximum money you can rob.

### Example 1
**Input:**
\`\`\`text
4
1 2 3 1
\`\`\`
**Output:**
\`\`\`text
4
\`\`\`
**Explanation:** Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4.

### Example 2
**Input:**
\`\`\`text
5
2 7 9 3 1
\`\`\`
**Output:**
\`\`\`text
12
\`\`\`
**Explanation:** Rob house 1 (money = 2), house 3 (money = 9) and house 5 (money = 1). Total = 2 + 9 + 1 = 12.

### Constraints
- \`1 <= nums.length <= 100\`
- \`0 <= nums[i] <= 400\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        if (n == 1) { cout << a[0] << "\\n"; return 0; }
        int prev2 = 0, prev1 = 0;
        for (int x : a) {
            int cur = max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        cout << prev1 << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int prev2 = 0, prev1 = 0;
            for (int i = 0; i < n; i++) {
                int x = sc.nextInt();
                int cur = Math.max(prev1, prev2 + x);
                prev2 = prev1;
                prev1 = cur;
            }
            System.out.println(prev1);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    a = list(map(int, tokens[1:n+1]))
    prev2, prev1 = 0, 0
    for x in a:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    print(prev1)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '4\n1 2 3 1', expected_output: '4', is_sample: true },
      { input: '5\n2 7 9 3 1', expected_output: '12', is_sample: true },
      { input: '1\n50', expected_output: '50', is_sample: false },
      { input: '6\n10 2 3 20 5 1', expected_output: '31', is_sample: false }
    ]
  },
  {
    slug: 'jump-game',
    title: 'Jump Game',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

You are given an integer array \`nums\`. You are initially positioned at the array's **first index**, and each element in the array represents your maximum jump length at that position.

Return **\`true\`** if you can reach the last index, or **\`false\`** otherwise.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers.

### Output Format
Print \`true\` or \`false\`.

### Example 1
**Input:**
\`\`\`text
5
2 3 1 1 4
\`\`\`
**Output:**
\`\`\`text
true
\`\`\`
**Explanation:** Jump 1 step from index 0 to 1, then 3 steps to the last index.

### Example 2
**Input:**
\`\`\`text
5
3 2 1 0 4
\`\`\`
**Output:**
\`\`\`text
false
\`\`\`
**Explanation:** You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.

### Constraints
- \`1 <= nums.length <= 10^4\`
- \`0 <= nums[i] <= 10^5\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        int maxReach = 0;
        bool ok = true;
        for (int i = 0; i < n; i++) {
            if (i > maxReach) { ok = false; break; }
            maxReach = max(maxReach, i + a[i]);
            if (maxReach >= n - 1) break;
        }
        cout << (ok ? "true" : "false") << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = sc.nextInt();
            int maxReach = 0;
            boolean ok = true;
            for (int i = 0; i < n; i++) {
                if (i > maxReach) { ok = false; break; }
                maxReach = Math.max(maxReach, i + a[i]);
                if (maxReach >= n - 1) break;
            }
            System.out.println(ok ? "true" : "false");
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    a = list(map(int, tokens[1:n+1]))
    max_reach = 0
    ok = True
    for i in range(n):
        if i > max_reach:
            ok = False
            break
        max_reach = max(max_reach, i + a[i])
        if max_reach >= n - 1:
            break
    print("true" if ok else "false")

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '5\n2 3 1 1 4', expected_output: 'true', is_sample: true },
      { input: '5\n3 2 1 0 4', expected_output: 'false', is_sample: true },
      { input: '1\n0', expected_output: 'true', is_sample: false },
      { input: '4\n0 2 3 4', expected_output: 'false', is_sample: false },
      { input: '6\n2 0 0 1 0 0', expected_output: 'false', is_sample: false }
    ]
  },
  {
    slug: 'product-of-array-except-self',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

Given an integer array \`nums\`, return *an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`*.

The product of any prefix or suffix of \`nums\` is **guaranteed** to fit in a **32-bit** integer.

You must write an algorithm that runs in \`O(n)\` time and without using the division operation.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers.

### Output Format
Print \`n\` space-separated integers representing the answer array.

### Example 1
**Input:**
\`\`\`text
4
1 2 3 4
\`\`\`
**Output:**
\`\`\`text
24 12 8 6
\`\`\`

### Example 2
**Input:**
\`\`\`text
5
-1 1 0 -3 3
\`\`\`
**Output:**
\`\`\`text
0 0 9 0 0
\`\`\`

### Constraints
- \`2 <= nums.length <= 10^5\`
- \`-30 <= nums[i] <= 30\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> a(n), ans(n, 1);
        for (int i = 0; i < n; i++) cin >> a[i];
        long long prefix = 1;
        for (int i = 0; i < n; i++) {
            ans[i] = prefix;
            prefix *= a[i];
        }
        long long suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            ans[i] *= suffix;
            suffix *= a[i];
        }
        for (int i = 0; i < n; i++) {
            cout << ans[i] << (i + 1 < n ? " " : "\\n");
        }
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            int[] ans = new int[n];
            for (int i = 0; i < n; i++) a[i] = sc.nextInt();
            int prefix = 1;
            for (int i = 0; i < n; i++) {
                ans[i] = prefix;
                prefix *= a[i];
            }
            int suffix = 1;
            for (int i = n - 1; i >= 0; i--) {
                ans[i] *= suffix;
                suffix *= a[i];
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
    a = list(map(int, tokens[1:n+1]))
    ans = [1] * n
    prefix = 1
    for i in range(n):
        ans[i] = prefix
        prefix *= a[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        ans[i] *= suffix
        suffix *= a[i]
    print(" ".join(map(str, ans)))

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '4\n1 2 3 4', expected_output: '24 12 8 6', is_sample: true },
      { input: '5\n-1 1 0 -3 3', expected_output: '0 0 9 0 0', is_sample: true },
      { input: '2\n5 2', expected_output: '2 5', is_sample: false },
      { input: '3\n0 0 2', expected_output: '0 0 0', is_sample: false }
    ]
  },
  {
    slug: 'container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers representing heights.

### Output Format
Print the maximum water area.

### Example 1
**Input:**
\`\`\`text
9
1 8 6 2 5 4 8 3 7
\`\`\`
**Output:**
\`\`\`text
49
\`\`\`
**Explanation:** The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49 (between index 1 and 8: width = 7, min height = 7, area = 49).

### Example 2
**Input:**
\`\`\`text
2
1 1
\`\`\`
**Output:**
\`\`\`text
1
\`\`\`

### Constraints
- \`n == height.length\`
- \`2 <= n <= 10^5\`
- \`0 <= height[i] <= 10^4\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> h(n);
        for (int i = 0; i < n; i++) cin >> h[i];
        int l = 0, r = n - 1;
        long long maxArea = 0;
        while (l < r) {
            long long area = 1LL * min(h[l], h[r]) * (r - l);
            maxArea = max(maxArea, area);
            if (h[l] < h[r]) l++;
            else r--;
        }
        cout << maxArea << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] h = new int[n];
            for (int i = 0; i < n; i++) h[i] = sc.nextInt();
            int l = 0, r = n - 1;
            long maxArea = 0;
            while (l < r) {
                long area = (long) Math.min(h[l], h[r]) * (r - l);
                maxArea = Math.max(maxArea, area);
                if (h[l] < h[r]) l++;
                else r--;
            }
            System.out.println(maxArea);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    h = list(map(int, tokens[1:n+1]))
    l, r = 0, n - 1
    max_area = 0
    while l < r:
        area = min(h[l], h[r]) * (r - l)
        if area > max_area:
            max_area = area
        if h[l] < h[r]:
            l += 1
        else:
            r -= 1
    print(max_area)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '9\n1 8 6 2 5 4 8 3 7', expected_output: '49', is_sample: true },
      { input: '2\n1 1', expected_output: '1', is_sample: true },
      { input: '5\n4 3 2 1 4', expected_output: '16', is_sample: false },
      { input: '3\n1 2 1', expected_output: '2', is_sample: false }
    ]
  },
  {
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    points: 300,
    description: `## Problem Statement

Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers representing the elevation map.

### Output Format
Print the total units of trapped rain water.

### Example 1
**Input:**
\`\`\`text
12
0 1 0 2 1 0 1 3 2 1 2 1
\`\`\`
**Output:**
\`\`\`text
6
\`\`\`
**Explanation:** The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.

### Example 2
**Input:**
\`\`\`text
6
4 2 0 3 2 5
\`\`\`
**Output:**
\`\`\`text
9
\`\`\`

### Constraints
- \`n == height.length\`
- \`1 <= n <= 2 * 10^4\`
- \`0 <= height[i] <= 10^5\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> h(n);
        for (int i = 0; i < n; i++) cin >> h[i];
        int l = 0, r = n - 1;
        int leftMax = 0, rightMax = 0;
        long long water = 0;
        while (l < r) {
            if (h[l] < h[r]) {
                if (h[l] >= leftMax) leftMax = h[l];
                else water += leftMax - h[l];
                l++;
            } else {
                if (h[r] >= rightMax) rightMax = h[r];
                else water += rightMax - h[r];
                r--;
            }
        }
        cout << water << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] h = new int[n];
            for (int i = 0; i < n; i++) h[i] = sc.nextInt();
            int l = 0, r = n - 1;
            int leftMax = 0, rightMax = 0;
            long water = 0;
            while (l < r) {
                if (h[l] < h[r]) {
                    if (h[l] >= leftMax) leftMax = h[l];
                    else water += leftMax - h[l];
                    l++;
                } else {
                    if (h[r] >= rightMax) rightMax = h[r];
                    else water += rightMax - h[r];
                    r--;
                }
            }
            System.out.println(water);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    h = list(map(int, tokens[1:n+1]))
    l, r = 0, n - 1
    left_max = right_max = water = 0
    while l < r:
        if h[l] < h[r]:
            if h[l] >= left_max:
                left_max = h[l]
            else:
                water += left_max - h[l]
            l += 1
        else:
            if h[r] >= right_max:
                right_max = h[r]
            else:
                water += right_max - h[r]
            r -= 1
    print(water)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expected_output: '6', is_sample: true },
      { input: '6\n4 2 0 3 2 5', expected_output: '9', is_sample: true },
      { input: '3\n3 0 3', expected_output: '3', is_sample: false },
      { input: '1\n10', expected_output: '0', is_sample: false },
      { input: '5\n5 4 3 2 1', expected_output: '0', is_sample: false }
    ]
  },
  {
    slug: 'first-missing-positive',
    title: 'First Missing Positive',
    difficulty: 'Hard',
    points: 300,
    description: `## Problem Statement

Given an unsorted integer array \`nums\`, return the *smallest positive integer* that is not present in \`nums\`.

You must implement an algorithm that runs in \`O(n)\` time and uses \`O(1)\` auxiliary space.

### Input Format
- First line: integer \`n\`.
- Second line: \`n\` space-separated integers.

### Output Format
Print the smallest missing positive integer.

### Example 1
**Input:**
\`\`\`text
3
1 2 0
\`\`\`
**Output:**
\`\`\`text
3
\`\`\`
**Explanation:** The numbers in the range [1,2] are all in the array, so the next smallest positive integer is 3.

### Example 2
**Input:**
\`\`\`text
4
3 4 -1 1
\`\`\`
**Output:**
\`\`\`text
2
\`\`\`
**Explanation:** 1 is in the array, but 2 is missing.

### Constraints
- \`1 <= nums.length <= 10^5\`
- \`-2^31 <= nums[i] <= 2^31 - 1\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        for (int i = 0; i < n; i++) {
            while (a[i] > 0 && a[i] <= n && a[a[i] - 1] != a[i]) {
                swap(a[i], a[a[i] - 1]);
            }
        }
        int ans = n + 1;
        for (int i = 0; i < n; i++) {
            if (a[i] != i + 1) { ans = i + 1; break; }
        }
        cout << ans << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = sc.nextInt();
            for (int i = 0; i < n; i++) {
                while (a[i] > 0 && a[i] <= n && a[a[i] - 1] != a[i]) {
                    int tmp = a[a[i] - 1];
                    a[a[i] - 1] = a[i];
                    a[i] = tmp;
                }
            }
            int ans = n + 1;
            for (int i = 0; i < n; i++) {
                if (a[i] != i + 1) { ans = i + 1; break; }
            }
            System.out.println(ans);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    a = list(map(int, tokens[1:n+1]))
    for i in range(n):
        while 1 <= a[i] <= n and a[a[i] - 1] != a[i]:
            dest = a[i] - 1
            a[i], a[dest] = a[dest], a[i]
    ans = n + 1
    for i in range(n):
        if a[i] != i + 1:
            ans = i + 1
            break
    print(ans)

if __name__ == '__main__':
    main()`
    },
    test_cases: [
      { input: '3\n1 2 0', expected_output: '3', is_sample: true },
      { input: '4\n3 4 -1 1', expected_output: '2', is_sample: true },
      { input: '5\n7 8 9 11 12', expected_output: '1', is_sample: false },
      { input: '1\n1', expected_output: '2', is_sample: false },
      { input: '1\n2', expected_output: '1', is_sample: false }
    ]
  }
];

async function main() {
  console.log(`\n🚀 Seeding ${problems.length} new curated algorithmic problems...`);

  let added = 0;
  for (const p of problems) {
    // Check if slug exists
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
      console.log(`  ↻ Updated: ${p.title} (${p.difficulty})`);
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

    // Clean and insert test cases
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

  // Count total in DB
  const countRes = await req('GET', '/problems?select=id');
  const total = Array.isArray(countRes.body) ? countRes.body.length : 'unknown';

  console.log(`\n🎉 Success! Added ${added} new problems.`);
  console.log(`📊 Total problems currently in database: ${total}`);
}

main().catch(console.error);
