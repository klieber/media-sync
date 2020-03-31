require('isomorphic-fetch');

const fs = require('fs-extra');
const { hash } = require('./lib/dropbox-utils');

const Dropbox = require('dropbox').Dropbox;

const dbx = new Dropbox({
  fetch: fetch,
  accessToken: process.env.DOCKER_ACCESS_TOKEN
});

(async () => {

  try {
    const filesResponse = await listFiles('/photos');

    const image = filesResponse.entries.find(element => element.name.match(/\.jpg$/));

    console.log(`downloading ${image.path_lower}`);
    const filename = await download(image.path_lower);

    console.log(`downloaded ${filename}`);
    console.log(`Expect: ${image.content_hash}`);

    hash(filename)
      .subscribe(actualHash => console.log(`Actual: ${actualHash}`));

  } catch(error) {
    console.log(error);
  }

})();

async function listFiles(path) {
  return await dbx.filesListFolder({path: path, include_non_downloadable_files: false});
}

async function download(filePath) {
  const data = await dbx.filesDownload({path: filePath});

  await fs.writeFile(data.name, data.fileBinary, 'binary');

  return data.name;
}