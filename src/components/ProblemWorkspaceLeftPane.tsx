'use client';

import { useState, useEffect } from 'react';
import CopyButton from '@/components/CopyButton';
import { supabase } from '@/lib/supabase/client';

interface ProblemData {
  id: string;
  slug: string;
  title: string;
  descriptionHtml: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  time_limit_ms: number;
}

interface TestCase {
  input: string;
  output: string;
}

interface ProblemWorkspaceLeftPaneProps {
  problem: ProblemData;
  sampleCases: TestCase[];
}

interface EditorialData {
  approach: string[];
  timeComplexity: string;
  spaceComplexity: string;
  code: {
    cpp: string;
    java: string;
    python: string;
  };
}

// Generate tailored hints based on problem slug / title
function getProblemHints(slug: string, title: string, difficulty: string) {
  if (slug === 'two-sum') {
    return [
      {
        title: 'Hint 1 (Intuition)',
        content:
          'A brute force solution compares every pair in O(N²). Can we check whether the complement (target - current_number) has already appeared in the array in O(1) time?',
      },
      {
        title: 'Hint 2 (Data Structure & Approach)',
        content:
          'Use a Hash Map / Hash Table. As you iterate through the array from left to right, store each number along with its index. Before inserting, check if `target - num` already exists in the map.',
      },
      {
        title: 'Hint 3 (Target Complexity)',
        content:
          'Optimal Complexity Target:\n• Time Complexity: O(N) — single pass through the array.\n• Space Complexity: O(N) — hash map stores up to N entries.',
      },
    ];
  }

  if (slug === 'maximum-subarray') {
    return [
      {
        title: 'Hint 1 (Intuition)',
        content:
          'If the accumulated sum of a subarray prefix drops below zero, it can never contribute positively to any subsequent subarray starting after it.',
      },
      {
        title: 'Hint 2 (Data Structure & Approach)',
        content:
          "Kadane's Algorithm: Maintain two variables: `current_sum` and `max_sum`. At each element x, decide whether to extend the existing subarray (`current_sum + x`) or start a fresh subarray at x (`max(x, current_sum + x)`).",
      },
      {
        title: 'Hint 3 (Target Complexity)',
        content:
          'Optimal Complexity Target:\n• Time Complexity: O(N) — one linear iteration.\n• Space Complexity: O(1) — constant extra memory.',
      },
    ];
  }

  if (slug === 'valid-parentheses') {
    return [
      {
        title: 'Hint 1 (Intuition)',
        content:
          'The bracket that was opened most recently must be closed first. This Last-In, First-Out (LIFO) property directly matches a fundamental data structure.',
      },
      {
        title: 'Hint 2 (Data Structure & Approach)',
        content:
          'Use a Stack. Push opening brackets `(`, `{`, `[` onto the stack. When encountering a closing bracket, verify that the stack is non-empty and the top matches the corresponding opening bracket, then pop it.',
      },
      {
        title: 'Hint 3 (Target Complexity)',
        content:
          'Optimal Complexity Target:\n• Time Complexity: O(N) — each character is pushed and popped at most once.\n• Space Complexity: O(N) — stack stores up to N/2 open brackets in the worst case.',
      },
    ];
  }

  // Dynamic topic-aware hints for other curated & Codeforces problems
  const isBinarySearch = /search|target|find|sort/i.test(title);
  const isString = /string|parenthes|palindrome|anagram|prefix/i.test(title);

  return [
    {
      title: 'Hint 1 (Intuition)',
      content: isBinarySearch
        ? 'Notice if the search space or array is monotonic or sorted. Can we eliminate half of the candidates at each step?'
        : isString
        ? 'Consider character frequencies, prefix structures, or two pointers moving inwards or outwards.'
        : `Break down the problem for small examples (N = 1, 2, 3). Notice the recurrence pattern or invariant properties.`,
    },
    {
      title: 'Hint 2 (Data Structure & Approach)',
      content: isBinarySearch
        ? 'Binary Search on the index or answer range. Maintain `low <= high` and update mid based on the condition.'
        : difficulty === 'Hard'
        ? 'Consider Dynamic Programming with memoization, or monotonic stack / queue to maintain window bounds.'
        : 'A frequency hash map, two-pointer scan, or greedy choice property allows solving this in linear or log-linear time.',
    },
    {
      title: 'Hint 3 (Target Complexity)',
      content:
        difficulty === 'Hard'
          ? 'Optimal Complexity Target:\n• Time Complexity: O(N log N) or O(N · K)\n• Space Complexity: O(N)'
          : 'Optimal Complexity Target:\n• Time Complexity: O(N) or O(N log N)\n• Space Complexity: O(1) to O(N)',
    },
  ];
}

// Generate tailored editorial solutions
function getProblemEditorial(slug: string, title: string): EditorialData {
  if (slug === 'two-sum') {
    return {
      approach: [
        '1. Initialize an empty hash map `seen` mapping number value to its array index.',
        '2. Iterate through `nums` with index `i` and value `x`.',
        '3. Compute the required complement: `complement = target - x`.',
        '4. If `complement` exists in `seen`, return `[seen[complement], i]`.',
        '5. Otherwise, record `seen[x] = i` and proceed to the next element.',
      ],
      timeComplexity: 'O(N) — We traverse the list containing N elements exactly once. Each lookup in the hash map takes O(1) average time.',
      spaceComplexity: 'O(N) — In the worst case, the hash map stores up to N key-value pairs.',
      code: {
        cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    long long target;
    if (!(cin >> n >> target)) return 0;

    vector<long long> nums(n);
    unordered_map<long long, int> seen;

    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    for (int i = 0; i < n; i++) {
        long long complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            cout << seen[complement] << " " << i << "\\n";
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;

        int n = sc.nextInt();
        long target = sc.nextLong();

        Map<Long, Integer> seen = new HashMap<>();

        for (int i = 0; i < n; i++) {
            long num = sc.nextLong();
            long complement = target - num;
            if (seen.containsKey(complement)) {
                System.out.println(seen.get(complement) + " " + i);
                return;
            }
            seen.put(num, i);
        }
    }
}`,
        python: `import sys

def solve():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    target = int(data[1])
    nums = [int(x) for x in data[2:2 + n]]

    seen = {}
    for i, x in enumerate(nums):
        complement = target - x
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[x] = i

if __name__ == "__main__":
    solve()`,
      },
    };
  }

  if (slug === 'maximum-subarray') {
    return {
      approach: [
        "1. Initialize `max_so_far = -infinity` and `current_max = 0`.",
        "2. For each number `x` in the array:",
        "   a. Add `x` to `current_max`.",
        "   b. If `current_max > max_so_far`, update `max_so_far = current_max`.",
        "   c. If `current_max < 0`, reset `current_max = 0` (discarding negative prefix).",
        "3. Output `max_so_far` as the maximum contiguous subarray sum.",
      ],
      timeComplexity: "O(N) — Single linear scan through the array using Kadane's algorithm.",
      spaceComplexity: "O(1) — Requires only two scalar variables for running and global maximums.",
      code: {
        cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long x;
    long long current_sum = 0;
    long long max_sum = LLONG_MIN;
    bool has_input = false;

    while (cin >> x) {
        has_input = true;
        current_sum = max(x, current_sum + x);
        max_sum = max(max_sum, current_sum);
    }

    if (has_input) {
        cout << max_sum << "\\n";
    }
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLong()) return;

        long currentSum = 0;
        long maxSum = Long.MIN_VALUE;

        while (sc.hasNextLong()) {
            long x = sc.nextLong();
            currentSum = Math.max(x, currentSum + x);
            maxSum = Math.max(maxSum, currentSum);
        }

        System.out.println(maxSum);
    }
}`,
        python: `import sys

def solve():
    tokens = [int(x) for x in sys.stdin.read().split()]
    if not tokens:
        return
    current_sum = 0
    max_sum = -float('inf')
    for x in tokens:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    print(max_sum)

if __name__ == "__main__":
    solve()`,
      },
    };
  }

  if (slug === 'valid-parentheses') {
    return {
      approach: [
        '1. Initialize an empty stack `st`.',
        '2. Traverse each character `ch` in the string:',
        "   a. If `ch` is an opening bracket (`(`, `{`, `[`), push it onto `st`.",
        "   b. If `ch` is a closing bracket, check if `st` is empty or if the top does not match the bracket type. If so, return false.",
        '   c. Otherwise, pop the matching opening bracket from `st`.',
        '3. After the loop, return true if the stack is completely empty, false otherwise.',
      ],
      timeComplexity: 'O(N) — Every character is pushed and popped at most once.',
      spaceComplexity: 'O(N) — Stack holds at most N elements in the worst case.',
      code: {
        cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                return false;
            }
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << "\\n";
    }
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.isEmpty()) return false;
                char top = st.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return st.isEmpty();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            System.out.println(isValid(sc.next()));
        }
    }
}`,
        python: `import sys

def isValid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return len(stack) == 0

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print("true" if isValid(line) else "false")`,
      },
    };
  }

  // Dynamic editorial template for other curated problems
  return {
    approach: [
      `1. Read problem inputs and identify the core algorithmic invariant for "${title}".`,
      '2. Analyze constraints: Choose an approach with optimal complexity (e.g., Two Pointers, Greedy, or Hash Map).',
      '3. Formulate the loop invariant and handle edge cases (empty inputs, single elements, negative bounds).',
      '4. Output the computed result in standard competitive format.',
    ],
    timeComplexity: 'O(N) to O(N log N) — Achieved via optimized data structures or sorting.',
    spaceComplexity: 'O(1) to O(N) — Minimal auxiliary space required.',
    code: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // Optimal reference template
    // Read input and execute algorithm
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Optimal reference template
    }
}`,
      python: `import sys

def solve():
    data = sys.stdin.read().split()
    # Optimal reference template

if __name__ == "__main__":
    solve()`,
    },
  };
}

export default function ProblemWorkspaceLeftPane({
  problem,
  sampleCases,
}: ProblemWorkspaceLeftPaneProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'editorial'>('description');
  const [openHints, setOpenHints] = useState<Record<number, boolean>>({});
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isForceUnlocked, setIsForceUnlocked] = useState<boolean>(false);
  const [editorialLang, setEditorialLang] = useState<'cpp' | 'java' | 'python'>('cpp');

  const hints = getProblemHints(problem.slug, problem.title, problem.difficulty);
  const editorial = getProblemEditorial(problem.slug, problem.title);

  // Check if user has already achieved an Accepted submission for this problem
  useEffect(() => {
    (async () => {
      // 1. Check localStorage
      try {
        const local = JSON.parse(localStorage.getItem('judgelite_submissions') || '[]');
        const hasLocalAc = local.some(
          (s: any) =>
            s.verdict === 'AC' &&
            (s.problem_id === problem.id || s.problem_slug === problem.slug)
        );
        if (hasLocalAc) {
          setIsSolved(true);
          return;
        }
      } catch (e) {}

      // 2. Check Supabase
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('submissions')
            .select('id')
            .eq('user_id', user.id)
            .eq('problem_id', problem.id)
            .eq('verdict', 'AC')
            .limit(1);

          if (!error && data && data.length > 0) {
            setIsSolved(true);
          }
        }
      } catch (e) {}
    })();
  }, [problem.id, problem.slug]);

  const toggleHint = (index: number) => {
    setOpenHints((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const isEditorialUnlocked = isSolved || isForceUnlocked;

  return (
    <div className="w-1/2 flex flex-col h-full border-r border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
      {/* 3-Tab Header at the Top */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs shrink-0 select-none">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'description'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📄</span> Description
        </button>
        <button
          onClick={() => setActiveTab('hints')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'hints'
              ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>💡</span> Hints ({hints.length})
        </button>
        <button
          onClick={() => setActiveTab('editorial')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'editorial'
              ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{isEditorialUnlocked ? '🔓' : '🔒'}</span> Editorial
        </button>
      </div>

      {/* Pane Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {/* 1. DESCRIPTION TAB */}
        {activeTab === 'description' && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-slate-100">{problem.title}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  problem.difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : problem.difficulty === 'Medium'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {problem.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 pb-4 border-b border-slate-800">
              <span>
                Points: <strong className="text-slate-200">{problem.points}</strong>
              </span>
              <span>•</span>
              <span>
                Time Limit: <strong className="text-slate-200">{problem.time_limit_ms}ms</strong>
              </span>
            </div>

            {/* Markdown Problem Statement */}
            <div
              className="markdown-content mt-4 text-slate-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: problem.descriptionHtml }}
            />

            {/* Sample Test Cases */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <span>🧪</span> Sample Test Cases
              </h2>
              {sampleCases.length > 0 ? (
                sampleCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="mb-4 p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                      <span>Sample {idx + 1} Input</span>
                      <CopyButton text={tc.input} />
                    </div>
                    <pre className="font-mono text-sm bg-slate-950 border border-slate-800/60 p-3 rounded-lg text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                      {tc.input}
                    </pre>

                    <div className="flex justify-between items-center text-xs font-medium text-slate-400 pt-1">
                      <span>Expected Output</span>
                      <CopyButton text={tc.output} />
                    </div>
                    <pre className="font-mono text-sm bg-slate-950 border border-slate-800/60 p-3 rounded-lg text-sky-300 overflow-x-auto whitespace-pre-wrap">
                      {tc.output}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400">
                  No sample test cases specified for this problem.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. HINTS TAB */}
        {activeTab === 'hints' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>💡</span> Hints & Guidance
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Need a push in the right direction? Reveal hints progressively without spoiling the
                entire solution.
              </p>
            </div>

            {hints.map((hint, idx) => {
              const isOpen = openHints[idx];
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => toggleHint(idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
                      <span className="text-amber-400">{isOpen ? '💡' : '🔒'}</span>
                      <span>{hint.title}</span>
                    </div>
                    <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {isOpen ? '▲ Hide' : '▼ Reveal'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 border-t border-slate-800/60 bg-slate-950/60 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                      {hint.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. EDITORIAL TAB */}
        {activeTab === 'editorial' && (
          <div>
            {!isEditorialUnlocked ? (
              /* Locked State */
              <div className="py-12 px-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mb-4 shadow-inner">
                  🔒
                </div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">Editorial is Locked</h2>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
                  Solving this challenge independently cements algorithmic concepts best! Submitting an
                  <span className="text-emerald-400 font-semibold"> Accepted (AC) </span>
                  solution will automatically unlock this official editorial.
                </p>
                <button
                  onClick={() => setIsForceUnlocked(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>🔓</span> Unlock Editorial Now
                </button>
              </div>
            ) : (
              /* Unlocked Editorial Content */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <span>🔓</span> Official Editorial
                    </h2>
                    <span className="text-xs text-emerald-400 font-medium">
                      {isSolved ? '✓ Solved by you' : 'Unlocked preview'}
                    </span>
                  </div>
                  {/* Language Selector for Code Reference */}
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    {(['cpp', 'java', 'python'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setEditorialLang(lang)}
                        className={`px-2.5 py-1 rounded font-medium transition-all uppercase ${
                          editorialLang === lang
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang === 'cpp' ? 'C++' : lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Walkthrough */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Algorithm & Intuition
                  </h3>
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300 leading-relaxed">
                    {editorial.approach.map((step, idx) => (
                      <p key={idx}>{step}</p>
                    ))}
                  </div>
                </div>

                {/* Complexity Analysis */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Complexity Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 font-semibold block mb-1">
                        Time Complexity:
                      </span>
                      <p className="text-emerald-400 font-mono font-medium leading-relaxed">
                        {editorial.timeComplexity}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 font-semibold block mb-1">
                        Space Complexity:
                      </span>
                      <p className="text-sky-400 font-mono font-medium leading-relaxed">
                        {editorial.spaceComplexity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Optimal Code Solution */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold text-slate-200 uppercase tracking-wider">
                      Optimal Reference Solution ({editorialLang === 'cpp' ? 'C++' : editorialLang.toUpperCase()})
                    </h3>
                    <CopyButton text={editorial.code[editorialLang]} label="📋 Copy Solution" />
                  </div>
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{editorial.code[editorialLang]}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
