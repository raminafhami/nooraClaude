import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as moment from 'moment-jalaali';
import { userTaskMapping } from '../mapping/user-tasks.interface';
import { UserTaskSearchBody } from '../interfaces/user-task.interface';
import { UserTaskReportDto } from '../dtos/report.dto';
moment.loadPersian({ usePersianDigits: false });

@Injectable()
export class UserTaskSearchService implements OnModuleInit {
  private readonly index = 'usertasks';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.index,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.index,
          body: {
            mappings: userTaskMapping,
          },
        });
      } else {
        await this.elasticsearchService.indices.putMapping({
          index: this.index,
          ...userTaskMapping,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async indexUserTask(userTask: any) {
    const date = {
      year: moment(userTask.expiryAt).locale('fa').jYear(),
      month: moment(userTask.expiryAt).locale('fa').jMonth(),
      dayOfYear: moment(userTask.expiryAt).locale('fa').jDayOfYear(),
    };

    return this.elasticsearchService.index<UserTaskSearchBody>({
      index: this.index,
      id: userTask.id.toString(),
      body: {
        id: userTask.id.toString(),
        processDefinitionId: userTask.processDefinitionId,
        processDefinitionKey: userTask.processDefinitionKey,
        processDefinitionName: userTask.processDefinitionName,
        processInstanceId: userTask.processInstanceId,
        caseNo: userTask.caseNo,
        rootProcessInstanceId: userTask.rootProcessInstanceId,
        taskId: userTask.taskId,
        key: userTask.key,
        summary: userTask.summary,
        description: userTask.description,
        assignee: userTask.assignee,
        expStartDate: userTask.expStartDate,
        expEndDate: userTask.expEndDate,
        dueDate: userTask.dueDate,
        timeStarted: userTask.timeStarted,
        timeCompleted: userTask.timeCompleted,
        status: userTask.status,
        createdBy: userTask.createdBy,
        completedBy: userTask.completedBy?.userId,
        updatedBy: userTask.updatedBy,
        history: {
          timeActivated: userTask.timeActivated,
          timeStarted: userTask.timeStarted,
          timeCompleted: userTask.timeCompleted,
        },
        referredBy: userTask.referredB,
        readAt: userTask.readA,
        createdAt: userTask.createdAt,
        ...date,
      },
    });
  }
  
  async getUserTasksPerformance(reportDto: UserTaskReportDto) {
    const mustQuery: any[] = [
      { exists: { field: 'dueDate' } },
      { exists: { field: 'timeCompleted' } },
    ];
    const filterQuery = [];
  
    if (reportDto.dateFrom) {
      filterQuery.push({
        range: {
          createdAt: {
            gte: reportDto.dateFrom,
          },
        },
      });
    }
    if (reportDto.dateTo) {
      filterQuery.push({
        range: {
          createdAt: {
            lte: reportDto.dateTo,
          },
        },
      });
    }
  
    const allBuckets = [];
    let afterKey = null;
  
    // Step 1: Get all unique assignees using composite aggregation
    while (true) {
      const body: any = {
        query: {
          bool: {
            must: mustQuery,
            filter: filterQuery,
          },
        },
        aggs: {
          group_by_assignee: {
            composite: {
              sources: [{ assignee: { terms: { field: 'assignee' } } }],
              size: 10000,
              ...(afterKey ? { after: afterKey } : {}), // Pagination for composite aggregation
            },
          },
        },
      };
  
      const userTasksResponse: any = await this.elasticsearchService.search({
        index: this.index,
        body,
      });
  
      const buckets = userTasksResponse.aggregations.group_by_assignee.buckets || [];
      if (buckets.length === 0) break;
  
      const assigneeIds = buckets.map((bucket: any) => bucket.key.assignee);
      allBuckets.push(...assigneeIds);
  
      afterKey = userTasksResponse.aggregations.group_by_assignee.after_key || null;
      if (!afterKey) break;
    }
  
    // Step 2: Fetch user names based on user IDs
    const usersResponse: any = await this.elasticsearchService.search({
      index: 'users',
      body: {
        size: 10000,
        query: { bool: { must: [{ terms: { _id: allBuckets } }] } },
        _source: ['name', 'lastname'],
      },
    });
  
    const users = usersResponse.hits.hits.reduce((acc, user) => {
      acc[user._id] = `${user._source.name} ${user._source.lastname}`;
      return acc;
    }, {});
  
    // Step 3: Fetch all tasks per assignee
    const processedData = [];
    for (const assignee of allBuckets) {
      let allTasks = [];
      let searchAfter = null;
  
      while (true) {
        const taskResponse = await this.elasticsearchService.search({
          index: this.index,
          body: {
            size: 10000,
            query: {
              bool: {
                must: [...mustQuery, { term: { assignee } }],
                filter: filterQuery,
              },
            },
            _source: ['dueDate', 'timeCompleted'],
            sort: [{ createdAt: 'asc' }],
            ...(searchAfter ? { search_after: searchAfter } : {}),
          },
        });
  
        const hits = taskResponse.hits.hits;
        if (hits.length === 0) break;
  
        allTasks.push(...hits);
        searchAfter = hits[hits.length - 1].sort;
      }
  
      // Step 4: Process the fetched tasks
      let success = 0;
      let fail = 0;
      allTasks.forEach((e) => {
        if (e._source?.dueDate && e._source?.timeCompleted) {
          if (e._source.dueDate >= e._source.timeCompleted) {
            success++;
          } else {
            fail++;
          }
        }
      });
  
      processedData.push({
        assignee,
        assigneeName: users[assignee] || 'Unknown',
        totalTasks: allTasks.length ?? 0,
        successTasks: success ?? 0,
        failTasks: fail ?? 0,
        successPercentages: parseFloat(((success / (allTasks.length || 1)) * 100).toFixed(2)) || 0,
        failPercentages: parseFloat(((fail / (allTasks.length || 1)) * 100).toFixed(2)) || 0,
      });
    }
  
    // Step 5: Paginate processed data before returning
    const page = reportDto.page || 0;
    const pageSize = reportDto.size || 10;
    const totalCount = processedData.length;
  
    return {
      count: totalCount,
      data: processedData.slice(page * pageSize, (page + 1) * pageSize),
    };
  }
}
