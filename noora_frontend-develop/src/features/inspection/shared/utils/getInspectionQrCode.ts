import QRCode from "qrcode";

async function getInspectionQrCode(publicUrl: string): Promise<string> {
	const qrCode = await QRCode.toDataURL(publicUrl, {
		width: 96,
		margin: 2,
	});

	return qrCode;
}

export { getInspectionQrCode };
