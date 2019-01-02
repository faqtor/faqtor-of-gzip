const { compress } = require("../dist/index");
const { cmd } = require("faqtor");

const
    input = "./test.js",
    output = "./test.js.gz";

const
    build = compress(input, output).factor(),
    clean = cmd(`rimraf *.gz`).factor(output);

module.exports = {
    build,
    clean,
}