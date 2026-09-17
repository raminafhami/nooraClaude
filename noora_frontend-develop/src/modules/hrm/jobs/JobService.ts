import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models";

import { Expertise } from "../expertises/models/Expertise";
import { JobDepartment, JobDescription, JobRequireMentsApi } from "./models";

interface JobDescriptionApi {
	id: string;
	code: string;
	name: string;
	department: JobDepartment;
	supervisor: string;
	definition: string;
	duties: string[];
	authorities: string[];
	requirements: JobRequireMentsApi;
	metadata: any;
}

interface JobDescriptionCreateOrUpdateDto extends Omit<JobDescription, "id"> {}

type FilterParam = "name" | "_id" | "$or";

export class JobService {
	static parse(from: JobDescriptionApi): JobDescription {
		const result = new JobDescription();

		result.id = from.id;
		result.code = from.code;
		result.name = from.name;
		result.department = from.department;
		result.supervisor = from.supervisor;
		result.definition = from.definition;
		result.duties = from.duties;
		result.authorities = from.authorities;
		result.requirements = ((requirements: JobRequireMentsApi) => ({
			...requirements,
			expertises: requirements.expertises as Expertise[],
		}))(from.requirements);
		result.metadata = from.metadata;

		return result;
	}

	static parseRange(from: JobDescriptionApi[]): JobDescription[] {
		return from.map((x) => this.parse(x));
	}

	static async get(
		options: Partial<{
			filters: {
				name: FilterParam;
				value: any;
				type?: "equals" | "like";
			}[];
			page: number | { no: number; size: number };
		}> = {},
	): Promise<PagedResult<JobDescription> | JobDescription[]> {
		let filters: any = {};
		let search: any = {};

		if (options.filters) {
			options.filters.forEach((filter) => {
				if (!filter.type || filter.type === "equals") {
					filters[filter.name] = filter.value;
				} else if (filter.type === "like") {
					search[filter.name] = filter.value;
				}
			});
		}

		let pageNo: number;
		let pageSize: number;
		if (options.page) {
			if (typeof options.page === "number") {
				pageNo = options.page;
				pageSize = 10;
			} else {
				pageNo = options.page.no;
				pageSize = options.page.size;
			}
		} else {
			pageNo = 0;
			pageSize = Number.MAX_SAFE_INTEGER;
		}

		const response = await apiClient.get<
			PagedResultApiModel<JobDescriptionApi>
		>({
			url: `/job-description?page=${pageNo}&size=${pageSize}&filters=${
				Object.keys(filters).length !== 0 ? JSON.stringify(filters) : ""
			}&search=${
				Object.keys(search).length !== 0 ? JSON.stringify(search) : ""
			}&sort=${JSON.stringify({ code: "asc" })}`,
		});

		if (!options.page) {
			return this.parseRange(response.result.data);
		}

		return new PagedResult(
			this.parseRange(response.result.data),
			pageNo,
			pageSize,
			response.result.count,
		);
	}

	static async getById(id: string): Promise<JobDescription> {
		const response = await apiClient.get<JobDescriptionApi>({
			url: `/job-description/${id}`,
		});

		if (!response.success) {
			throw new Error();
		}

		return this.parse(response.result);
	}

	static async create(
		details: JobDescriptionCreateOrUpdateDto,
	): Promise<JobDescription> {
		const response = await apiClient.post<JobDescriptionApi>({
			url: `/job-description`,
			body: details,
		});

		return this.parse(response.result);
	}

	static async update(
		id: string,
		details: JobDescriptionCreateOrUpdateDto,
	): Promise<JobDescription> {
		const response = await apiClient.put<JobDescriptionApi>({
			url: `/job-description/${id}`,
			body: details,
		});

		return this.parse(response.result);
	}

	static async delete(id: string): Promise<boolean> {
		await apiClient.delete({
			url: `/job-description/${id}`,
		});

		return true;
	}
}
