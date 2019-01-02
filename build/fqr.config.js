const { cmd, seq } = require("faqtor");
const { lock, publish } = require("faqtor-of-publish");

const
    dist = "./dist",
    modules = "./node_modules",
    input = "src/**/*",
    esOutput = `${dist}/index.es.js`,
    cjsOutput = `${dist}/index.js`,
    lockFile = "./build/dist-lock.json";

const
    tsc = (project) => cmd(`tsc -p ${project}`),
    rename = (a, b) => cmd(`mv ${a} ${b}`),
    clean = cmd(`rimraf ${dist}`)
        .factor(dist),
    cleanAll = cmd(`rimraf ${dist} ${modules}`)
        .factor([dist, modules]),
    buildEs = seq(
        tsc("build/tsconfig.es.json"),
        rename(cjsOutput, esOutput))
            .factor(input, esOutput),
    buildCjs = tsc("build/tsconfig.cjs.json")
        .factor(input, cjsOutput);

module.exports = {
    clean,
    cleanAll,
    buildEs,
    buildCjs,
    build: seq(buildEs, buildCjs, lock(dist, lockFile)),
    publish: publish(dist, lockFile)
}