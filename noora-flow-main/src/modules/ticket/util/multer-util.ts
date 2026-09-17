import { memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

const storageOption = {
  memorystorage: memoryStorage(),
};
const generateRandomName = (originalname: string) => {
  const name = Buffer.from(originalname, 'latin1')
    .toString('utf8')
    .split('.')[0];
  const fileExtName = path.extname(originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  return `${name}-${randomName}${fileExtName}`;
};
const createFolderIfNotExists = async (path: string) => {
  if (!fs.existsSync(path)) {
    await fs.promises.mkdir(path, { recursive: true });
  }
};
const fileFilterForInspection = () => {
  return (req, file, callback) => {
    const fileTypes =
      /\/(jpg|jpeg|png|zip|pdf|xlsx|csv|doc|docx|mp4|heic|jfif)$/;
    const mimetype = file.mimetype.match(fileTypes);
    const extName = path
      .extname(file.originalname)
      .replace('.', '/')
      .match(fileTypes);

    if (extName) {
      // Allow storage of file
      callback(null, true);
    } else {
      // Reject file
      callback(new BadRequestException(`Unsupported file type`), false);
    }
  };
};

export const multerMemoryOptions = {
  storage: storageOption['memorystorage'],
  fileFilter: fileFilterForInspection(),
  limits: { fileSize: 1024 * 1024 * 50 },
};

export const saveBufferToFile = async (
  buffer: any,
  directory: string,
  name: string,
): Promise<any> => {
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

    const dir = `./tickets/${directory}`;
    await createFolderIfNotExists(dir);
    const filename = generateRandomName(name);
    const finalPath = path.join(dir, filename);
    const outStream = fs.createWriteStream(finalPath);
    outStream.on('error', (err) => {
      reject(err);
    });
    outStream.on('close', () => {
      reject();
    });
    readStream.pipe(outStream);
    outStream.on('finish', function () {
      resolve({
        filename,
        directory: dir,
        path: finalPath,
      });
    });
  });
};
