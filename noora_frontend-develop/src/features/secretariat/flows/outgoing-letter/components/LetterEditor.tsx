import { useFormContext } from "react-hook-form";

import {
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";

import { ids } from "../models/Ids";
import { TinyEditor } from "./TinyEditor";

type FormSchema = {
	[ids.letterContent]: string;
};

function LetterEditor() {
	const { control } = useFormContext<FormSchema>();

	return (
		<FormField
			control={control}
			name={ids.letterContent}
			render={({ field }) => (
				<FormItem className="w-full max-w-[612px]">
					<div className="!m-0">
						<FormControl>
							<TinyEditor {...field} />
						</FormControl>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export { LetterEditor };
