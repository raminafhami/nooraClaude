import { Loading } from "../Loader";

interface Props {
	title?: string;
}

export function Wait({ title }: Props) {
	return (
		<Loading className="px-10 py-10" size="md" verticalPlacement="start">
			{title}
		</Loading>
	);
}
