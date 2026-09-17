import { ApplicationsSearch } from "./ApplicationsSearch";
import { ApplicationsTable } from "./ApplicationsTable";
import { Application } from "./models/Application";
import { ApplicationQuery } from "./models/ApplicationQuery";

function ApplicationsList({
	applications,
	error,
	isLoading,
	offset,
	ApplicationsPagination,
	handleQueryUpdate,
}: {
	error: string;
	isLoading: boolean;
	offset: number;
	applications: Application[];
	ApplicationsPagination: any;
	handleQueryUpdate: (query: ApplicationQuery) => void;
}) {
	return (
		<div className="space-y-6">
			<ApplicationsSearch onQueryUpdate={handleQueryUpdate} />
			<ApplicationsTable
				error={error}
				loading={isLoading}
				offset={offset}
				applications={applications}
			/>
			<ApplicationsPagination />
		</div>
	);
}

export default ApplicationsList;
