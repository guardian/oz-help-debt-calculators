import config from '../project.config.js';
import AWS from 'aws-sdk';
import {listDirectories, listFiles} from './utils/fileSystem.js';
import path from 'path';
import ora from 'ora';
import fs from 'fs';
import { lookup } from 'mime-types';
import { buildAtoms } from './build.js';

const version = `v/${Date.now()}`;
const s3Path = `atoms/${config.path}`;
const buildPath = path.resolve('build');
const atomsPath = path.resolve('src/atoms');
const localAssetsPath = path.resolve('src/assets');

const spinner = ora();

const s3 = new AWS.S3();
const bucketName = 'gdn-cdn';

const cdnUrl = 'https://interactive.guim.co.uk';
const assetsPath = `${cdnUrl}/${s3Path}/assets/${version}`;

deploy().catch(error => {
    if (error.name === "InvalidToken") {
        spinner.fail('Your AWS credentials are invalid. Please get a new set of credentials from Janus: https://janus.gutools.co.uk/');
    } else if (error.name === "ExpiredToken") {
        spinner.fail('Your AWS credentials have expired. Please get a new set of credentials from Janus: https://janus.gutools.co.uk/');
    } else {
        spinner.fail();
        console.error(error);
    }
});

async function deploy() {    
    await buildAtoms(assetsPath);

    // print empty line
    console.log('');

    await deployAssets();

    const atoms = await listDirectories(atomsPath);
    for (let atom of atoms) {
        await deployAtom(atom);
    }
} 

async function deployAssets() {
    spinner.start('Deploying assets')

    let paths = await listFiles(localAssetsPath, { filter: ['.DS_Store', '.gitkeep'] });

    for (let filePath of paths) {
        const body = fs.createReadStream(filePath);
        const relativePath = path.relative(localAssetsPath, filePath);
        const key = path.join(s3Path, 'assets', version, relativePath);

        await upload(body, key);
    }

    spinner.succeed('Assets deployed')
}

async function deployAtom(atomName) {
    spinner.start(`Deploying atom '${atomName}'`)

    const files = filesToDeploy(atomName);
    for (let file of files) {
        const body = file.body || fs.createReadStream(file.path);
        await upload(body, file.key, file.params || {});
    }

    const atomURL = `https://content.guardianapis.com/atom/interactive/interactives/${config.path}/${atomName}`
    spinner.succeed(`Atom '${atomName}' (${version}) deployed to: ${atomURL}`)
}

async function upload(body, key, params = {}) {
    let defaultParams = {
        Bucket: bucketName,
        ACL: 'public-read',
        CacheControl: 'max-age=31536000',
    }

    const explicitContentType = lookup(key);
    if (explicitContentType) {
        defaultParams.ContentType = explicitContentType;
    }
    
    let uploadParams = {
        ...defaultParams,
        ...params,
        Key: key,
        Body: body,
    }

    return s3.upload(uploadParams).promise()
}

function filesToDeploy(atomName) {
    const pathForFile = (fileName) => {
        return path.join(buildPath, atomName, fileName)
    }
    
    const versionedKeyForFile = (fileName) => {
        return path.join(s3Path, atomName, version, fileName)
    }
    
    const keyForFile = (fileName) => {
        return path.join(s3Path, atomName, fileName)
    }

    // TODO: create main.js in project structure
    const mainJS = `
        var el = document.createElement('script');
        el.src = '${cdnUrl}/${s3Path}/${atomName}/${version}/app.js';
        document.body.appendChild(el);
    `;
    
    return [{
        path: pathForFile('main.js'),
        key: versionedKeyForFile('app.js')
    }, 
    {
        body: mainJS,
        key: versionedKeyForFile('main.js')
    },
    {
        path: pathForFile('style.css'),
        key: versionedKeyForFile('main.css')
    }, 
    {
        path: pathForFile('main.html'),
        key: versionedKeyForFile('main.html')
    },
    {
        body: version,
        key: keyForFile('preview'),
        params: {
            CacheControl: 'max-age=30'
        },
    },
    {
        body: version,
        key: keyForFile('live'),
        params: {
            CacheControl: 'max-age=30'
        },
    }, 
    {
        body: JSON.stringify(config),
        key: keyForFile('config.json'),
        params: {
            CacheControl: 'max-age=30'
        },
    }]
}