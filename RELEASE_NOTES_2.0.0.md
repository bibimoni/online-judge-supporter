# 2.0.0

Stress testing, a release pipeline, and a lot of fixes to how the tool runs your code.

## Highlights

### Stress testing — `ojs stress`

Put three optional files next to your solution and the tool generates testcases, runs your
solution against a correct one, and tells you the first testcase that fails.

| File | Needed | Purpose |
|------|--------|---------|
| `<problem>__Generator.<ext>` | to generate testcases | prints a random testcase, the seed is `argv[1]` |
| `<problem>__Good.<ext>` | yes | a correct solution, its output is the answer |
| `<problem>__Checker.<ext>` | no | decides if an output is correct |

```bash
ojs stress e.cpp                  # stressTestCaseCount testcases (1000 by default)
ojs stress e.cpp -n 50 --seed 1 --time 2000
```

```
✖ [ERROR] WA on testcase 13/20
Input:
...
Ouput:
999
Expected:
1
```

- The failing testcase number is shown, so a solution that fails at 950/1000 is easy to tell
  from one that fails at 2.
- Testcases that pass are saved into `__test_<problem>/` and replay with `ojs test`.

The checker reads the input, the answer and the output of the solution from **stdin** in that
order and exits `0` (correct) or `1` (wrong); its stderr becomes the reason. Without a checker
the output is compared with the good solution's answer, the same way `ojs test` compares.

Any language in the config works for these three files, not just C++.

### Release pipeline

`.github/workflows/release.yml`: push a `v*.*.*` tag and it checks the tag against
`package.json`, runs `npm ci`, publishes with `--provenance`, and creates the GitHub release.

### `stderr` on RE

A runtime error now shows the program's stderr instead of its (usually empty) stdout.

## Everything else

- **Diffs removed from stress** — a failing testcase prints the same `Input` / `Ouput` /
  `Expected` blocks `ojs test` prints, instead of its own format.
- **Config** — new `stressTestCaseCount` key (default `1000`); `-n` overrides it.
- **Paths** — every path is built with `node:path` through `src/path.js`, so no hardcoded
  `"/"` is left anywhere. Fixes helpers that broke on Windows and on names without an
  extension.
- **Security** — `npm audit`: 27 vulnerabilities (2 critical) down to 16, 0 critical.

## Fixes

- `ojs test` only reads `__test_<problem>/` — no `-t` runs every testcase, `-t N` runs one,
  and an empty folder says `No test file for source file`. A generator or good solution
  next to the source no longer changes what it does.
- `-i` and `-d` no longer hang on a program that reads to EOF (`while (cin >> n)`); they now
  hand the terminal to the program, so keys arrive as typed and output appears as it flushes.
- Programs that read until EOF no longer wait for the timeout — stdin is closed.
- Codeforces: samples are joined with newlines instead of being concatenated (`1`, `2`, `10`
  used to become `1210`), and downloading no longer fails with `$ is not defined`.
- A stress run no longer reports a timeout as WA, and the spinner counts up instead of
  freezing on `1/1000`.
- `-a` does not save a testcase when the input is empty.
- A wrong file name no longer crashes with a raw stack trace.

## Breaking

- `ojs test` no longer generates testcases — that moved to `ojs stress`.
- The stress helpers require `<problem>__Good.<ext>`; a checker is optional.

**Full diff:** https://github.com/bibimoni/online-judge-supporter/compare/83b3f5e...v2.0.0
