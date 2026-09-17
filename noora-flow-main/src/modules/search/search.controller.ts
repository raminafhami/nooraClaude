import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InstanceSearchService } from './services/instance-search.service';
import {
  DebtReportDto,
  ProcessCompletionReportDto,
  RecentProcessesDto,
  ReportDto,
  UserFileReportDto,
  UserReportDto,
  UserTaskReportDto,
} from './dtos/report.dto';
import { DebtSearchService } from './services/debt-search.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchBodyDto } from './dtos/search-body.dto';
import { SearchQueryBuilder } from './search-query-builder';
import {
  ElasticFilteringParams,
  IElasticFiltering,
} from 'src/common/decorators/elastic-filter.decorator';
import {
  ElasticSortingParams,
  IElasticSort,
} from 'src/common/decorators/elastic-sort.decorator';
import { BuildPeriodicReportDto } from './dtos/build-periodic-report.dto';
import { ElasticGroupParam } from 'src/common/decorators/elastic-group.decorator';
import {
  ElasticAggFuncParam,
  IElasticAggFunc,
} from 'src/common/decorators/elastic-agg-func.decorator';
import * as moment from 'moment-jalaali';
import { UserSearchService } from './services/user-search.service';
import { UserTaskSearchService } from './services/user-task-search.service';
import { IncomeSearchService } from './services/income-search.service';
moment.loadPersian({ usePersianDigits: false });

@Controller('reports')
@ApiTags('search')
@ApiBearerAuth('token')
export class SearchController {
  constructor(
    private readonly instanceSearchService: InstanceSearchService,
    private readonly debtSearchService: DebtSearchService,
    private readonly userSearchService: UserSearchService,
    private readonly userTaskSearchService: UserTaskSearchService,
    private readonly incomeSearchService: IncomeSearchService,
  ) {}

  @Get('inspectionfee/marketer')
  async getInspectionFeeReport(@Query() reportDto: ReportDto) {
    const data = await this.instanceSearchService.getInspectionFeeReport(
      reportDto,
    );
    return data;
  }

  @Get('debts')
  async getDebts(@Query() reportDto: DebtReportDto) {
    const data = await this.debtSearchService.getDebts(reportDto);
    return data;
  }

  @Get('users')
  async getUsers(@Query() reportDto: UserReportDto) {
    const data = await this.userSearchService.getUsers(reportDto);
    return data;
  }

  @Get('users/no-files')
  async getUsersWithoutFile(@Query() reportDto: UserFileReportDto) {
    const data = await this.userSearchService.getUsersWithoutFile(reportDto);
    return data;
  }

  @Get('instances')
  async getInstances(
    @Query() searchBodyDto: SearchBodyDto,
    @ElasticFilteringParams([
      'processDefinitionKey',
      'currentState',
      'caseNo',
      'date',
      'status',
      'parameters.assignees.marketer',
      'parameters.assignees.customer',
      'parameters.assignees.coordinator.id',
      'parameters.branch',
      'jalaliDate',
      'parameters.assignees.coordinator',
      'parameters.invoicePaymentStatus',
      'parameters.processType',
    ])
    filters: IElasticFiltering[],
    @ElasticSortingParams(['date']) sort: IElasticSort[],
    @ElasticAggFuncParam([
      'inspectionCosts.total',
      'parameters.amount',
      'parameters.inspectionFeeInRial',
    ])
    aggFuncs: IElasticAggFunc[],
  ) {
    let searchQueryBuilder = new SearchQueryBuilder();
    let elasticQuery = searchQueryBuilder.addDynamicQuery(filters);

    if (searchBodyDto.groupBy) {
      elasticQuery.addAggregation(
        searchBodyDto.groupBy,
        'terms',
        searchBodyDto.size,
      );

      if (aggFuncs.length > 0) {
        aggFuncs.forEach((aggFunc) => {
          elasticQuery.addAggregation(
            aggFunc.property,
            aggFunc.func,
            searchBodyDto.size,
            searchBodyDto.groupBy,
            [],
          );
        });
      }

      elasticQuery.addAggregation(
        'select',
        'top_hits',
        1,
        searchBodyDto.groupBy,
        searchBodyDto.select.split(','),
      );
    }
    const elasticSort = searchQueryBuilder.sort(sort);
    let searchQuery = searchQueryBuilder.build();

    const result = await this.instanceSearchService.search(
      'instances',
      searchQuery,
      searchBodyDto.page,
      searchBodyDto.size,
      elasticSort,
    );

    return result;
  }

  @Get('process-completion')
  async processPerformance(@Query() reportDto: ProcessCompletionReportDto) {
    const data = await this.instanceSearchService.getProcessPerformance(
      reportDto,
    );
    return data;
  }

  @Get('denormalized-instances')
  async getDenormalizedInstances(
    @Query() searchBodyDto: SearchBodyDto,
    @ElasticFilteringParams(['caseNo']) filters: IElasticFiltering[],
    @ElasticSortingParams() sort: IElasticSort[],
    @ElasticAggFuncParam(['inspectionCosts.total'])
    aggFuncs: IElasticAggFunc[],
  ) {
    let searchQueryBuilder = new SearchQueryBuilder();
    let elasticQuery = searchQueryBuilder.addDynamicQuery(filters);
    const elasticSort = searchQueryBuilder.sort(sort);

    if (searchBodyDto.groupBy) {
      elasticQuery.addAggregation(
        searchBodyDto.groupBy,
        'terms',
        searchBodyDto.size,
      );
      if (aggFuncs.length > 0) {
        aggFuncs.forEach((aggFunc) => {
          elasticQuery.addAggregation(
            aggFunc.property,
            aggFunc.func,
            searchBodyDto.size,
            searchBodyDto.groupBy,
            searchBodyDto.select.split(','),
            ['debts', 'inspectionCosts'],
          );
        });
      }

      elasticQuery.addAggregation(
        'select',
        'top_hits',
        1,
        searchBodyDto.groupBy,
        searchBodyDto.select.split(','),
      );
    }
    const searchQuery = searchQueryBuilder.build();
    const result = await this.instanceSearchService.search(
      'denormalizedinstance',
      searchQuery,
      searchBodyDto.page,
      searchBodyDto.size,
      elasticSort,
    );
    return result;
  }

  @Get('build-periodic-report')
  async buildPeriodicReport(
    @Query() buildPeriodicReportDto: BuildPeriodicReportDto,
    @ElasticFilteringParams([
      'processDefinitionKey',
      'currentState',
      'status',
      'caseNo',
      'date',
      'jalaliDate',
      'parameters.assignees.marketer',
      'parameters.assignees.coordinator',
      'parameters.invoicePaymentStatus',
    ])
    filters: IElasticFiltering[],
    @ElasticGroupParam([
      'processDefinitionKey',
      'parameters.assignees.marketer.id',
      'parameters.assignees.marketer.name',
      'parameters.assignees.coordinator',
      'parameters.processType',
    ])
    groupBy: string,
    @ElasticAggFuncParam([
      'caseNo',
      'parameters.amount',
      'inspectionCosts.total',
      'parameters.inspectionFeeInRial',
    ])
    aggFuncs: IElasticAggFunc[],
  ) {
    let searchQueryBuilder = new SearchQueryBuilder();
    searchQueryBuilder.addDynamicQuery(filters);
    let searchQuery = searchQueryBuilder.build();
    let compiledAggFunc = {};
    aggFuncs.forEach((aggFunc) => {
      compiledAggFunc = searchQueryBuilder.makeAggFunc(
        aggFunc.property,
        aggFunc.func,
        ['inspectionCosts', 'debts'],
      );
    });

    const result = await this.instanceSearchService.buildPeriodicReport({
      query: searchQuery.query,
      index: 'denormalizedinstance',
      aggs: [searchQueryBuilder.makeAggregation(groupBy, 'terms')],
      period: buildPeriodicReportDto.period,
      compiledAggFunc,
      groupBy: groupBy,
      size: buildPeriodicReportDto.size,
      select: buildPeriodicReportDto.select,
    });
    return result;
  }

  @Get('customers-recent-file')
  async getCustomersRecentProcesses(@Query() reportDto: RecentProcessesDto) {
    const data =
      await await this.instanceSearchService.getCustomersByRecentProcesses(
        reportDto,
      );
    return data;
  }

  @Get('user-task-completion')
  async userTaskPerformance(@Query() reportDto: UserTaskReportDto) {
    const data = await this.userTaskSearchService.getUserTasksPerformance(
      reportDto,
    );
    return data;
  }

  @Get('test')
  async test() {
    return await this.instanceSearchService.test();
  }

  @Get('weekly-instance-report')
  async weeklyInstanceReport() {
    const instanceData = await this.instanceSearchService.weeklyProcessReport();
    const incomes = await this.incomeSearchService.weeklyPidIncomes();
    return {
      ...instanceData,
      ...incomes
    }
  }
}
