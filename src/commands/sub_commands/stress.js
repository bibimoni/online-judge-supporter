import { Logger } from "../logger.js";
import { Stress } from "../../test/stress.js";
import { Verdict } from "../../test/verdict.js";
import { getConfig } from "../../config/load_config.js";
import { createSpinner } from "nanospinner";

// used when the config of an older install doesn't have stressTestCaseCount yet
const defaultTestCaseCount = 1000;
const startStressing = async (stress, { count, seed, timeLimit }) => {
  // one spinner for the whole run, an accepted testcase only updates its text
  // so a long stress test doesn't flood the terminal with AC lines.
  // start() resets the spinner and starts another loop timer, so only the
  // first testcase starts it and the rest update the text
  const spinner = createSpinner();
  for (let index = 1; index <= count; index++) {
    const text = Logger.info(`Judging testcase ${index}/${count}`);
    if (index === 1) {
      spinner.start({ text: text });
    }
    else {
      spinner.update({ text: text });
    }
    const result = await stress.judge({
      seed: seed === null ? null : seed + index - 1,
      timeLimit: timeLimit,
    });
    if (result["verdict"] === Verdict.AC) {
      continue;
    }
    // keep the testcase number, it says how many testcases passed before the
    // failure, so a close solution is easy to tell from a broken one
    Logger.logVerdict(result["verdict"], {
      spinner: spinner,
      note: `on testcase ${index}/${count}`,
    });
    Logger.input(result["output"]);
    Logger.output(result["solutionOutput"]);
    Logger.answer(result["expected"]);
    if (result["error"]) {
      Logger.errorOutput(result["error"]);
    }
    return;
  }
  spinner.success({ text: Logger.success(`All ${count} testcases accepted`) });
};

const stressCommand = (program) => {
  program
    .command("stress")
    .description("Stress test a solution with a generator, a good solution and a checker")
    .alias("s")
    .argument("<filename>", "Name of the source code (a.rs, b.cpp, c.py, ...)")
    .option("-n, --count <count>", "number of testcases, defaults to stressTestCaseCount in the config")
    .option("-s, --seed <seed>", "random seed of the first testcase (increases by one each test)")
    .option("--time <milliseconds>", "time limit of each execution, defaults to the timeout in the config")
    .action(async (fileName, options) => {
      let stress;
      try {
        stress = Stress.find(fileName);
      } catch (err) {
        Logger.logErrorSpinner(err.message);
        return;
      }
      const missing = stress.missingFiles();
      if (missing) {
        Logger.logErrorSpinner(missing.message);
        return;
      }
      try {
        stress.solution.buildFile({ debug: false });
        stress.good.buildFile({ debug: false });
        stress.generator?.buildFile({ debug: false });
        stress.checker?.buildFile({ debug: false });
      } catch (_) {
        Logger.logVerdict(Verdict.CE);
        return;
      }
      const count = parseInt(options.count ?? getConfig()["stressTestCaseCount"] ?? defaultTestCaseCount);
      if (!(count > 0)) {
        Logger.logErrorSpinner(`Count must be a positive number`);
        return;
      }
      await startStressing(stress, {
        count: count,
        seed: options.seed === undefined ? null : parseInt(options.seed),
        timeLimit: options.time === undefined ? null : parseInt(options.time),
      });
    });
};
export { stressCommand };
export default {
  stressCommand
};
