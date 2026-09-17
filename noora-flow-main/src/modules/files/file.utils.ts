import { extname, basename, resolve } from 'path';
import { existsSync, lstat, promises } from 'fs';
import * as fs from 'fs/promises';
import { BadRequestException, StreamableFile } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core';
import * as XLSX from 'xlsx';
import { findMaxLength } from 'src/common/utils/data.util';
import { GeneratePdfHtmlDto } from './dto/generate-pdf-html.dto';
import { DownloadTypes } from 'src/common/const/enums';
import { HtmlResponse } from './files.controller';
import * as ejs from 'ejs';

export const fileFilterForInspection = () => {
  return (req, file, callback) => {
    const fileTypes =
      /\/(jpg|jpeg|png|zip|pdf|xlsx|csv|doc|docx|mp4|heic|avi|mov|wmv|flv|mpeg|webm|jfif)$/;
    const mimetype = file.mimetype.toLowerCase().match(fileTypes);
    const extName = extname(file.originalname)
      .replace('.', '/')
      .toLowerCase()
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
export const fileFilter = (types) => {
  types = `/(${types.join('|')})$`;
  const fileTypes = new RegExp(types);
  return (req, file, callback) => {
    // const fileTypes = /\/(jpg|jpeg|png|mp3|wav|zip|pdf|xlsx|csv|doc|docx)$/;
    // const mimetype = file.mimetype.match(fileTypes);
    const extName = extname(file.originalname)
      .toLowerCase()
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

export const fileFilterForProjectTask = () => {
  (req, file, callback) => {
    const mimetype = file.mimetype
      .toLowerCase()
      .match(/\/(jpg|jpeg|png|pdf|xlsx|csv|doc|docx)$/);

    if (mimetype) {
      callback(null, true);
    } else {
      callback(new BadRequestException(`Unsupported file type`), false);
    }
  };
};

export const fileFilterForPetty = () => {
  (req, file, callback) => {
    const mimetype = file.mimetype
      .toLowerCase()
      .match(/\/(jpg|jpeg|png|pdf|xlsx|csv|doc|docx)$/);

    if (mimetype) {
      callback(null, true);
    } else {
      callback(new BadRequestException(`Unsupported file type`), false);
    }
  };
};

export const addRandomStringToFileName = (req, file, callback) => {
  const name = Buffer.from(file.originalname, 'latin1')
    .toString('utf8')
    .split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const removeRandomStringFromFileName = (filename: string) => {
  const ext = extname(filename);
  const name = basename(filename, ext);

  return `${name.substr(0, name.lastIndexOf('-'))}${ext}`;
};

export const createFolderIfNotExists = async (path: string) => {
  if (!existsSync(path)) {
    await promises.mkdir(path, { recursive: true });
  }
};

export const checkFileExists = (path: string): boolean => {
  return existsSync(path);
};

export const moveFile = async (from: string, to: string) => {
  await promises.rename(from, to);
};

export const getFileNameWithoutExt = (filename: string) => {
  return basename(filename, extname(filename));
};

export const generatePdfStream = async (html: string) => {
  const browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: '/usr/bin/google-chrome-stable', //'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });
  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  await browser.close();
  return buffer;
};

export const generatePdfWithGoTo = async (html: string) => {
  const tempFilePath = resolve(
    __dirname,
    `temp-${Math.floor(Math.random() * 99) + 1}.html`,
  );
  await fs.writeFile(tempFilePath, html);
  const browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: '/usr/bin/google-chrome-stable', // 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });

  const page = await browser.newPage();

  await page.goto(`file://${tempFilePath}`, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });
  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  await page.close();
  await browser.close();
  await fs.unlink(tempFilePath);
  return buffer;
};

//data should be flattened
export const generateExcel = (
  headers: string[],
  data: any[],
  filename: string,
  merges?: any,
  currencyColumns: string[] = [],
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
  {
    wch: findMaxLength(data.map((data) => data.caseNo));
  }
  if (merges) {
    worksheet['!merges'] = merges;
  }
  const keys = data[0] ? Object.keys(data[0]) : [];
  worksheet['!cols'] = [];
  for (const key of keys) {
    worksheet['!cols'].push({
      wch: findMaxLength(
        data.map((data) => {
          return data[key];
        }),
      ),
    });
  }

  const columnIndexes = currencyColumns.map((col) => headers.indexOf(col));

  data.forEach((row, rowIndex) => {
    columnIndexes.forEach((colIdx) => {
      const cellAddress = XLSX.utils.encode_cell({
        r: rowIndex + 1,
        c: colIdx,
      });
      const cell = worksheet[cellAddress];
      if (cell && typeof cell.v === 'number') {
        cell.z = '#,##0'; // or use other formats like '€#,##0.00'
        cell.t = 'n'; // ensure it's treated as a number
      }
    });
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, filename);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

export const generatePdfAndHtml = async (
  generatePdfHtmlDto: GeneratePdfHtmlDto,
) => {
  const template = await fs.readFile(
    `${generatePdfHtmlDto.templatePath}/${generatePdfHtmlDto.templateName}`,
    'utf8',
  );
  const html = ejs.compile(template)(generatePdfHtmlDto?.data);
  if (generatePdfHtmlDto.download === DownloadTypes.Pdf) {
    const file = (await generatePdfStream(html)) as any;
    return file;
  } else {
    return new HtmlResponse(html);
  }
};
