import Image from "next/image";
import { toast } from "sonner";

import aiImage from "@/assets/images/ai-image.png";
import { Button } from "@/components/ui/button";

const AiWidget = () => {
	const handleAiButton = () => {
		toast.success("به زودی");
	};

	return (
		<div className="col-span-full flex flex-col items-center justify-start gap-y-7 rounded-2xl bg-[linear-gradient(296.98deg,_#FFCF89_34.88%,_#EF9B20_103.64%)] px-5 py-7 xl:col-span-3">
			<Image src={aiImage} width={44} height={44} alt="ai-widget" />
			<div className="text-lg font-semibold text-[#111827]">
				من آماده ام که کمکت کنم
			</div>
			<div className="text-sm font-normal text-[#111827]">
				تجربه لذت بخش با دستیار هوشمند!
			</div>
			<Button
				onClick={handleAiButton}
				className="w-full rounded-lg border-0 bg-slate-800 text-center text-sm font-bold text-white shadow-none hover:bg-slate-800"
			>
				شروع چت آنلاین
			</Button>
		</div>
	);
};

export { AiWidget };
