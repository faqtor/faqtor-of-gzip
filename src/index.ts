import * as faqtor from "faqtor";
import * as ggz from "gulp-gzip";
import * as fs from "fs";
import * as util from "util";

type mergeFunc = (a: ggz.Options, b: ggz.Options) => ggz.Options;
type compressCb = (err: Error, contents: Buffer, wasCompressed: boolean) => void;
type compressFunc = (contents: Buffer, config: ggz.Options, cd: compressCb) => void;

const merge = require("gulp-gzip/lib/utils").merge as mergeFunc;
const compr = require("gulp-gzip/lib/compress") as compressFunc;

interface Options extends ggz.Options {
    skipGrowingFiles: boolean;
}

const defaultConfig: Options = {
    append: true,
    threshold: false,
    gzipOptions: {},
    skipGrowingFiles: false
};

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class ErrorWasNotCompressed extends Error {}

const doCompress = (input: Buffer, options: ggz.Options) =>
    new Promise<[Buffer, Error]> ((resolve) => {
        compr(input, options, (err: Error, output: Buffer, wasCompressed: boolean) => {
            if (err) {
                resolve([null, err]);
                return;
            }
            if (!wasCompressed) {
                resolve([input, new ErrorWasNotCompressed()]);
                return;
            }
            resolve([output, null]);
        })
    })

export const compress = (src: string, dst: string, options: ggz.Options = {}): faqtor.IFactor => {
    const config = merge(defaultConfig, options);
    const run = async (): Promise<Error> => {
        try {
            const inp = await readFile(src).catch(e => Error(e));
            if (inp instanceof Error) { return inp; }
            const [outp, err] = await doCompress(inp, config);
            if (err instanceof ErrorWasNotCompressed) return null;
            if (err) return err;
            const r = await writeFile(dst, outp).catch((e) => Error(e));
            if (r instanceof Error) return r;
            return null;    
        } catch (e) {
            return Error(e);
        }
    }

    return faqtor.func(run, src, dst);
}