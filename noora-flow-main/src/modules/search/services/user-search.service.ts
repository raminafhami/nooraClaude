import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as moment from 'moment-jalaali';
import { UserFileReportDto, UserReportDto } from '../dtos/report.dto';
import { userMapping } from '../mapping/user.mapping';
import { UserSearchBody } from '../interfaces/user-search.interface';
import { UserTypes } from 'src/modules/users/schemas/user.schema';
moment.loadPersian({ usePersianDigits: false });

@Injectable()
export class UserSearchService implements OnModuleInit {
  private readonly index = 'users';

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
            mappings: userMapping,
          },
        });
      } else {
        await this.elasticsearchService.indices.putMapping({
          index: this.index,
          ...userMapping,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async indexUser(user: any) {
    const date = {
      year: moment(user.createdAt).locale('fa').jYear(),
      month: moment(user.createdAt).locale('fa').jMonth(),
      dayOfYear: moment(user.createdAt).locale('fa').jDayOfYear(),
    };

    return this.elasticsearchService.index<UserSearchBody>({
      index: this.index,
      id: user.id.toString(),
      body: {
        id: user.id.toString(),
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        nationalCode: user.nationalCode,
        email: user.email,
        phoneNo: user.phoneNo,
        password: user.password,
        setPassword: user.setPassword,
        type: user.type,
        groups: user.groups,
        branchId: user.branchId,
        bankAccountNumber: user.bankAccountNumber,
        bankCardNumber: user.bankCardNumber,
        bankSheba: user.bankSheba,
        bankAccountOwner: user.bankAccountOwner,
        sepidarId: user.sepidarId,
        credit: user.credit,
        postalCode: user.postalCode,
        address: user.address,
        isActive: user.isActive,
        loginType: user.loginType,
        createdBy: user.createdBy,
        createdAt: user.createdAt,
        ...date,
      },
    });
  }

  async getUsers(reportDto: UserReportDto) {
    let dateTransform = null;

    dateTransform = (date) => moment(date).locale('fa');
    const allBuckets = { count: 0, data: [] };
    let afterKey = null;
    const defaultFrom: number = 0;
    const defaultSize: number = 10;
    while (true) {
      const body: any = {
        query: {
          bool: {
            filter: [
              {
                range: {
                  createdAt: {
                    gte: reportDto.dateFrom,
                    lte: reportDto.dateTo,
                  },
                },
              },
              {
                term: {
                  type: UserTypes.NORMAL,
                },
              },
            ],
          },
        },
        sort: [
          {
            createdAt: {
              order: reportDto.sort,
            },
          },
        ],
        from: reportDto.page ? reportDto.page * reportDto.size : defaultFrom,
        size: reportDto.size ?? defaultSize,
      };

      if (afterKey) {
        body.aggs.users.composite.after = afterKey;
      }

      const response: any = await this.elasticsearchService.search({
        index: this.index,
        body,
      });
      allBuckets.count = response.hits.total.value;
      const buckets = response.hits.hits.map((bucket: any) => {
        const createdAt = moment(bucket._source.createdAt);
        return {
          createdAt: dateTransform(createdAt).format('jYYYY-jMM-jDD'),
          user: {
            id: bucket._id,
            name: bucket._source.name,
            lastname: bucket._source.lastname,
            phoneNo: bucket._source.phoneNo,
          },
        };
      });

      allBuckets.data.push(...buckets);

      if (response?.aggregations?.users['after_key']) {
        afterKey = response.aggregations.users['after_key'];
      } else {
        break;
      }
    }
    return allBuckets;
  }

  async getUsersWithoutFile(reportDto: UserFileReportDto) {
    const body: any = {
      size: 10000,
      query: {
        term: {
          type: UserTypes.NORMAL,
        },
      },
      _source: ['name', 'lastname', 'nationalCode', 'phoneNo'],
    };

    const users: any = await this.elasticsearchService.search({
      index: this.index,
      body,
    });

    const userIds = users.hits.hits.map((user: any) => user._id);

    const processInstancesQuery: any = {
      size: 10000,
      query: {
        bool: {
          must: [
            {
              terms: {
                'parameters.assignees.customer.id': userIds,
              },
            },
          ],
        },
      },
      _source: ['parameters.assignees.customer.id'],
    };

    const processInstances: any = await this.elasticsearchService.search({
      index: 'instances',
      body: processInstancesQuery,
    });

    const usersWithFiles = new Set(
      processInstances.hits.hits.map(
        (instance: any) => instance._source.parameters.assignees.customer.id,
      ),
    );

    // Filter users without files
    const finalResult = users.hits.hits
      .filter((user: any) => !usersWithFiles.has(user._id))
      .map((user: any) => ({
        name: user._source.name,
        lastname: user._source.lastname,
        phoneNo: user._source.phoneNo,
        id: user._id,
      }));

    // Pagination logic
    const page = reportDto.page || 0;
    const pageSize = reportDto.size || 10;
    const totalCount = finalResult.length;

    const paginatedData = finalResult.slice(
      page * pageSize,
      (page + 1) * pageSize,
    );

    return {
      count: totalCount,
      data: paginatedData,
    };
  }
}
