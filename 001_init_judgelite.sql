-- JudgeLite – Initial Supabase Schema
-- This script can be pasted into the Supabase SQL editor.

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- 1️⃣ Tables ------------------------------------------------------------

-- contests
create table public.contests (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    start_time timestamptz,
    end_time timestamptz,
    penalty_minutes integer not null default 20,
    created_at timestamptz not null default now()
);

-- problems
create table public.problems (
    id uuid primary key default gen_random_uuid(),
    contest_id uuid references public.contests(id) on delete set null,
    slug text not null unique,
    title text not null,
    description_markdown text,
    difficulty text not null check (difficulty in ('Easy','Medium','Hard')),
    points integer not null default 100,
    time_limit_ms integer not null default 2000,
    memory_limit_kb integer not null default 262144,
    starter_code jsonb not null,
    created_at timestamptz not null default now()
);

-- test_cases
create table public.test_cases (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid references public.problems(id) on delete cascade,
    input text not null,
    expected_output text not null,
    is_sample boolean not null default false,
    order_index integer not null
);

-- submissions
create table public.submissions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    user_email text not null,
    problem_id uuid references public.problems(id) on delete cascade,
    contest_id uuid references public.contests(id) on delete set null,
    language text not null,
    source_code text not null,
    verdict text not null check (verdict in ('Pending','AC','WA','TLE','CE','RE')),
    execution_time_ms integer,
    passed_count integer not null default 0,
    total_count integer not null default 0,
    error_output text,
    created_at timestamptz not null default now()
);

-- 2️⃣ Row‑Level Security -------------------------------------------------

alter table public.contests enable row level security;
alter table public.problems enable row level security;
alter table public.test_cases enable row level security;
alter table public.submissions enable row level security;

-- contests & problems: public SELECT
create policy "public_select_contests" on public.contests for select using (true);
create policy "public_select_problems" on public.problems for select using (true);

-- test_cases: only sample cases are public
create policy "public_select_sample_test_cases" on public.test_cases for select using (is_sample = true);

-- submissions: strictly private SELECT (own submissions only), own INSERT
create policy "auth_select_own_submissions" on public.submissions for select using (auth.uid() = user_id);
create policy "auth_insert_own_submission" on public.submissions for insert with check (auth.uid() = user_id);

-- 3️⃣ Live Leaderboard View --------------------------------------------
create or replace view public.contest_leaderboard as
select
    s.contest_id,
    s.user_id,
    s.user_email,
    count(distinct s.problem_id) as problems_solved,
    sum(p.points) as total_points,
    min(s.created_at) as first_ac_at
from public.submissions s
join public.problems p on p.id = s.problem_id
where s.verdict = 'AC'
group by s.contest_id, s.user_id, s.user_email
order by total_points desc, first_ac_at asc;

-- 4️⃣ Seed Data --------------------------------------------------------

-- Insert contest and capture its id
with contest as (
    insert into public.contests (title, description, start_time, end_time, penalty_minutes, created_at)
    values (
        'JudgeLite Weekly Kickoff #1',
        'First weekly contest – warm‑up problems for the community.',
        now(),
        now() + interval '7 days',
        20,
        now()
    ) returning id as contest_id
),
-- Insert problems using the contest id and capture each problem id
problem_two as (
    insert into public.problems (
        contest_id, slug, title, description_markdown, difficulty, points, starter_code, created_at
    ) values (
        (select contest_id from contest),
        'two-sum',
        'Two Sum',
        'Given an array of integers, return indices of the two numbers that add up to a target.',
        'Easy',
        100,
        jsonb_build_object(
            'cpp', '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // TODO: read input from std::cin and output result to std::cout\n    return 0;\n}',
            'java', 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input and print result\n    }\n}',
            'python', 'import sys\ndef main():\n    data = sys.stdin.read()\n    # TODO: process data\nif __name__ == "__main__":\n    main()'
        ),
        now()
    ) returning id as problem_id
),
problem_valid as (
    insert into public.problems (
        contest_id, slug, title, description_markdown, difficulty, points, starter_code, created_at
    ) values (
        (select contest_id from contest),
        'valid-parentheses',
        'Valid Parentheses',
        'Determine if a string of parentheses is valid.',
        'Easy',
        100,
        jsonb_build_object(
            'cpp', '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // TODO: read input from std::cin and output result to std::cout\n    return 0;\n}',
            'java', 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input and print result\n    }\n}',
            'python', 'import sys\ndef main():\n    data = sys.stdin.read()\n    # TODO: process data\nif __name__ == "__main__":\n    main()'
        ),
        now()
    ) returning id as problem_id
),
problem_max as (
    insert into public.problems (
        contest_id, slug, title, description_markdown, difficulty, points, starter_code, created_at
    ) values (
        (select contest_id from contest),
        'maximum-subarray',
        'Maximum Subarray',
        'Find the contiguous sub‑array with the largest sum.',
        'Medium',
        200,
        jsonb_build_object(
            'cpp', '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // TODO: read input from std::cin and output result to std::cout\n    return 0;\n}',
            'java', 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input and print result\n    }\n}',
            'python', 'import sys\ndef main():\n    data = sys.stdin.read()\n    # TODO: process data\nif __name__ == "__main__":\n    main()'
        ),
        now()
    ) returning id as problem_id
)
-- Insert test cases for each problem
insert into public.test_cases (problem_id, input, expected_output, is_sample, order_index)
    select (select id from public.problems where slug = 'two-sum'), '2 7 11 15\n9', '0 1', true, 1 union all
    select (select id from public.problems where slug = 'two-sum'), '3 2 4\n6', '1 2', true, 2 union all
    select (select id from public.problems where slug = 'two-sum'), '1 2 3 4 5\n10', 'null', false, 3 union all
    select (select id from public.problems where slug = 'two-sum'), '-1 -2 -3 -4\n-8', '0 2', false, 4 union all
    select (select id from public.problems where slug = 'two-sum'), '0 0 0\n0', '0 1', false, 5;

insert into public.test_cases (problem_id, input, expected_output, is_sample, order_index)
    select (select id from public.problems where slug = 'valid-parentheses'), '()[]{}', 'true', true, 1 union all
    select (select id from public.problems where slug = 'valid-parentheses'), '([)]', 'false', true, 2 union all
    select (select id from public.problems where slug = 'valid-parentheses'), '(((', 'false', false, 3 union all
    select (select id from public.problems where slug = 'valid-parentheses'), '([{}])', 'true', false, 4 union all
    select (select id from public.problems where slug = 'valid-parentheses'), '', 'true', false, 5;

insert into public.test_cases (problem_id, input, expected_output, is_sample, order_index)
    select (select id from public.problems where slug = 'maximum-subarray'), '-2 1 -3 4 -1 2 1 -5 4', '6', true, 1 union all
    select (select id from public.problems where slug = 'maximum-subarray'), '1 2 3 4 5', '15', true, 2 union all
    select (select id from public.problems where slug = 'maximum-subarray'), '-1 -2 -3 -4', '-1', false, 3 union all
    select (select id from public.problems where slug = 'maximum-subarray'), '0 0 0 0', '0', false, 4 union all
    select (select id from public.problems where slug = 'maximum-subarray'), '1000 -1000 1000', '2000', false, 5;

-- End of script

-- Grant read privileges for service role
GRANT SELECT ON public.problems TO service_role;
GRANT SELECT ON public.test_cases TO service_role;
GRANT SELECT ON public.contests TO service_role;
