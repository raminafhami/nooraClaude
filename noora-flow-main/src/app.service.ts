import { Injectable, OnModuleInit } from '@nestjs/common';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
@ApiTags()
export class AppService {
  async getUserName() {
    return {
      owner: '64f587fae3fd3ab49d05d06c',
    };
  }

  async saveBufferToFile(
    buffer: any,
    directory: string,
    name: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!Buffer.isBuffer(buffer)) {
        return reject(new Error('buffer variable should be type of Buffer!'));
      }
      // Setup readable stream from buffer.
      let streamData = buffer;
      const readStream = new Readable();
      readStream._read = () => {
        readStream.push(streamData);
        streamData = null;
      };

      const dir = `./assets/templates/${directory}`;
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      const finalPath = path.join(dir, name);
      const outStream = fs.createWriteStream(finalPath);
      outStream.on('error', (err) => {
        reject(err);
      });
      outStream.on('close', () => {
        reject();
      });
      readStream.pipe(outStream);
      outStream.on('finish', function () {
        resolve(true);
      });
    });
  }
}
