import {
	memo,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { getTemplateUrl } from "@/felo/templates/services/getTemplateUrl";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Head } from "@/ui/Head";
import Select from "@/ui/Select/Select";

import { LetterType, letterTypeOptions } from "./LetterType";
import { mdLetterKeys } from "./MdLetterWidget";

function MdLetterDisplay() {
	const { instance } = useInspectionContext();

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [content, setContent] = useState<string>("");

	const [letterType, setLetterType] = useState<LetterType>(LetterType.Md);
	const letterTypeInputId = useId();

	const templateUrl = useMemo(() => {
		return `inspection/coi/${
			letterType === LetterType.Md ? "Md" : "Sd"
		}Letter.html`;
	}, [letterType]);

	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	const fetchTemplateContent = useCallback(async () => {
		try {
			setLoading(true);

			const content = await getTemplateString(instance.id, templateUrl, [
				...mdLetterKeys,
			]);

			if (content) {
				setContent(content);
			}
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Something went wrong.");
		} finally {
			setLoading(false);
		}
	}, [instance.id, templateUrl]);

	useEffect(() => {
		fetchTemplateContent();
	}, [instance, fetchTemplateContent]);

	return (
		<div className="space-y-6">
			<Head.Root>
				<Head.Title text="اظهارنامه انطباق عرضه کننده (SD) / تولید کننده (MD)" />
			</Head.Root>

			<div className="flex items-center gap-x-3">
				<label htmlFor={letterTypeInputId}>نوع اظهارنامه:</label>
				<div className="sh basis-48">
					<Select
						id={letterTypeInputId}
						value={letterType}
						items={letterTypeOptions}
						onChange={(value) => {
							setLetterType(value as LetterType);
						}}
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
					<div className="overflow-hidden border border-gray-200">
						<div className="h-[32rem] w-a4-portrait overflow-y-auto"></div>
					</div>
				</div>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<div className="space-y-6">
					<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
						<div className="overflow-hidden border border-gray-200">
							<iframe
								className="h-[32rem] w-a4-portrait overflow-y-auto"
								ref={iframeRef}
								srcDoc={content}
							></iframe>
						</div>
					</div>

					<div className="flex gap-x-2">
						<Button
							type="button"
							onClick={() => {
								const link = document.createElement("a");
								link.href = getTemplateUrl(
									instance.id,
									templateUrl,
									[...mdLetterKeys],
									true,
								);
								link.click();
							}}
						>
							دانلود Pdf
						</Button>

						<Button
							type="button"
							onClick={() => {
								iframeRef.current?.contentWindow?.print();
							}}
						>
							پرینت نامه
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default memo(MdLetterDisplay);
