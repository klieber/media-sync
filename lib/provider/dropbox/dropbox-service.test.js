const DropboxService = require('./dropbox-service');
const fs = require('fs');
const { when } = require('jest-when');
const Stream = require('stream');
const https = require('https');
const { EventEmitter } = require('events');

const dropboxClient = {
  filesListFolder: jest.fn(),
  filesDownload: jest.fn(),
  filesGetTemporaryLink: jest.fn(),
  filesDelete: jest.fn(),
  checkAndRefreshAccessToken: jest.fn()
};

const DROPBOX_FILE_NAME = 'mockFile.jpg';
const DROPBOX_FILE_BINARY = '123456789';
const DROPBOX_FILE_HASH = '292b0d007566832db94bfae689cd70d1ab772811fd44b9f49d8550ee9ea6a494';
const SOURCE_PATH = './source-path';
const TARGET_PATH = './target-path';
const MODIFY_DATE_STRING = '2020-04-05T22:00:00-0500';
const MODIFY_DATE = new Date(MODIFY_DATE_STRING);
const FAKE_DOWNLOAD_LINK = 'http://fake/url';

const DROPBOX_FILE = {
  path_lower: DROPBOX_FILE_NAME,
  content_hash: DROPBOX_FILE_HASH
};

const dropboxService = new DropboxService(dropboxClient);
jest.fn((file, fileName, callback) => callback('someData'));
beforeEach(() => {
  jest.spyOn(fs.promises, 'mkdir').mockResolvedValue();
  jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  jest.spyOn(fs.promises, 'utimes').mockResolvedValue();
  jest.spyOn(fs, 'createReadStream');
  jest.spyOn(fs, 'createWriteStream');
  jest.spyOn(https, 'get').mockImplementation((link, callback) => {
    console.log('yippie');
    callback(Stream.PassThrough);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const createReadStream = (data) =>
  new Stream.Readable({
    read() {
      this.push(data);
      this.push(null);
    }
  });

describe('DropboxService', () => {
  describe('download', () => {
    test('file is downloaded successfully', async () => {
      when(dropboxClient.filesDownload)
        .calledWith({ path: `${SOURCE_PATH}/${DROPBOX_FILE_NAME}` })
        .mockResolvedValue({
          name: DROPBOX_FILE_NAME,
          client_modified: MODIFY_DATE_STRING,
          fileBinary: DROPBOX_FILE_BINARY
        });

      const expectedFilename = `${TARGET_PATH}/${DROPBOX_FILE_NAME}`;

      const filename = await dropboxService.download(`${SOURCE_PATH}/${DROPBOX_FILE_NAME}`, TARGET_PATH);

      expect(filename).toBe(expectedFilename);
      expect(fs.promises.mkdir).toHaveBeenCalledWith(TARGET_PATH, { recursive: true });
      expect(fs.promises.writeFile).toHaveBeenCalledWith(expectedFilename, DROPBOX_FILE_BINARY, 'binary');
      expect(fs.promises.utimes).toHaveBeenCalledWith(expectedFilename, MODIFY_DATE, MODIFY_DATE);
    });
  });

  describe('downloadLargeFile', () => {
    test('file is downloaded successfully', async () => {
      const writableStream = new Stream.Writable();
      jest.spyOn(writableStream, 'write');

      when(dropboxClient.filesGetTemporaryLink)
        .calledWith({ path: `${SOURCE_PATH}/${DROPBOX_FILE_NAME}` })
        .mockResolvedValue({
          link: FAKE_DOWNLOAD_LINK,
          metadata: {
            name: DROPBOX_FILE_NAME,
            client_modified: MODIFY_DATE_STRING
          }
        });

      const httpEmitter = new EventEmitter();
      https.get.mockImplementation((link, callback) => {
        callback(createReadStream(DROPBOX_FILE_BINARY));
        return httpEmitter;
      });

      const expectedFilename = `${TARGET_PATH}/${DROPBOX_FILE_NAME}`;
      const fileDate = MODIFY_DATE;

      when(fs.createWriteStream).calledWith(expectedFilename).mockReturnValue(writableStream);

      setTimeout(() => httpEmitter.emit('close'));
      const filename = await dropboxService.downloadLargeFile(`${SOURCE_PATH}/${DROPBOX_FILE_NAME}`, TARGET_PATH);

      expect(filename).toBe(expectedFilename);
      expect(https.get).toHaveBeenCalledWith(FAKE_DOWNLOAD_LINK, expect.any(Function));
      expect(fs.promises.mkdir).toHaveBeenCalledWith(TARGET_PATH, { recursive: true });
      expect(writableStream.write).toHaveBeenCalledWith(Buffer.from(DROPBOX_FILE_BINARY));
      expect(fs.promises.utimes).toHaveBeenCalledWith(expectedFilename, fileDate, fileDate);
    });
  });

  describe('downloadAndVerify', () => {
    test('file is downloaded and verified successfully', async () => {
      const writableStream = new Stream.Writable();
      jest.spyOn(writableStream, 'write');

      when(dropboxClient.filesGetTemporaryLink)
        .calledWith({ path: `${DROPBOX_FILE_NAME}` })
        .mockResolvedValue({
          link: FAKE_DOWNLOAD_LINK,
          metadata: {
            name: DROPBOX_FILE_NAME,
            client_modified: MODIFY_DATE_STRING
          }
        });

      const httpEmitter = new EventEmitter();
      https.get.mockImplementation((link, callback) => {
        callback(createReadStream(DROPBOX_FILE_BINARY));
        return httpEmitter;
      });

      const expectedFilename = `${TARGET_PATH}/${DROPBOX_FILE_NAME}`;

      when(fs.createWriteStream).calledWith(expectedFilename).mockReturnValue(writableStream);

      setTimeout(() => httpEmitter.emit('close'));

      when(fs.createReadStream).calledWith(expectedFilename).mockReturnValue(createReadStream(DROPBOX_FILE_BINARY));

      const filename = await dropboxService.downloadAndVerify(DROPBOX_FILE, TARGET_PATH);

      expect(filename).toBe(expectedFilename);
      expect(https.get).toHaveBeenCalledWith(FAKE_DOWNLOAD_LINK, expect.any(Function));
      expect(fs.promises.mkdir).toHaveBeenCalledWith(TARGET_PATH, { recursive: true });
      expect(writableStream.write).toHaveBeenCalledWith(Buffer.from(DROPBOX_FILE_BINARY));
      expect(fs.promises.utimes).toHaveBeenCalledWith(expectedFilename, MODIFY_DATE, MODIFY_DATE);
    });
  });

  describe('listFiles', () => {
    test('lists files all files', async () => {
      dropboxClient.filesListFolder.mockResolvedValue({
        entries: [DROPBOX_FILE]
      });

      const response = await dropboxService.listFiles();
      expect(response).not.toBeNull();
      expect(response.entries).toHaveLength(1);
      expect(response.entries).toMatchObject([DROPBOX_FILE]);
    });
  });

  describe('delete', () => {
    test('file is deleted', async () => {
      when(dropboxClient.filesDelete).calledWith({ path: DROPBOX_FILE_NAME }).mockResolvedValue(DROPBOX_FILE);

      await expect(dropboxService.delete(DROPBOX_FILE)).resolves.toBe(DROPBOX_FILE);
    });
  });

  describe('hash', () => {
    test('creates hash from file', async () => {
      const stream = new Stream.Readable({
        read() {
          this.push(DROPBOX_FILE_BINARY);
          this.push(null);
        }
      });
      when(fs.createReadStream).calledWith(DROPBOX_FILE_NAME).mockReturnValue(stream);
      const contentHash = await dropboxService.hash(DROPBOX_FILE_NAME);
      expect(contentHash).toBe(DROPBOX_FILE_HASH);
    });
  });
});
