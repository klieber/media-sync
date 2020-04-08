const DropboxMediaFile = require('./dropbox-media-file');
const { when } = require('jest-when');

const dropboxService = {
  downloadAndVerify: jest.fn()
};

const TARGET_PATH = './target-path';
const DROPBOX_FILE_NAME = 'mockFile.jpg';
const DROPBOX_FILE = {
  path_lower: `/mockFolder/${DROPBOX_FILE_NAME}`,
  name: DROPBOX_FILE_NAME
};

describe('DropboxMediaFile', () => {
  let mediaFile;
  beforeEach(() => {
    mediaFile = new DropboxMediaFile(dropboxService, DROPBOX_FILE, TARGET_PATH);
  });

  describe('download', () => {
    test('file downloads successfully', async () => {
      when(dropboxService.downloadAndVerify)
        .calledWith(DROPBOX_FILE, TARGET_PATH)
        .mockResolvedValue(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);

      await mediaFile.download();
      expect(mediaFile.sourceFile).toBe(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);
    });

    test('file can only be downloaded once', async () => {
      when(dropboxService.downloadAndVerify)
        .calledWith(DROPBOX_FILE, TARGET_PATH)
        .mockResolvedValue(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);

      await mediaFile.download();

      expect(mediaFile.sourceFile).toBe(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);
      expect(mediaFile.download()).rejects.toThrow(`already downloaded: ${TARGET_PATH}/${DROPBOX_FILE_NAME}`);
    });

    test.todo('file cannot be downloaded after it has been deleted');
  });

  describe('delete', () => {
    test.todo('file is deleted successfully');
    test.todo('file cannot be deleted if it has already been deleted');
  });
});
