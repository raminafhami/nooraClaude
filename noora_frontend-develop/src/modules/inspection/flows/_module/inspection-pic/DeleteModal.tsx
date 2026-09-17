import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Loading } from "@/ui/Loader";

interface Props {
	submit: any;
	loading: boolean;
	title: string;
	open: boolean;
	setOpen: (s: boolean) => void;
}
export default function DeleteModal({
	submit,
	loading,
	title,
	open,
	setOpen,
}: Props) {
	return (
		<div>
			<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
				<DialogTrigger
					onClick={() => setOpen(true)}
					className="w-25 float-left ml-2 mt-5"
				></DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>آیا مطمئن هستید؟</DialogTitle>
					</DialogHeader>
					<DialogDescription>
						فایل مورد نظر به صورت کامل حذف خواهد شد!
					</DialogDescription>
					<DialogFooter>
						<Button onClick={submit} variant="destructive" disabled={loading}>
							{loading ? (
								<Loading
									verticalPlacement="center"
									horizontalPlacement="center"
								/>
							) : (
								"حذف فایل"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
