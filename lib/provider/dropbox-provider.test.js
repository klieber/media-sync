const DropboxProvider = require('./dropbox-provider');
const { of } = require('rxjs');
const { toArray } = require('rxjs/operators');
const { when } = require('jest-when');

const dropboxService = {
  listFiles: jest.fn(),
  downloadAndVerify: jest.fn()
};

const MOCK_SOURCE_PATH = './source-path';
const MOCK_TARGET_PATH = './target-path';
const MOCK_DROPBOX_FILE_NAME = 'mockFile.jpg';
const MOCK_DROPBOX_FILE = {
  path_lower: MOCK_DROPBOX_FILE_NAME
};

const dropboxProvider = new DropboxProvider(dropboxService, MOCK_SOURCE_PATH, MOCK_TARGET_PATH);

test('DropboxProvider list files', (done) => {
  when(dropboxService.listFiles)
    .calledWith(MOCK_SOURCE_PATH)
    .mockReturnValue(
      of({
        entries: [MOCK_DROPBOX_FILE]
      })
    );

  dropboxProvider
    .list()
    .pipe(toArray())
    .subscribe((files) => {
      expect(files).toEqual(expect.arrayContaining([MOCK_DROPBOX_FILE]));
      done();
    });
});

test('DropboxProvider download file', (done) => {
  when(dropboxService.downloadAndVerify)
    .calledWith(MOCK_DROPBOX_FILE, MOCK_TARGET_PATH)
    .mockResolvedValue(`${MOCK_TARGET_PATH}/${MOCK_DROPBOX_FILE_NAME}`);

  dropboxProvider
    .download(MOCK_DROPBOX_FILE)
    .pipe(toArray())
    .subscribe((files) => {
      expect(files).toEqual(
        expect.arrayContaining([`${MOCK_TARGET_PATH}/${MOCK_DROPBOX_FILE_NAME}`])
      );
      done();
    });
});
