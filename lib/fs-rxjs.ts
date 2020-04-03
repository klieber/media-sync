import { Observable, Subscriber } from 'rxjs';
import * as fs from 'fs';

function read(filename: string): Observable<Buffer | string> {
  return new Observable<Buffer | string>((subscriber: Subscriber<Buffer | string>) => {
    const stream = fs.createReadStream(filename);
    stream.on('data', (buffer: Buffer | string) => subscriber.next(buffer));
    stream.on('end', () => subscriber.complete());
    stream.on('error', (error: Error) => subscriber.error(error));
  });
}

export { read };
