import sourceMap from 'source-map';
import fs from 'fs';


const SourceMapConsumer = (file)=> {
    let consumer;
    return ()=> {
        if (!consumer) {
            consumer = new sourceMap.SourceMapConsumer(fs.readFileSync(file, 'utf8'));
        }
        return consumer;
    }
}

let sourcemap = SourceMapConsumer('./sourcemap/sourcemap2.map.txt');

const restore = (line) => {
    let r = /@(\w+):(\w+)$/.exec(line);
    if (r) {
        let row = r[1], col = r[2];
        line += format(row,col);
    }
    return line;
}

const format = (row,col) => {
    let obj = sourcemap().originalPositionFor({line: row , column: col});
    return `(${obj['source']}@${obj['line']}:${obj['column']})`;
}

const exec = (file) => {
    return fs.readFileSync(file, 'utf8').split('\n').map((line)=> {
        return restore(line);
    }).join('\n');
}

console.info(exec("./test/exception2.txt"));