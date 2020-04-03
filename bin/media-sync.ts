#!/usr/bin/env node

require('dotenv').config();
import fetch from 'node-fetch';

import * as fs from 'fs-extra';
import { strict as assert } from 'assert';
import { hash } from '../lib/dropbox-utils';

import * as Rx from 'rxjs';
import * as RxOp from 'rxjs/operators';

import { Dropbox, files } from 'dropbox';

const dbx = new Dropbox({
  fetch: fetch,
  accessToken: process.env.DROPBOX_ACCESS_TOKEN
});

const config = {
  source: process.env.SOURCE_PATH,
  target: process.env.TARGET_PATH
};

(async (): Promise<void> => {
  Rx.defer(() => listFiles(config.source))
    .pipe(
      RxOp.concatMap((response) => response.entries),
      RxOp.filter((file: files.FileMetadataReference) => Boolean(file.name.match(/\.jpg$/))),
      RxOp.take(5),
      RxOp.concatMap((file: files.FileMetadataReference) => {
        console.log(`downloading ${file.path_lower}`);
        return Rx.defer(() => downloadAndVerify(file));
      })
    )
    .subscribe(
      (filename) => console.log('downloaded', filename),
      (error) => console.error(error),
      () => console.log('done')
    );
})();

async function listFiles(path: string): Promise<files.ListFolderResult> {
  // eslint-disable-next-line @typescript-eslint/camelcase
  return await dbx.filesListFolder({ path: path, include_non_downloadable_files: false });
}

async function download(filePath: string): Promise<string> {
  const data: files.FileMetadata & { fileBinary?: File } = await dbx.filesDownload({ path: filePath });

  await fs.mkdirp(config.target);
  await fs.writeFile(`${config.target}/${data.name}`, data.fileBinary, 'binary');

  return `${config.target}/${data.name}`;
}

async function downloadAndVerify(file): Promise<string> {
  const filename: string = await download(file.path_lower);
  const actualHash: string = await hash(filename).toPromise();

  assert.equal(actualHash, file.content_hash);

  return filename;
}
