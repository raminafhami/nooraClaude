"use client";

import { useCallback, useState } from "react";

function useDragDrop<T>({
	items,
	itemId,
	itemColumn,
	itemOrder,
}: {
	items: T[];
	itemId: keyof T;
	itemColumn: keyof T;
	itemOrder: keyof T;
}) {
	const [hiddenCol, setHiddenCol] = useState<string>("");

	const onDragUpdate = useCallback((update: any) => {
		if (update.destination?.droppableId !== update.source?.droppableId) {
			setHiddenCol(update.destination?.droppableId);
		} else {
			setHiddenCol("");
		}
	}, []);

	const onDragEnd = useCallback(
		async (result: any) => {
			setHiddenCol("");

			const { source, destination, draggableId } = result;
			if (!destination) return;

			const sourceColumnId = source.droppableId;
			const destinationColumnId = destination.droppableId;
			let destinationIndex: number = 0;

			const columnItems = items
				.filter((item) => item[itemColumn] === sourceColumnId)
				.sort((a, b) => +a[itemOrder] - +b[itemOrder]);

			let updatedItems: T[];

			if (destinationColumnId === sourceColumnId) {
				destinationIndex = destination.index;

				const movingTask = columnItems[source.index];

				columnItems.splice(source.index, 1);
				columnItems.splice(destination.index, 0, movingTask);

				updatedItems = items.map((item: T) => {
					const updatedItem = columnItems.find(
						(x) => x[itemId] === item[itemId],
					);

					return updatedItem
						? {
								...updatedItem,
								[itemOrder]: columnItems.indexOf(updatedItem) + 1,
							}
						: item;
				});
			} else {
				updatedItems = [...items];
				const movingItemIndex = updatedItems.findIndex(
					(item) => item[itemId] === draggableId,
				);
				const movingItem = updatedItems[movingItemIndex];
				updatedItems.splice(movingItemIndex, 1);
				movingItem[itemColumn] = destinationColumnId;
				updatedItems.splice(destination.index, 0, movingItem);

				const destinationItems = items.filter(
					(item) => item[itemColumn] === destinationColumnId,
				);

				destinationIndex = destinationItems.length;
			}

			return {
				sourceColumnId,
				destinationColumnId,
				destinationIndex,
				updatedItems,
			};
		},
		[items, itemId, itemColumn, itemOrder],
	);

	return { hiddenCol, setHiddenCol, onDragUpdate, onDragEnd };
}

export { useDragDrop };
