import { readdir } from 'fs/promises';
import path from 'path';

export async function listDirectories(path) {
    const entries = await readdir(path, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

export async function listFiles(dirPath, params = {}) {
    const files = await fsPromises.readdir(dirPath);
    let output = []
  
    for (let file of files) {
        let filePath = path.join(dirPath, file);
        if (isDirectory(filePath)) {
            let subFiles = await listFiles(filePath);
            output = [...output, ...subFiles];
        } else {
            output.push(filePath)
        }
    }
  
    if (params.filter) {
        output = output.filter(file => {
            return path.basename(file) !== params.filter;
        })
    }

    return output;
}

function isDirectory(path) {
    return lstatSync(path).isDirectory();
}