import DropboxMediaFile from './dropbox-media-file';
import { when } from 'jest-when';
import fs from 'fs';

const dropboxService = {
  delete: jest.fn()
};

const TARGET_PATH = './target-path';
const DROPBOX_FILE_NAME = 'mockFile.jpg';
const SOURCE_FILE = `${TARGET_PATH}/${DROPBOX_FILE_NAME}`;
const DROPBOX_FILE = {
  path_lower: `/mockFolder/${DROPBOX_FILE_NAME}`,
  name: DROPBOX_FILE_NAME
};

describe('DropboxMediaFile', () => {
  let mediaFile;
  beforeEach(() => {
    mediaFile = new DropboxMediaFile(dropboxService, DROPBOX_FILE, SOURCE_FILE);
    jest.spyOn(fs.promises, 'unlink').mockResolvedValue();
  });

  describe('delete', () => {
    test('file is deleted successfully', async () => {
      when(dropboxService.delete).calledWith(DROPBOX_FILE).mockResolvedValue({});
      when(fs.promises.unlink).calledWith(SOURCE_FILE).mockResolvedValue({});

      await mediaFile.delete();

      expect(dropboxService.delete).toBeCalled();
      expect(fs.promises.unlink).toBeCalled();
    });

    test('file cannot be deleted if it has already been deleted', async () => {
      expect.assertions(3);

      when(dropboxService.delete).calledWith(DROPBOX_FILE).mockResolvedValue({});
      when(fs.promises.unlink).calledWith(SOURCE_FILE).mockResolvedValue({});

      await mediaFile.delete();

      await expect(mediaFile.delete()).rejects.toThrow(/cannot delete file that has already been deleted/);

      expect(dropboxService.delete).toBeCalledTimes(1);
      expect(fs.promises.unlink).toBeCalledTimes(1);
    });
  });
});
