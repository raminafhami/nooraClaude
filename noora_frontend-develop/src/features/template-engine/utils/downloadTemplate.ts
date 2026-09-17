import downloadBlob from "@/utils/downloadBlob";

import generateTemplate from "../services/generateTemplate";

interface Props {
  name: string;
  output: string;
  data: object;
}

async function downloadTemplate(props: Props) {
  const { output, ...propsRest } = props;

  const blob = await generateTemplate({
    ...propsRest,
    output: "file",
    download: true,
  });

  downloadBlob({
    blob,
    filename: `${output}.pdf`,
  });
}

export default downloadTemplate;
