# online-judge-supporter
The tool for Competitive programming (CP)
---
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
After install you can use it in your terminal, by using `ojs`.
You can use `ojs --help` to know how to use it.
### Stress testing
Beside the solution, a problem can provide these files (same folder, same base name):

| File | Needed | Purpose |
|------|--------|---------|
| `<problem>__Generator.<ext>` | to generate testcases | prints a random testcase, the seed is the first argument |
| `<problem>__Good.<ext>` | yes | a correct solution, its output is the answer of a testcase |
| `<problem>__Checker.cpp` | with a generator | decides if an output is correct |

The checker is invoked as `checker <input> <answer> <output> <seed>`, exit `0` means
correct, `1` means wrong, its stderr is shown as the reason. When a testcase is wrong
the files it used are kept in `__stress_<problem>/` so they can be inspected.

```bash
# generate random testcases and judge them with the checker
# the testcase that fails is added to __test_<problem>/ so `ojs test` can replay it
ojs stress a.cpp -n 1000 --seed 1 --time 2000

# no generator: type a testcase once, the good solution builds the answer
ojs test a.cpp

# a testcase built by the generator (the seed is the index, so it's reproducible)
ojs test a.cpp -t 1
```
## Config 
In your home director, a file named `online-judge-supporter_config.json` will appear, you can config the CLI via that file.
### Caution 
If you delete that file, it will revert back to the original configuration, so be careful before delete it.
