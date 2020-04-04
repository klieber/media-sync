const DropboxService = require('./dropbox-service');
const fs = require('fs-extra');
const fsRxjs = require('../fs-rxjs');
const { when } = require('jest-when');
const { of } = require('rxjs');

const dropboxClient = {
  filesListFolder: jest.fn(),
  filesDownload: jest.fn()
};

const DROPBOX_FILE_NAME = 'mockFile.jpg';
const DROPBOX_FILE_BINARY = '123456789';
const DROPBOX_FILE_HASH = '292b0d007566832db94bfae689cd70d1ab772811fd44b9f49d8550ee9ea6a494';
const SOURCE_PATH = './source-path';
const TARGET_PATH = './target-path';

const dropboxService = new DropboxService(dropboxClient);

let mkdirp;
let writeFile;
let read;

beforeEach(() => {
  mkdirp = jest.spyOn(fs, 'mkdirp').mockReturnValue({});
  writeFile = jest.spyOn(fs, 'writeFile').mockReturnValue({});
  read = jest.spyOn(fsRxjs, 'read');
});

test('DropboxService to download file', async (done) => {
  dropboxClient.filesDownload.mockResolvedValue({
    name: DROPBOX_FILE_NAME,
    fileBinary: DROPBOX_FILE_BINARY
  });

  const filename = await dropboxService.download(
    `${SOURCE_PATH}/${DROPBOX_FILE_NAME}`,
    TARGET_PATH
  );

  expect(filename).toBe(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);
  expect(mkdirp).toHaveBeenCalledWith(TARGET_PATH);
  expect(writeFile).toHaveBeenCalledWith(
    `${TARGET_PATH}/${DROPBOX_FILE_NAME}`,
    DROPBOX_FILE_BINARY,
    'binary'
  );
  done();
});

test('DropboxService lists files', (done) => {
  dropboxClient.filesListFolder.mockResolvedValue({
    entries: [
      {
        path_lower: DROPBOX_FILE_NAME,
        content_hash: DROPBOX_FILE_HASH
      }
    ]
  });

  dropboxService.listFiles().subscribe((response) => {
    expect(response).not.toBeNull();
    expect(response.entries.length).toBe(1);
    expect(response.entries[0].path_lower).toBe(DROPBOX_FILE_NAME);
    expect(response.entries[0].content_hash).toBe(DROPBOX_FILE_HASH);
    done();
  });
});

test('DropboxService hash file', (done) => {
  when(read).calledWith(DROPBOX_FILE_NAME).mockReturnValue(of(DROPBOX_FILE_BINARY));

  dropboxService.hash(DROPBOX_FILE_NAME).subscribe((contentHash) => {
    expect(contentHash).toBe(DROPBOX_FILE_HASH);
    done();
  });
});
