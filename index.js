require('dotenv').config();
const fetch = require('node-fetch');

const fs = require('fs-extra');
const assert = require('assert').strict;
const { hash } = require('./lib/dropbox-utils');

const Rx = require('rxjs');
const RxOp = require('rxjs/operators');

const Dropbox = require('dropbox').Dropbox;

const dbx = new Dropbox({
  fetch: fetch,
  accessToken: process.env.DROPBOX_ACCESS_TOKEN
});

const config = {
  source: process.env.SOURCE_PATH,
  target: process.env.TARGET_PATH
};

(async () => {

  Rx.defer(() => listFiles(config.source))
    .pipe(
      RxOp.concatMap(response => response.entries),
      RxOp.filter(file => file.name.match(/\.jpg$/)),
      RxOp.take(5),
      RxOp.concatMap(file => {
        console.log(`downloading ${file.path_lower}`);
        return Rx.defer(() => downloadAndVerify(file));
      })
    )
    .subscribe(
      filename => console.log('downloaded', filename),
      error => console.error(error),
      () => console.log('done')
    );

})();

async function listFiles(path) {
  return await dbx.filesListFolder({path: path, include_non_downloadable_files: false});
}

async function download(filePath) {
  const data = await dbx.filesDownload({path: filePath});

  await fs.mkdirp(config.target);
  await fs.writeFile(`${config.target}/${data.name}`, data.fileBinary, 'binary');

  return `${config.target}/${data.name}`;
}

async function downloadAndVerify(file) {
  const filename = await download(file.path_lower);
  const actualHash = await hash(filename).toPromise();

  assert.equal(actualHash, file.content_hash);

  return filename;
}