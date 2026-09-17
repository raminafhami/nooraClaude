"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteCourse } from "@/courses/services/deleteCourse";
import { Loading } from "@/ui/Loader";

function CourseDeleteDialog({
	open,
	payload,
	onClose,
}: {
	open: boolean;
	payload: string;
	onClose: (result?: boolean) => void;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent
				onInteractOutside={(event) => {
					if (isLoading) event.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>تایید حذف دوره آموزشی</DialogTitle>
					<DialogDescription>
						آیا از حذف این دوره آموزشی مطمئن هستید؟
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						disabled={isLoading}
						type="button"
						variant="ghost"
						onClick={() => onClose()}
					>
						بازگشت
					</Button>
					<Button
						disabled={isLoading}
						type="button"
						variant="destructive"
						onClick={async () => {
							try {
								setIsLoading(true);
								await deleteCourse(payload);
								toast.error("دوره آموزشی مورد نظر با موفقیت حذف شد.");
								onClose(true);
							} catch (err) {
								toast.error(
									"خطای نامشخصی در هنگام حذف دوره آموزشی مورد نظر رخ داد.",
								);
								console.error(err);
							} finally {
								setIsLoading(false);
							}
						}}
					>
						<span>حذف دوره آموزشی</span>
						{isLoading && <Loading size="xs" intent="white" />}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { CourseDeleteDialog };
