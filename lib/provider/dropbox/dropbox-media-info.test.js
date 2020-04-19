const DropboxMediaInfo = require('./dropbox-media-info');
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

describe('DropboxMediaInfo', () => {
  let mediaInfo;
  beforeEach(() => {
    mediaInfo = new DropboxMediaInfo(dropboxService, DROPBOX_FILE, TARGET_PATH);
  });

  describe('get', () => {
    test('file downloads successfully', async () => {
      expect.assertions(2);

      when(dropboxService.downloadAndVerify)
        .calledWith(DROPBOX_FILE, TARGET_PATH)
        .mockResolvedValue(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);

      const mediaFile = await mediaInfo.get();
      expect(mediaFile).toBeInstanceOf(DropboxMediaFile);
      expect(mediaFile.name).toBe(`${TARGET_PATH}/${DROPBOX_FILE_NAME}`);
    });

    test('download fails', async () => {
      expect.assertions(1);

      when(dropboxService.downloadAndVerify)
        .calledWith(DROPBOX_FILE, TARGET_PATH)
        .mockRejectedValue(new Error('download failed'));

      await expect(mediaInfo.get()).rejects.toThrow(/download failed/);
    });
  });
});
