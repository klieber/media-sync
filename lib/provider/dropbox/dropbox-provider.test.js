import DropboxProvider from './dropbox-provider';
import DropboxMediaInfo from './dropbox-media-info';
import { when } from 'jest-when';

const dropboxService = {
  listFiles: jest.fn(),
  downloadAndVerify: jest.fn()
};

const SOURCE_PATH = '/source-path';
const TARGET_PATH = './target-path';

function dropboxFile(name, tag) {
  return {
    '.tag': tag || 'file',
    name: name
  };
}

function dropboxFolder(name) {
  return dropboxFile(name, 'folder');
}

const dropboxProvider = new DropboxProvider(dropboxService, SOURCE_PATH, TARGET_PATH);

describe('DropboxProvider', () => {
  describe('list', () => {
    test('only include files (no folders)', async () => {
      expect.assertions(5);

      when(dropboxService.listFiles)
        .calledWith(SOURCE_PATH)
        .mockResolvedValue({
          entries: [
            dropboxFile('a.jpg'),
            dropboxFile('b.jpg'),
            dropboxFile('.hidden'),
            dropboxFolder('folderA'),
            dropboxFile('c.jpg'),
            dropboxFolder('folderB')
          ]
        });

      const files = await dropboxProvider.list();
      expect(files).toHaveLength(3);
      files.forEach((file) => expect(file).toBeInstanceOf(DropboxMediaInfo));
      expect(files).toMatchObject([{ name: 'a.jpg' }, { name: 'b.jpg' }, { name: 'c.jpg' }]);
    });
  });
});
