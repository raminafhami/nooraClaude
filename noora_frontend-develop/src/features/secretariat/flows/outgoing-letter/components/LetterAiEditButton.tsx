"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { toast } from "sonner";

import aiClient from "@/api/aiClient";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { ids } from "../models/Ids";

function LetterAiEditButton() {
	const [isPending, setIsPending] = useState<boolean>(false);

	const { setValue, watch } = useFormContext();

	const { [ids.letterContent]: letterContent } = watch();

	async function handleClick() {
		try {
			setIsPending(true);

			const response = await aiClient.send({
				url: "webhook/06b01c00-b6e2-4d67-b2eb-9ce7b88af69a",
				body: {
					letter: letterContent,
				},
			});

			setValue(ids.letterContent, response[0].message.content.body);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Button
			className="bg-gradient-to-r from-[#ef9b20] to-[#ffbf62] text-[#0b273c]"
			disabled={isPending}
			type="button"
			onClick={handleClick}
		>
			<Spinner loading={isPending} size="sm">
				<FaWandMagicSparkles />
				<span>ویرایش متن نامه با هوش مصنوعی</span>
			</Spinner>
		</Button>
	);
}

export { LetterAiEditButton };
