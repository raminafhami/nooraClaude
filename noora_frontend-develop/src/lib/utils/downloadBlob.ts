interface Props {
	blob: Blob;
	filename?: string;
	openInNewTab?: boolean;
}

function downloadBlob({ blob, filename, openInNewTab }: Props) {
	// Create a temporary link element
	const link = document.createElement("a");
	link.href = window.URL.createObjectURL(blob);
	if (filename) {
		link.download = filename; // Set the filename for the downloaded file
	}

	if (openInNewTab) {
		link.target = "_blank";
	}

	// Append the link to the body
	document.body.appendChild(link);

	// Trigger the click event
	link.click();

	// Remove the link
	document.body.removeChild(link);
}

export default downloadBlob;
