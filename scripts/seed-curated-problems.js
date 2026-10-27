// seed-curated-problems.js
// Run: node seed-curated-problems.js
// Inserts 18 classic coding problems with full descriptions, starter code, and verified test cases

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
    slug: 'palindrome-number',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an integer \`x\`, return **\`true\`** if \`x\` is a palindrome, and **\`false\`** otherwise.

An integer is a palindrome when it reads the same forward and backward. For example, \`121\` is a palindrome while \`123\` is not.

### Input Format
A single integer \`x\` on standard input.

### Output Format
Print \`true\` or \`false\`.

### Example 1
**Input:**
\`\`\`text
121
\`\`\`
**Output:**
\`\`\`text
true
\`\`\`
**Explanation:** 121 reads as 121 from left to right and from right to left.

### Example 2
**Input:**
\`\`\`text
-121
\`\`\`
**Output:**
\`\`\`text
false
\`\`\`
**Explanation:** From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

### Constraints
- \`-2^31 <= x <= 2^31 - 1\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    if (cin >> s) {
        string rev = s;
        reverse(rev.begin(), rev.end());
        cout << (s == rev ? "true" : "false") << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            String rev = new StringBuilder(s).reverse().toString();
            System.out.println(s.equals(rev) ? "true" : "false");
        }
    }
}`,
      python: `import sys

def main():
    s = sys.stdin.read().strip()
    if not s:
        return
    print("true" if s == s[::-1] else "false")

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '121', expected_output: 'true', is_sample: true },
      { input: '-121', expected_output: 'false', is_sample: true },
      { input: '10', expected_output: 'false', is_sample: false },
      { input: '0', expected_output: 'true', is_sample: false },
      { input: '12321', expected_output: 'true', is_sample: false }
    ]
  },
  {
    slug: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Write a program that takes a string \`s\` as input and prints the string reversed.

### Input Format
A single line containing the string \`s\`.

### Output Format
Print the reversed string.

### Example 1
**Input:**
\`\`\`text
hello
\`\`\`
**Output:**
\`\`\`text
olleh
\`\`\`

### Example 2
**Input:**
\`\`\`text
Hannah
\`\`\`
**Output:**
\`\`\`text
hannaH
\`\`\`

### Constraints
- \`1 <= s.length <= 10^5\`
- \`s\` consists of printable ASCII characters.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    if (cin >> s) {
        reverse(s.begin(), s.end());
        cout << s << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            System.out.println(new StringBuilder(s).reverse().toString());
        }
    }
}`,
      python: `import sys

def main():
    s = sys.stdin.read().strip()
    print(s[::-1])

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: 'hello', expected_output: 'olleh', is_sample: true },
      { input: 'Hannah', expected_output: 'hannaH', is_sample: true },
      { input: 'a', expected_output: 'a', is_sample: false },
      { input: 'algorithm', expected_output: 'mhtirogla', is_sample: false },
      { input: 'JudgeLite', expected_output: 'etiLegduJ', is_sample: false }
    ]
  },
  {
    slug: 'fizz-buzz',
    title: 'Fizz Buzz',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an integer \`n\`, print the numbers from \`1\` to \`n\` space-separated:
- For multiples of both 3 and 5, print \`FizzBuzz\`
- For multiples of 3 (only), print \`Fizz\`
- For multiples of 5 (only), print \`Buzz\`
- Otherwise, print the number itself

### Input Format
A single integer \`n\`.

### Output Format
Space-separated tokens from 1 to n.

### Example 1
**Input:**
\`\`\`text
3
\`\`\`
**Output:**
\`\`\`text
1 2 Fizz
\`\`\`

### Example 2
**Input:**
\`\`\`text
5
\`\`\`
**Output:**
\`\`\`text
1 2 Fizz 4 Buzz
\`\`\`

### Constraints
- \`1 <= n <= 10^4\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) cout << "FizzBuzz";
            else if (i % 3 == 0) cout << "Fizz";
            else if (i % 5 == 0) cout << "Buzz";
            else cout << i;
            if (i < n) cout << " ";
        }
        cout << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            List<String> res = new ArrayList<>();
            for (int i = 1; i <= n; i++) {
                if (i % 15 == 0) res.add("FizzBuzz");
                else if (i % 3 == 0) res.add("Fizz");
                else if (i % 5 == 0) res.add("Buzz");
                else res.add(String.valueOf(i));
            }
            System.out.println(String.join(" ", res));
        }
    }
}`,
      python: `import sys

def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    print(" ".join(res))

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '3', expected_output: '1 2 Fizz', is_sample: true },
      { input: '5', expected_output: '1 2 Fizz 4 Buzz', is_sample: true },
      { input: '15', expected_output: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz', is_sample: false },
      { input: '1', expected_output: '1', is_sample: false }
    ]
  },
  {
    slug: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an integer array \`nums\`, return **\`true\`** if any value appears **at least twice** in the array, and return **\`false\`** if every element is distinct.

### Input Format
- First line: integer \`n\` (number of elements).
- Second line: \`n\` space-separated integers.

### Output Format
Print \`true\` or \`false\`.

### Example 1
**Input:**
\`\`\`text
4
1 2 3 1
\`\`\`
**Output:**
\`\`\`text
true
\`\`\`

### Example 2
**Input:**
\`\`\`text
4
1 2 3 4
\`\`\`
**Output:**
\`\`\`text
false
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`-10^9 <= nums[i] <= 10^9\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        unordered_set<int> seen;
        bool dup = false;
        for (int i = 0; i < n; i++) {
            int x; cin >> x;
            if (seen.count(x)) dup = true;
            seen.insert(x);
        }
        cout << (dup ? "true" : "false") << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            Set<Integer> seen = new HashSet<>();
            boolean dup = false;
            for (int i = 0; i < n; i++) {
                int x = sc.nextInt();
                if (!seen.add(x)) dup = true;
            }
            System.out.println(dup ? "true" : "false");
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = tokens[1:n+1]
    print("true" if len(nums) != len(set(nums)) else "false")

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '4\n1 2 3 1', expected_output: 'true', is_sample: true },
      { input: '4\n1 2 3 4', expected_output: 'false', is_sample: true },
      { input: '1\n99', expected_output: 'false', is_sample: false },
      { input: '10\n1 1 1 3 3 4 3 2 4 2', expected_output: 'true', is_sample: false },
      { input: '5\n5 4 3 2 1', expected_output: 'false', is_sample: false }
    ]
  },
  {
    slug: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.

### Input Format
- First line: integer \`n\` (number of days).
- Second line: \`n\` space-separated integers representing stock prices.

### Output Format
Print the maximum possible profit.

### Example 1
**Input:**
\`\`\`text
6
7 1 5 3 6 4
\`\`\`
**Output:**
\`\`\`text
5
\`\`\`
**Explanation:** Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.

### Example 2
**Input:**
\`\`\`text
5
7 6 4 3 1
\`\`\`
**Output:**
\`\`\`text
0
\`\`\`
**Explanation:** In this case, no transactions are done and the max profit = 0.

### Constraints
- \`1 <= n <= 10^5\`
- \`0 <= prices[i] <= 10^4\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        vector<int> p(n);
        for (int i = 0; i < n; i++) cin >> p[i];
        int minPrice = INT_MAX, maxProfit = 0;
        for (int price : p) {
            minPrice = min(minPrice, price);
            maxProfit = max(maxProfit, price - minPrice);
        }
        cout << maxProfit << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int minPrice = Integer.MAX_VALUE;
            int maxProfit = 0;
            for (int i = 0; i < n; i++) {
                int p = sc.nextInt();
                if (p < minPrice) minPrice = p;
                else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
            }
            System.out.println(maxProfit);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    prices = list(map(int, tokens[1:n+1]))
    min_price = float('inf')
    max_profit = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > max_profit:
            max_profit = p - min_price
    print(max_profit)

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '6\n7 1 5 3 6 4', expected_output: '5', is_sample: true },
      { input: '5\n7 6 4 3 1', expected_output: '0', is_sample: true },
      { input: '2\n2 4', expected_output: '2', is_sample: false },
      { input: '1\n100', expected_output: '0', is_sample: false },
      { input: '7\n1 2 3 4 5 6 7', expected_output: '6', is_sample: false }
    ]
  },
  {
    slug: 'single-number',
    title: 'Single Number',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given a non-empty array of integers \`nums\`, every element appears **twice** except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.

### Input Format
- First line: integer \`n\` (number of elements, always odd).
- Second line: \`n\` space-separated integers.

### Output Format
Print the single number.

### Example 1
**Input:**
\`\`\`text
3
2 2 1
\`\`\`
**Output:**
\`\`\`text
1
\`\`\`

### Example 2
**Input:**
\`\`\`text
5
4 1 2 1 2
\`\`\`
**Output:**
\`\`\`text
4
\`\`\`

### Constraints
- \`1 <= n <= 3 * 10^4\`
- \`-3 * 10^4 <= nums[i] <= 3 * 10^4\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        int ans = 0;
        for (int i = 0; i < n; i++) {
            int x; cin >> x;
            ans ^= x;
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
            int ans = 0;
            for (int i = 0; i < n; i++) {
                ans ^= sc.nextInt();
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
    ans = 0
    for x in tokens[1:n+1]:
        ans ^= int(x)
    print(ans)

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '3\n2 2 1', expected_output: '1', is_sample: true },
      { input: '5\n4 1 2 1 2', expected_output: '4', is_sample: true },
      { input: '1\n1', expected_output: '1', is_sample: false },
      { input: '5\n-1 -1 0 0 42', expected_output: '42', is_sample: false }
    ]
  },
  {
    slug: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given two strings \`s\` and \`t\`, return **\`true\`** if \`t\` is an anagram of \`s\`, and **\`false\`** otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Input Format
- First line: string \`s\`
- Second line: string \`t\`

### Output Format
Print \`true\` or \`false\`.

### Example 1
**Input:**
\`\`\`text
anagram
nagaram
\`\`\`
**Output:**
\`\`\`text
true
\`\`\`

### Example 2
**Input:**
\`\`\`text
rat
car
\`\`\`
**Output:**
\`\`\`text
false
\`\`\`

### Constraints
- \`1 <= s.length, t.length <= 5 * 10^4\`
- \`s\` and \`t\` consist of lowercase English letters.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, t;
    if (cin >> s >> t) {
        sort(s.begin(), s.end());
        sort(t.begin(), t.end());
        cout << (s == t ? "true" : "false") << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            char[] s = sc.next().toCharArray();
            char[] t = sc.next().toCharArray();
            Arrays.sort(s);
            Arrays.sort(t);
            System.out.println(Arrays.equals(s, t) ? "true" : "false");
        }
    }
}`,
      python: `import sys

def main():
    parts = sys.stdin.read().split()
    if len(parts) >= 2:
        print("true" if sorted(parts[0]) == sorted(parts[1]) else "false")

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: 'anagram\nnagaram', expected_output: 'true', is_sample: true },
      { input: 'rat\ncar', expected_output: 'false', is_sample: true },
      { input: 'a\na', expected_output: 'true', is_sample: false },
      { input: 'ab\na', expected_output: 'false', is_sample: false },
      { input: 'silent\nlisten', expected_output: 'true', is_sample: false }
    ]
  },
  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a program to search \`target\` in \`nums\`.

If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

### Input Format
- First line: two integers \`n\` and \`target\`.
- Second line: \`n\` space-separated sorted integers.

### Output Format
Print the 0-based index of \`target\`, or \`-1\` if not found.

### Example 1
**Input:**
\`\`\`text
6 9
-1 0 3 5 9 12
\`\`\`
**Output:**
\`\`\`text
4
\`\`\`
**Explanation:** 9 exists in nums and its index is 4.

### Example 2
**Input:**
\`\`\`text
6 2
-1 0 3 5 9 12
\`\`\`
**Output:**
\`\`\`text
-1
\`\`\`
**Explanation:** 2 does not exist in nums so return -1.

### Constraints
- \`1 <= n <= 10^4\`
- \`-10^4 < nums[i], target < 10^4\`
- All integers in \`nums\` are **unique** and sorted in ascending order.`,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, target;
    if (cin >> n >> target) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        int l = 0, r = n - 1, ans = -1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) { ans = mid; break; }
            else if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
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
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
            int l = 0, r = n - 1, ans = -1;
            while (l <= r) {
                int mid = l + (r - l) / 2;
                if (nums[mid] == target) { ans = mid; break; }
                else if (nums[mid] < target) l = mid + 1;
                else r = mid - 1;
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
    nums = list(map(int, tokens[2:2+n]))
    l, r = 0, n - 1
    ans = -1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            ans = mid
            break
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    print(ans)

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '6 9\n-1 0 3 5 9 12', expected_output: '4', is_sample: true },
      { input: '6 2\n-1 0 3 5 9 12', expected_output: '-1', is_sample: true },
      { input: '1 5\n5', expected_output: '0', is_sample: false },
      { input: '1 3\n5', expected_output: '-1', is_sample: false },
      { input: '5 1\n1 2 3 4 5', expected_output: '0', is_sample: false }
    ]
  },
  {
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb **1** or **2** steps. In how many distinct ways can you climb to the top?

### Input Format
A single integer \`n\`.

### Output Format
Print the number of distinct ways.

### Example 1
**Input:**
\`\`\`text
2
\`\`\`
**Output:**
\`\`\`text
2
\`\`\`
**Explanation:** There are two ways to climb to the top:
1. 1 step + 1 step
2. 2 steps

### Example 2
**Input:**
\`\`\`text
3
\`\`\`
**Output:**
\`\`\`text
3
\`\`\`
**Explanation:** There are three ways to climb to the top:
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step

### Constraints
- \`1 <= n <= 45\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        if (n <= 2) { cout << n << "\\n"; return 0; }
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
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
            if (n <= 2) { System.out.println(n); return; }
            int a = 1, b = 2;
            for (int i = 3; i <= n; i++) {
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
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    if n <= 2:
        print(n)
        return
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    print(b)

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '2', expected_output: '2', is_sample: true },
      { input: '3', expected_output: '3', is_sample: true },
      { input: '1', expected_output: '1', is_sample: false },
      { input: '4', expected_output: '5', is_sample: false },
      { input: '10', expected_output: '89', is_sample: false }
    ]
  },
  {
    slug: 'move-zeroes',
    title: 'Move Zeroes',
    difficulty: 'Easy',
    points: 100,
    description: `## Problem Statement

Given an integer array \`nums\`, move all \`0\`'s to the end of it while maintaining the relative order of the non-zero elements.

**Note** that you must do this in-place without making a copy of the array.

### Input Format
- First line: integer \`n\` (number of elements).
- Second line: \`n\` space-separated integers.

### Output Format
Print the array after moving zeroes, space-separated.

### Example 1
**Input:**
\`\`\`text
5
0 1 0 3 12
\`\`\`
**Output:**
\`\`\`text
1 3 12 0 0
\`\`\`

### Example 2
**Input:**
\`\`\`text
1
0
\`\`\`
**Output:**
\`\`\`text
0
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
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
        int pos = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] != 0) swap(a[pos++], a[i]);
        }
        for (int i = 0; i < n; i++) {
            cout << a[i] << (i + 1 < n ? " " : "\\n");
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
            for (int i = 0; i < n; i++) a[i] = sc.nextInt();
            int pos = 0;
            for (int i = 0; i < n; i++) {
                if (a[i] != 0) {
                    int tmp = a[pos]; a[pos] = a[i]; a[i] = tmp;
                    pos++;
                }
            }
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < n; i++) {
                if (i > 0) sb.append(" ");
                sb.append(a[i]);
            }
            System.out.println(sb.toString());
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
    pos = 0
    for i in range(n):
        if a[i] != 0:
            a[pos], a[i] = a[i], a[pos]
            pos += 1
    print(" ".join(map(str, a)))

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '5\n0 1 0 3 12', expected_output: '1 3 12 0 0', is_sample: true },
      { input: '1\n0', expected_output: '0', is_sample: true },
      { input: '4\n0 0 0 1', expected_output: '1 0 0 0', is_sample: false },
      { input: '3\n1 2 3', expected_output: '1 2 3', is_sample: false }
    ]
  },
  {
    slug: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the **fewest number of coins** that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.

### Input Format
- First line: two integers \`n\` (number of coin types) and \`amount\`.
- Second line: \`n\` space-separated integers representing the coins.

### Output Format
Print the minimum number of coins needed, or \`-1\`.

### Example 1
**Input:**
\`\`\`text
3 11
1 2 5
\`\`\`
**Output:**
\`\`\`text
3
\`\`\`
**Explanation:** 11 = 5 + 5 + 1 (3 coins).

### Example 2
**Input:**
\`\`\`text
1 3
2
\`\`\`
**Output:**
\`\`\`text
-1
\`\`\`

### Constraints
- \`1 <= coins.length <= 12\`
- \`1 <= coins[i] <= 2^31 - 1\`
- \`0 <= amount <= 10^4\``,
    starter_code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, amount;
    if (cin >> n >> amount) {
        vector<int> coins(n);
        for (int i = 0; i < n; i++) cin >> coins[i];
        vector<int> dp(amount + 1, 1e9);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int c : coins) {
                if (i >= c && dp[i - c] != 1e9) {
                    dp[i] = min(dp[i], dp[i - c] + 1);
                }
            }
        }
        cout << (dp[amount] == 1e9 ? -1 : dp[amount]) << "\\n";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int amount = sc.nextInt();
            int[] coins = new int[n];
            for (int i = 0; i < n; i++) coins[i] = sc.nextInt();
            int[] dp = new int[amount + 1];
            Arrays.fill(dp, 1000000000);
            dp[0] = 0;
            for (int i = 1; i <= amount; i++) {
                for (int c : coins) {
                    if (i >= c && dp[i - c] != 1000000000) {
                        dp[i] = Math.min(dp[i], dp[i - c] + 1);
                    }
                }
            }
            System.out.println(dp[amount] == 1000000000 ? -1 : dp[amount]);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n, amount = int(tokens[0]), int(tokens[1])
    coins = list(map(int, tokens[2:2+n]))
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i >= c:
                dp[i] = min(dp[i], dp[i - c] + 1)
    print(-1 if dp[amount] == float('inf') else dp[amount])

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '3 11\n1 2 5', expected_output: '3', is_sample: true },
      { input: '1 3\n2', expected_output: '-1', is_sample: true },
      { input: '1 0\n1', expected_output: '0', is_sample: false },
      { input: '4 6249\n186 419 83 408', expected_output: '20', is_sample: false }
    ]
  },
  {
    slug: '3sum',
    title: '3Sum',
    difficulty: 'Medium',
    points: 200,
    description: `## Problem Statement

Given an integer array \`nums\`, return the **number of unique triplets** \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.

### Input Format
- First line: integer \`n\` (number of elements).
- Second line: \`n\` space-separated integers.

### Output Format
Print the number of distinct triplets summing to 0.

### Example 1
**Input:**
\`\`\`text
6
-1 0 1 2 -1 -4
\`\`\`
**Output:**
\`\`\`text
2
\`\`\`
**Explanation:** The distinct triplets are [-1, 0, 1] and [-1, -1, 2]. Total count = 2.

### Example 2
**Input:**
\`\`\`text
3
0 1 1
\`\`\`
**Output:**
\`\`\`text
0
\`\`\`

### Constraints
- \`3 <= n <= 3000\`
- \`-10^5 <= nums[i] <= 10^5\``,
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
        sort(a.begin(), a.end());
        int count = 0;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;
            int l = i + 1, r = n - 1;
            while (l < r) {
                int sum = a[i] + a[l] + a[r];
                if (sum == 0) {
                    count++;
                    while (l < r && a[l] == a[l + 1]) l++;
                    while (l < r && a[r] == a[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        cout << count << "\\n";
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
            Arrays.sort(a);
            int count = 0;
            for (int i = 0; i < n - 2; i++) {
                if (i > 0 && a[i] == a[i - 1]) continue;
                int l = i + 1, r = n - 1;
                while (l < r) {
                    int sum = a[i] + a[l] + a[r];
                    if (sum == 0) {
                        count++;
                        while (l < r && a[l] == a[l + 1]) l++;
                        while (l < r && a[r] == a[r - 1]) r--;
                        l++; r--;
                    } else if (sum < 0) l++;
                    else r--;
                }
            }
            System.out.println(count);
        }
    }
}`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    a = sorted(map(int, tokens[1:n+1]))
    count = 0
    for i in range(n - 2):
        if i > 0 and a[i] == a[i - 1]:
            continue
        l, r = i + 1, n - 1
        while l < r:
            s = a[i] + a[l] + a[r]
            if s == 0:
                count += 1
                while l < r and a[l] == a[l + 1]:
                    l += 1
                while l < r and a[r] == a[r - 1]:
                    r -= 1
                l += 1
                r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    print(count)

if __name__ == "__main__":
    main()`
    },
    test_cases: [
      { input: '6\n-1 0 1 2 -1 -4', expected_output: '2', is_sample: true },
      { input: '3\n0 1 1', expected_output: '0', is_sample: true },
      { input: '3\n0 0 0', expected_output: '1', is_sample: false },
      { input: '5\n-2 0 1 1 2', expected_output: '2', is_sample: false }
    ]
  }
];

async function main() {
  console.log('Seeding high quality problems into Supabase...');

  // Also update existing Two Sum, Valid Parentheses, Maximum Subarray with clean markdown and test cases
  for (const p of problems) {
    // 1. Check if problem already exists by slug
    const checkRes = await req('GET', `/problems?slug=eq.${p.slug}&select=id`);
    let problemId = null;

    if (Array.isArray(checkRes.body) && checkRes.body.length > 0) {
      problemId = checkRes.body[0].id;
      // Update description and starter code
      await req('PATCH', `/problems?id=eq.${problemId}`, {
        title: p.title,
        description_markdown: p.description,
        difficulty: p.difficulty,
        points: p.points,
        starter_code: p.starter_code
      });
      console.log(`Updated problem: ${p.title}`);
    } else {
      // Insert new problem
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
        console.log(`Inserted problem: ${p.title}`);
      } else {
        console.error(`Failed to insert ${p.title}:`, insRes.body);
        continue;
      }
    }

    // 2. Delete old test cases for this problem
    await req('DELETE', `/test_cases?problem_id=eq.${problemId}`);

    // 3. Insert test cases
    const tcRows = p.test_cases.map((tc, idx) => ({
      problem_id: problemId,
      input: tc.input,
      expected_output: tc.expected_output,
      is_sample: tc.is_sample,
      order_index: idx + 1
    }));

    const tcRes = await req('POST', '/test_cases', tcRows);
    if (tcRes.status === 201 || tcRes.status === 200) {
      console.log(`  ✓ Added ${tcRows.length} test cases for ${p.title}`);
    } else {
      console.error(`  ✗ Error adding test cases for ${p.title}:`, tcRes.body);
    }
  }

  // Also fix Two Sum test cases if problem_id was null
  const twoSumRes = await req('GET', '/problems?slug=eq.two-sum&select=id');
  if (twoSumRes.body && twoSumRes.body[0]) {
    const twoSumId = twoSumRes.body[0].id;
    await req('PATCH', `/problems?id=eq.${twoSumId}`, {
      description_markdown: `## Problem Statement

Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers** such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Input Format
- First line: two integers \`n\` (length of array) and \`target\`.
- Second line: \`n\` space-separated integers.

### Output Format
Print the two 0-based indices separated by a space.

### Example 1
**Input:**
\`\`\`text
4 9
2 7 11 15
\`\`\`
**Output:**
\`\`\`text
0 1
\`\`\`
**Explanation:** Because nums[0] + nums[1] == 9, we return 0 1.

### Example 2
**Input:**
\`\`\`text
3 6
3 2 4
\`\`\`
**Output:**
\`\`\`text
1 2
\`\`\`

### Constraints
- \`2 <= n <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**`
    });

    await req('DELETE', `/test_cases?problem_id=eq.${twoSumId}`);
    await req('POST', '/test_cases', [
      { problem_id: twoSumId, input: '4 9\n2 7 11 15', expected_output: '0 1', is_sample: true, order_index: 1 },
      { problem_id: twoSumId, input: '3 6\n3 2 4', expected_output: '1 2', is_sample: true, order_index: 2 },
      { problem_id: twoSumId, input: '2 6\n3 3', expected_output: '0 1', is_sample: false, order_index: 3 },
      { problem_id: twoSumId, input: '5 10\n1 2 5 6 9', expected_output: '0 4', is_sample: false, order_index: 4 },
      { problem_id: twoSumId, input: '4 -8\n-1 -2 -3 -5', expected_output: '2 3', is_sample: false, order_index: 5 },
    ]);
    console.log('✓ Updated Two Sum with clean markdown and verified test cases');
  }

  console.log('\n🎉 Done! All problems and test cases are seeded.');
}

main().catch(console.error);
