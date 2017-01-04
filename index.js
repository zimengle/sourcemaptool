import sourceMap from 'source-map';
import fs from 'fs';

const baseRow = 0;
const SourceMapConsumer = (file)=> {
    let consumer;
    return ()=> {
        if (!consumer) {
            consumer = new sourceMap.SourceMapConsumer(fs.readFileSync(file, 'utf8'));
        }
        return consumer;
    }
}
const sourcemap = {
    "myattention": SourceMapConsumer("./sourcemap/myattention.sourcemap.json"),
    "baseBundle": SourceMapConsumer("./sourcemap/base.sourcemap.json")
}


const exec = (file) => {
    let componentName;
    return fs.readFileSync(file, 'utf8').split('\n').map((line)=> {
        if (!componentName) {
            let _componentName = getComponentName(line);
            if (_componentName) {
                componentName = _componentName;
                return line;
            }
        } else {
            return restore(line, componentName);
        }
    }).join('\n');
}

const restore = (line, componentName) => {
    let r = /@(\w+):(\w+)$/.exec(line);
    if (r) {
        let row = r[1], col = r[2];
        if (row > baseRow) {
            line += format(componentName,row-baseRow,col);
        } else {
            line += format('baseBundle',row,col);
        }
    }
    return line;
}

const format = (componetname,row,col) => {
    let obj = sourcemap[componetname]().originalPositionFor({line: row , column: col});
    return `(${obj['source']}@${obj['line']}:${obj['column']})`;
}

const getComponentName = (line) => {
    let r = /componentNames: \[\"(.+)\"\]/.exec(line);
    return r && r[1];
}

console.info(exec("./test/exception1.txt"));

// console.info(consumer.originalPositionFor({ line: 31, column: 1876 }));