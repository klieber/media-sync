import DropboxContentHasher from './dropbox-content-hasher';
import { read } from './fs-rxjs';
import { reduce, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

function hash(filename: string): Observable<string> {
  return read(filename).pipe(
    reduce(
      (hasher: DropboxContentHasher, buffer: Buffer | string) => hasher.update(buffer),
      new DropboxContentHasher()
    ),
    map((hasher: DropboxContentHasher) => hasher.digest('hex'))
  );
}

export { hash };
