import Docxtemplater from "docxtemplater";
// import ImageModule from "docxtemplater-image-module-free";
import { saveAs } from "file-saver";
import PizZip, { LoadData } from "pizzip";

let PizZipUtils: any = null;
if (typeof window !== "undefined") {
  import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
  });
}

interface DocxGenerator {
  docxPath: string;
  data: object;
  outPutFileName: string;
}

function loadFile(
  url: string,
  callback: (error: any, content: LoadData) => void
) {
  PizZipUtils.getBinaryContent(url, callback);
}

function docxGenerator({ docxPath, data, outPutFileName }: DocxGenerator) {
  loadFile(docxPath, (error, content) => {
    if (error) {
      throw error;
    }

    const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
    const validBase64 =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

    function base64Parser(dataURL: any) {
      if (typeof dataURL !== "string" || !base64Regex.test(dataURL)) {
        return false;
      }

      const stringBase64 = dataURL.replace(base64Regex, "");

      if (!validBase64.test(stringBase64)) {
        throw new Error(
          "Error parsing base64 data, your data contains invalid characters"
        );
      }

      // For nodejs, return a Buffer
      if (typeof Buffer !== "undefined" && Buffer.from) {
        return Buffer.from(stringBase64, "base64");
      }

      // For browsers, return a string (of binary content) :
      const binaryString = window.atob(stringBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        const ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
      }
      return bytes.buffer;
    }

    // const imageOptions = {
    //     getImage(tag:any) {
    //         return base64Parser(tag);
    //     },
    //     getSize() {
    //         return [100, 100];
    //     },
    // };
    // const doc = new Docxtemplater(zip, {
    //     modules: [new ImageModule(imageOptions)],
    // });
    // doc.render({
    //     image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==",
    // });

    const imageOptions = {
      centered: false,
      getImage(tag: any) {
        return base64Parser(tag);
      },
      getSize() {
        return [100, 100];
      },
    };

    const docxType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    PizZipUtils.getBinaryContent(
      docxPath,
      function (error: string, content: any) {
        if (error) {
          console.error(error);
          return;
        }

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          // modules: [new (ImageModule as any)(imageOptions)], //fix type error
        });

        try {
          doc.render(data);
          const out = doc.getZip().generate({
            type: "blob",
            mimeType: docxType,
            compression: "DEFLATE",
          });
          saveAs(out, `${outPutFileName}.docx`);
        } catch (error: any) {
          function replaceErrors(key: string, value: string) {
            if (value) {
              return Object.getOwnPropertyNames(value).reduce(function (
                error: any,
                key: any
              ) {
                error[key] = value[key];
                return error;
              },
              {});
            }
            return value;
          }
          console.log(JSON.stringify({ error: error }, replaceErrors));
        }
      }
    );

    // var zip = new PizZip(content);
    // var doc = new Docxtemplater(zip, {
    //   paragraphLoop: true,
    //   linebreaks: true,
    //   modules: [ImageModule],
    // });
    // doc.setData(data);
    // try {
    //   doc.renderAsync();
    // } catch (error: any) {
    // function replaceErrors(key: string, value: string) {
    //   if (value) {
    //     return Object.getOwnPropertyNames(value).reduce(function (
    //       error: any,
    //       key: any
    //     ) {
    //       error[key] = value[key];
    //       return error;
    //     },
    //     {});
    //   }
    //   return value;
    //   }
    // console.log(JSON.stringify({ error: error }, replaceErrors));

    //   if (error.properties && error.properties.errors instanceof Array) {
    //     const errorMessages = error.properties.errors
    //       .map(function (error: any) {
    //         return error.properties.explanation;
    //       })
    //       .join("\n");
    //     console.log("errorMessages", errorMessages);
    //   }
    //   throw error;
    // }
    // var out = doc.getZip().generate({
    //   type: "blob",
    //   mimeType:
    //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    //   compression: "DEFLATE",
    // });
    // saveAs(out, `${outPutFileName}.docx`);
  });
}

export default docxGenerator;
