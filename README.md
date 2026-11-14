# online-judge-supporter
The tool for Competitive programming (CP)

## Installation
### Using npm
```bash
npm i -g online-judge-supporter
```
### Self install
#### Requirements
- Git
- Node.js
#### Install
```bash
git clone https://github.com/bibimoni/online-judge-supporter.git
cd online-judge-supporter
npm i
npm link
```
## To use
After installing, you can use it in your terminal as `ojs`.
`ojs --help` lists the commands, `ojs <command> --help` lists the options of a command.

| Command | Description |
|---------|-------------|
| `ojs test <file>` | run the solution against the problem's testcases |
| `ojs stress <file>` | generate testcases and judge them with a checker |
| `ojs create <file>` | create a source file (`a-g.cpp` creates a range) |
| `ojs download <url>` | download the testcases of a problem |
| `ojs login <url>` | log in to a site, the cookies are reused by `download` |
| `ojs info` | show the config and cookie paths |

## Testcases
Testcases are kept next to the solution, in `__test_<problem>/`.

| File | Description |
|------|-------------|
| `in<index>` | input of a testcase |
| `ans<index>` | expected output of a testcase |
| `__multi_<index>/in<index>` | input of a small testcase, for problems with multiple tests |

```bash
ojs test a.cpp        # run every testcase
ojs test a.cpp -t 2   # only testcase 2
ojs test a.cpp -v     # view the testcases
ojs test a.cpp -a     # add a testcase by hand
ojs test a.cpp -d     # build with the debug flag and show the output/stderr as is
```

## Stress testing
Beside the solution, a problem can provide these files (same folder, same base name):

| File | Needed | Purpose |
|------|--------|---------|
| `<problem>__Generator.<ext>` | to generate testcases | prints a random testcase, the seed is the first argument |
| `<problem>__Good.<ext>` | yes | a correct solution, its output is the answer of a testcase |
| `<problem>__Checker.<ext>` | no | decides if an output is correct, without one the output is compared with the answer |

The files can be written in any language in the config (`.cpp`, `.py`, `.rs`, `.java`, `.c`).
Without a checker the output of the solution is compared with the answer of the good
solution, the same way `ojs test` compares a testcase.

The checker reads the input, the answer and the output of the solution from stdin,
one after another, so it parses the input itself and reads the rest.
Exit `0` means correct, `1` means wrong, its stderr is shown as the reason.

```cpp
// a__Checker.cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
  int n; cin >> n;
  vector<int> a(n); for (auto &x : a) cin >> x;
  long long answer, output; cin >> answer >> output;
  if (answer == output) return 0;
  cerr << "expected " << answer << " but got " << output << "\n";
  return 1;
}
```

```bash
# generate testcases and judge them with the checker
ojs stress a.cpp --seed 1 --time 2000

# no generator: type a testcase once, the good solution builds the answer
ojs test a.cpp

# a testcase built by the generator, the seed is the index so it's reproducible
ojs test a.cpp -t 1
```

A testcase that passes is saved into `__test_<problem>/`, so `ojs test` can replay it later.
`ojs stress` stops at the first testcase that isn't accepted and shows its input, the answer of the
good solution and either the checker's reason or a line by line difference.

## Config
In your home directory, a file named `online-judge-supporter_config.json` will appear,
you can configure the CLI via that file.

| Key | Default | Meaning |
|-----|---------|---------|
| `stressTestCaseCount` | `1000` | how many testcases `ojs stress` generates, `-n` overrides it |
| `timeout` | `3000` | time limit of a testcase in milliseconds |
| `testComparatorExperiment` | `false` | compare numbers as numbers instead of text |
| `extension` | | the build/run/debug command of each language |

In the `extension` commands, `{file}`, `{relative_file}`, `{file_base}` and `{relative_dir}`
are replaced with the paths of the source file.
### Caution
If you delete that file, it will revert to the original configuration, so be careful before deleting it.
