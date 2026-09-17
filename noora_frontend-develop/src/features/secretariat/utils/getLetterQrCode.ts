import QRCode from "qrcode";

async function getLetterQrCode(publicUrl: string): Promise<string> {
	const qrCode = await QRCode.toDataURL(publicUrl, {
		width: 96,
		margin: 1,
	});

	return qrCode;
}

export { getLetterQrCode };
