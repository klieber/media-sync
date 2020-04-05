const DropboxProvider = require('./dropbox-provider');
const { when } = require('jest-when');

const dropboxService = {
  listFiles: jest.fn(),
  downloadAndVerify: jest.fn()
};

const SOURCE_PATH = './source-path';
const TARGET_PATH = './target-path';
const DROPBOX_FILE_NAME = 'mockFile.jpg';
const DROPBOX_FILE = {
  '.tag': 'file',
  path_lower: DROPBOX_FILE_NAME
};

const dropboxProvider = new DropboxProvider(dropboxService, SOURCE_PATH, TARGET_PATH);

test('DropboxProvider list files', async (done) => {
  when(dropboxService.listFiles)
    .calledWith(SOURCE_PATH)
    .mockResolvedValue({
      entries: [DROPBOX_FILE]
    });

  const files = await dropboxProvider.list();
  expect(files).toEqual(expect.arrayContaining([DROPBOX_FILE]));
  done();
});

test('DropboxProvider download file', async (done) => {
  when(dropboxService.downloadAndVerify)
    .calledWith(DROPBOX_FILE, TARGET_PATH)
    .mockResolvedValue(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);

  const filename = await dropboxProvider.download(DROPBOX_FILE);
  expect(filename).toBe(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);
  done();
});
