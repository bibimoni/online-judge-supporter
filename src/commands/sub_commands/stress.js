import { Logger } from "../logger.js";
import { Stress } from "../../test/stress.js";
import { Verdict } from "../../test/verdict.js";
import { getConfig } from "../../config/load_config.js";
import { createSpinner } from "nanospinner";

const startStressing = async (stress, { count, seed, timeLimit }) => {
  for (let index = 1; index <= count; index++) {
    const spinner = createSpinner();
    spinner.start({ text: Logger.info(`Test ${index}/${count}`) });
    const result = await stress.judge({
      seed: seed === null ? null : seed + index - 1,
      timeLimit: timeLimit,
    });
    Logger.logVerdict(result["verdict"], { spinner: spinner });
    if (result["verdict"] === Verdict.AC) {
      continue;
    }
    Logger.input(result["output"]);
    Logger.errorOutput(result["error"]);
    if (result["expected"]) {
      Logger.answer(result["expected"]);
    }
    return;
  }
};

const stressCommand = (program) => {
  program
    .command("stress")
    .description("Stress test a solution with a generator, a good solution and a checker")
    .alias("s")
    .argument("<filename>", "Name of the source code (a.rs, b.cpp, c.py, ...)")
    .option("-n, --count <count>", "number of testcases", "1000")
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
      const count = parseInt(options.count);
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
