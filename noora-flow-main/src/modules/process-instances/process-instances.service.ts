import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import {
  CreateProcessInstanceDto,
  UpdateProcessInstanceDto,
  GetQueryDto,
  StartProcessInstanceBodyDto,
  GetProcessInstanceStatsQueryDto,
  GetOneProcessInstanceQueryDto,
  UpdateProcessInstanceQueryDto,
  UpdateProcessWatcher,
  UpdateInstanceState,
  GetQueryWithDownloadDto,
  CancelProcessInstanceDto,
} from './dtos';
import { CustomMessages } from 'src/common/const/custom-messages';
import { Compiler } from './providers/compiler';
import { Constants, LogEntities, Operations } from 'src/common/const/constants';
import { Executor } from 'src/modules/tasks/providers/executor';
import {
  IncomeStatuses,
  InvoicePaymentStatuses,
  Webhooks,
} from 'src/common/const/enums';
import { CommonHeadersDto } from 'src/shared/dtos';
import * as moment from 'moment';
import { ClientSession, FilterQuery, Types } from 'mongoose';
import { ProcessInstanceRepositoryImpl } from './repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from '../process-definitions/repository/process-definitions.repository.impl';
import CustomError from 'src/common/providers/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { _ } from 'lodash';
import { IndicatorService } from '../indicator/indicator.service';
import { InstanceReportDto, PeriodEnum } from './dtos/instance-report.dto';
import { ProcessInstanceDocument } from './schemas/process-instances.schema';
import { ContractNumberService } from '../contract-number/contract-number.service';
import { IncomeDocument } from '../income/schemas/income.schema';
import { IncomeService } from '../income/income.service';
import * as ms from 'ms';
import { groupBySimple } from 'src/common/utils/data.util';
import { InvoiceService } from '../invoice/invoice.service';
import Roles from 'src/config/Constants/roles';
import { InspectionCostsService } from '../inspection-costs/inspection-costs.service';

@Injectable()
export class ProcessInstanceService {
  private readonly logger: Logger = new Logger(ProcessInstanceService.name);

  constructor(
    private processInstanceRepositoryImpl: ProcessInstanceRepositoryImpl,
    private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
    private compiler: Compiler,
    private execute: Executor,
    private indicatorService: IndicatorService,
    private contractNumberService: ContractNumberService,
    private readonly incomeService: IncomeService,
    private readonly invoiceService: InvoiceService,
    private readonly inspectionCostService: InspectionCostsService,
  ) {}

  /**
   * Create a process instance by process definition id
   * @param headers {object} - Defined request headers
   * @param processDefinitionId {string} - _id of the process definition document
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async createByDefinitionId(
    processDefinitionId: string,
  ): Promise<CustomResponse | CustomError> {
    const workflow = await this.processDefinitionRepositoryImpl.findOne(
      { _id: processDefinitionId },
      { name: 1, key: 1, stages: 1 },
    );
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_EXISTS,
      );
    }
    const compiledWorkflow = this.compiler.compile(workflow, null, null);
    const data = await this.processInstanceRepositoryImpl.create(
      compiledWorkflow,
    );

    return new CustomResponse(
      HttpStatus.CREATED,
      CustomMessages.PROCESS_INSTANCE_CREATED,
      { _id: data._id },
    );
  }

  /**
   * Create a process instance by process definition key & version
   * @param headers {object} - Defined request headers
   * @param query {object} - Defined query params
   * @param key {string} - process definition key
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async createByDefinitionKey(
    query: GetOneProcessInstanceQueryDto,
    key: string,
  ): Promise<CustomResponse | CustomError> {
    const workflow = await this.processDefinitionRepositoryImpl.findOne(
      { key, ...(query.version && { version: query.version }) },
      { name: 1, key: 1, stages: 1, version: 1 },
      { version: -1 },
    );
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_EXISTS,
      );
    }
    const compiledWorkflow = this.compiler.compile(workflow, null, null);
    const data = await this.processInstanceRepositoryImpl.create(
      compiledWorkflow,
    );

    return new CustomResponse(
      HttpStatus.CREATED,
      CustomMessages.PROCESS_INSTANCE_CREATED,
      { _id: data._id },
    );
  }

  /**
   * Start the process instance by process instance id
   * @param processInstanceId {string} - _id of the process instance document
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async start(
    processInstanceId: string,
    processInstanceBody: StartProcessInstanceBodyDto & { owner: string },
  ): Promise<CustomResponse | CustomError> {
    try {
      const processInstance = await this.processInstanceRepositoryImpl.findOne(
        { _id: processInstanceId, status: Constants.STAGE_STATUSES.ACTIVE },
        {
          stages: 1,
          _startIndex: 1,
          isParallel: 1,
          properties: 1,
          status: 1,
          stateList: 1,
          caseNo: 1,
        },
      );
      if (!processInstance) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          CustomMessages.PROCESS_INSTANCE_NOT_FOUND,
        );
      }
      const [isValid, error] = this.execute.validateParameters(
        processInstance.properties,
        processInstanceBody?.parameters,
      );
      if (!isValid) {
        // If flow is started by the API call
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          error || 'Error in process definition',
        );
      }
      await this.execute.startFlow(processInstance, processInstanceBody);

      // mark current task as complete
      // GoTo next stage
      // mark next task as active
      // this.execute.goToNextStage(processInstance, taskDetails.nextStage);
      return new CustomResponse(
        HttpStatus.CREATED,
        CustomMessages.PROCESS_INSTANCE_RUNNING,
        processInstance,
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update the instance parameters by instance id
   * @param processInstanceId {string} - _id of the process instance document
   * @param updateProcessInstanceDto {object} - Input payload required to update an instance, e.g. {parameters: {}}
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async updateInstances(
    processInstanceId: string,
    updateProcessInstanceDto: UpdateProcessInstanceDto,
    query: UpdateProcessInstanceQueryDto,
    session?: ClientSession,
  ): Promise<CustomResponse | CustomError> {
    const workflow = await this.processInstanceRepositoryImpl.findOne(
      { _id: processInstanceId },
      { parameters: 1 },
    );
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_FOUND,
      );
    }
    const updatedProcessInstance = {
      ...workflow.parameters,
      ...updateProcessInstanceDto.parameters,
    };

    let data = null;
    if (query.cascade === 'true') {
      // if cascade true then update all the child instances including the parent
      data = await this.processInstanceRepositoryImpl.updateMany(
        { rootProcessInstanceId: processInstanceId },
        { parameters: updatedProcessInstance },
        session,
      );
    } else {
      // if cascade false then update only the instance which matches the process instance id
      data = await this.processInstanceRepositoryImpl.updateOne(
        { _id: processInstanceId },
        { parameters: updatedProcessInstance },
        session,
      );
    }

    return data;
  }

  /**
   * List all the process instances by process definition id
   * @param processDefinitionId {string} - _id of the process definition document
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getInstancesByDefinitionId(
    processDefinitionId: string,
    query: GetQueryDto,
  ) {
    const condition = { processDefinitionId };
    return this.findAll(condition, query);
  }

  /**
   * List all the process instances by process definition key
   * @param processDefinitionKey {string} - key of the process definition
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getInstancesByDefinitionKey(
    processDefinitionKey: string,
    query: GetQueryDto,
  ) {
    const condition = { processDefinitionKey };
    return this.findAll(condition, query);
  }

  /**
   * Generic findAll method to list the process isnatnces
   * @param rootCondition {object} - mongo condition
   * @param query {object} - Defined query params
   * @returns  {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findAll(rootCondition: any, query: GetQueryDto) {
    const props = query.props?.split(',');
    const instanceProp = [
      '_id',
      'processDefinitionId',
      'processDefinitionKey',
      'processDefinitionName',
      'currentState',
      'caseNo',
      'contractNo',
      'stateList',
      'status',
      'createdAt',
      'updatedAt',
      'holdBy',
      'resumedBy',
      'cancelledBy',
      'reason',
      'description',
      'timeActivated',
      'timeCompleted',
      'maxPossibleDuration',
      'feasibilityProcessInstanceId',
    ].join(' ');
    let condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    let dateFilters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.dateFilters) {
        dateFilters = JSON.parse(query.dateFilters);
        if (dateFilters.startDate && dateFilters.endDate) {
          condition.$and.push({
            createdAt: {
              $gte: moment(dateFilters.startDate).startOf('day'),
              $lt: moment(dateFilters.endDate).endOf('day'),
            },
          });
        }
      }

      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (const key in search) {
          if (search.hasOwnProperty(key)) {
            const obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') };
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }

      if (query.sort) {
        sort = JSON.parse(query.sort);
      }
    } catch (err) {
      this.logger.error(err);

      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }

    if (rootCondition) condition.$and.push(rootCondition);
    if (condition.$and.length == 0) {
      condition = {};
    }

    // const defaultProjection = {
    //   _startIndex: 0,
    //   _endIndex: 0,
    //   _flags: 0,
    //   _stageIndexJSON: 0,
    // };

    const count = await this.processInstanceRepositoryImpl.count(condition);
    const data = await this.processInstanceRepositoryImpl.find(
      condition,
      props?.map((p) => `parameters.${p}`).join(' ') + ' ' + instanceProp ||
        '-parameters',
      query.page,
      query.size,
      sort,
      query.populate,
    );
    return { data, count };
  }

  /**
   * Find a process instance by process instance id
   * @param id {string} - _id of the process instance document
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findOne(id: string, props: string[]) {
    const defaultProjection = {
      _startIndex: 0,
      _endIndex: 0,
      _flags: 0,
      _stageIndexJSON: 0,
    };
    const workflow = await this.processInstanceRepositoryImpl.findOne(
      { _id: id },
      defaultProjection,
    );
    if (!workflow) {
      throw new NotFoundException('instance not found.');
    }

    workflow.parameters = props?.reduce((acc, cur) => {
      const isExist =
        !!workflow?.parameters &&
        (workflow.parameters as object).hasOwnProperty(cur);

      if (isExist) {
        const value = workflow?.parameters[cur];
        return {
          ...acc,
          [cur]: value,
        };
      }
      return acc;
    }, {}) as any;
    return workflow;
  }

  /**
   * Find a process instance by process instance query
   * @param query {any} - query of the process instance document
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findOneWithCondition(query: any) {
    const defaultProjection = {
      _startIndex: 0,
      _endIndex: 0,
      _flags: 0,
      _stageIndexJSON: 0,
    };
    const workflow = await this.processInstanceRepositoryImpl.findOne(
      { ...query },
      defaultProjection,
    );
    if (!workflow) {
      throw new NotFoundException('instance not found.');
    }
    return workflow;
  }

  async findOnePublic(id: string, props: string[]) {
    const instanceProp = [
      '_id',
      'processDefinitionId',
      'processDefinitionKey',
      'processDefinitionName',
      'currentState',
      'caseNo',
      'contractNo',
      'stateList',
      'status',
      'createdAt',
      'updatedAt',
    ].join(' ');
    return this.processInstanceRepositoryImpl.findOne(
      { _id: id },
      props?.map((p) => `parameters.${p}`).join(' ') + ' ' + instanceProp ||
        '-parameters',
    );
  }
  /**
   * Get the statistics of the process instances by process definition id
   * @param processDefinitionId {string} - _id of the process definition document
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getStatsByDefinitionId(
    processDefinitionId: string,
    query: GetProcessInstanceStatsQueryDto,
  ): Promise<CustomResponse | CustomError> {
    const condition = { processDefinitionId };
    return this.getStats('processDefinitionId', condition, query);
  }

  /**
   * Get the statistics of the process instances by process definition key
   * @param processDefinitionKey {string} - key of the process definition
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getStatsByDefinitionKey(
    processDefinitionKey: string,
    query: GetProcessInstanceStatsQueryDto,
  ): Promise<CustomResponse | CustomError> {
    const condition = { processDefinitionKey };
    return this.getStats('processDefinitionKey', condition, query);
  }

  /**
   * Generic method for stats
   * @param groupBy {string} - group the instances by processDefinitionId/processDefinitionKey
   * @param _condition {object} - Mongo condition
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getStats(
    groupBy: string,
    _condition: any,
    query: GetProcessInstanceStatsQueryDto,
  ) {
    let customFilters = null;
    let filters = null;
    const condition: any = { $and: [_condition] };
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }
      if (query.customFilters) {
        customFilters = JSON.parse(query.customFilters);
        if (customFilters.startDate && customFilters.endDate) {
          condition.$and.push({
            createdAt: {
              $gte: moment(customFilters.startDate).startOf('day').toDate(),
              $lt: moment(customFilters.endDate).endOf('day').toDate(),
            },
          });
        }
      }
      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (const key in search) {
          if (search.hasOwnProperty(key)) {
            const obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') };
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }
    } catch (err) {
      this.logger.error(err);
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        ` [filters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }

    const pipeline = [
      {
        $match: condition,
      },
      {
        $group: {
          _id: `$${groupBy}`,
          waiting: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          on_hold: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          all: { $sum: 1 },
        },
      },
    ];
    const stats = await this.processInstanceRepositoryImpl.aggregate(pipeline);
    return stats[0];
  }

  /**
   * Create an instance and start by using process definition id
   * @param headers {object} - Defined request headers
   * @param processDefinitionId {string} - _id of the process definition document
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async runByDefinitionId(
    user: ActiveUserData,
    processDefinitionId: string,
    processInstanceBody: StartProcessInstanceBodyDto & {
      owner: string;
      cnId?: string;
      feasibilityProcessInstanceId?: string;
    },
  ): Promise<CustomResponse | CustomError> {
    let filters = {};
    if (user.type !== 'system') {
      filters = {
        _id: processDefinitionId,
        $or: [
          { 'candidateStarter.users': user.id },
          { 'candidateStarter.users': user.phoneNo },
          { 'candidateStarter.groups': { $in: user.groups } }, // todo need change

          {
            $and: [
              { 'candidateStarter.groups': { $size: 0 } },
              { 'candidateStarter.users': { $size: 0 } },
            ],
          },
        ],
      };
    } else {
      filters = {
        _id: processDefinitionId,
      };
    }

    const workflow = await this.processDefinitionRepositoryImpl.findOne(
      filters,
      {
        name: 1,
        key: 1,
        stages: 1,
        processVariables: 1,
        documents: 1,
        stateList: 1,
        indicator: 1,
        useCN: 1,
        maxPossibleDuration: 1,
        version: 1,
      },
    );
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_EXISTS,
      );
    }
    const compiledWorkflow = this.compiler.compile(workflow, null, null);

    const caseNo = await this.indicatorService.findByKeyAndIncrement(
      workflow.indicator,
    );

    let contractNo = null;
    if (workflow.useCN) {
      contractNo = await this.contractNumberService.getContractNo(
        processInstanceBody.cnId,
      );
      if (!contractNo) {
        throw new NotFoundException('contract number does not exist.');
      }
    }

    let maxPossibleDuration = null;
    if (workflow?.maxPossibleDuration) {
      maxPossibleDuration = moment(compiledWorkflow.timeActivated)
        .add(ms(workflow.maxPossibleDuration as any), 'ms')
        .valueOf();
    }

    const data = await this.processInstanceRepositoryImpl.create({
      ...compiledWorkflow,
      caseNo,
      contractNo,
      maxPossibleDuration,
      feasibilityProcessInstanceId:
        processInstanceBody.feasibilityProcessInstanceId,
    });
    return this.start(data._id, processInstanceBody);
  }

  async duplicateInstance(
    user: ActiveUserData,
    processInstanceId: string,
    processInstanceBody: StartProcessInstanceBodyDto & { owner: string },
    excludes?: string[],
  ) {
    const instance = await this.processInstanceRepositoryImpl.findById(
      processInstanceId,
    );
    if (!instance) {
      throw new NotFoundException('instance doest exist.');
    }
    const processDefinitionId = instance.processDefinitionId;
    let filters = {};
    if (user.type !== 'system') {
      filters = {
        _id: processDefinitionId,
        $or: [
          { 'candidateStarter.users': user.id },
          { 'candidateStarter.users': user.phoneNo },
          { 'candidateStarter.groups': { $in: user.groups } }, // todo need change

          {
            $and: [
              { 'candidateStarter.groups': { $size: 0 } },
              { 'candidateStarter.users': { $size: 0 } },
            ],
          },
        ],
      };
    } else {
      filters = {
        _id: processDefinitionId,
      };
    }
    const workflow = await this.processDefinitionRepositoryImpl.findOne(
      filters,
      {
        name: 1,
        key: 1,
        stages: 1,
        processVariables: 1,
        documents: 1,
        stateList: 1,
        indicator: 1,
        version: 1,
      },
    );
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_EXISTS,
      );
    }
    const compiledWorkflow = this.compiler.compile(workflow, null, null);

    const caseNo = await this.indicatorService.findByKeyAndIncrement(
      workflow.indicator,
    );
    processInstanceBody.parameters = {
      ...instance?.parameters,
      ...processInstanceBody.parameters,
    };
    if (excludes.length > 0) {
      processInstanceBody.parameters = _.omit(
        processInstanceBody.parameters,
        excludes,
      );
    }

    const data = await this.processInstanceRepositoryImpl.create({
      ...compiledWorkflow,
      caseNo,
      parameters: processInstanceBody.parameters,
    });
    return this.start(data._id, processInstanceBody);
  }

  //   /**
  //  * Create an instance and start by using process definition id
  //  * @param headers {object} - Defined request headers
  //  * @param processDefinitionId {string} - _id of the process definition document
  //  * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
  //  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  //  */
  //   async runByDefinitionId(
  //     processDefinitionId: string,
  //     processInstanceBody: StartProcessInstanceBodyDto & { owner: string },
  //   ): Promise<CustomResponse | CustomError> {
  //     const workflow = await this.processDefinitionRepositoryImpl.findOne(
  //       { _id: processDefinitionId },
  //       { _compiledDefinition: 1, properties: 1 },
  //     );
  //     if (!workflow) {
  //       throw new CustomError(
  //         HttpStatus.BAD_REQUEST,
  //         CustomMessages.WORKFLOW_NOT_EXISTS,
  //       );
  //     }
  //     const [isValid, error] = this.execute.validateParameters(
  //       workflow.properties,
  //       processInstanceBody?.parameters,
  //     );
  //     if (!(isValid && workflow._compiledDefinition)) {
  //       // If flow is started by the API call
  //       throw new CustomError(
  //         HttpStatus.BAD_REQUEST,
  //         error || 'Error in process definition',
  //       );
  //     }
  //     const newInstanceId = new Types.ObjectId();
  //     await this.runFlow(workflow, newInstanceId, processInstanceBody);
  //     return new CustomResponse(
  //       HttpStatus.CREATED,
  //       CustomMessages.PROCESS_INSTANCE_RUNNING,
  //       { _id: newInstanceId },
  //     );
  //   }

  /**
   * Create an instance and start by using process definition key
   * @param headers {object} - Defined request headers
   * @param query {object} - Defined query params
   * @param key {string} - key of the process definition
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async runByDefinitionKey(
    query: GetOneProcessInstanceQueryDto,
    key: string,
    processInstanceBody: StartProcessInstanceBodyDto,
  ): Promise<CustomResponse | CustomError> {
    const workflow = await this.processDefinitionRepositoryImpl.findOne(
      { key, ...(query.version && { version: query.version }) },
      { _compiledDefinition: 1, properties: 1, version: 1 },
      { version: -1 },
    );
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_EXISTS,
      );
    }
    const newInstanceId = new Types.ObjectId();
    await this.runFlow(workflow, newInstanceId, processInstanceBody);
    return new CustomResponse(
      HttpStatus.CREATED,
      CustomMessages.PROCESS_INSTANCE_RUNNING,
      { _id: newInstanceId },
    );
  }

  /**
   * Generic function to run a process instance
   * @param workflow {object} - compiled process definition
   * @param newInstanceId {object} - _id for the instance in object form
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   */
  async runFlow(workflow, newInstanceId, processInstanceBody) {
    const [isValid, error] = this.execute.validateParameters(
      workflow.properties,
      processInstanceBody?.parameters,
    );
    if (!(isValid && workflow._compiledDefinition)) {
      // If flow is started by the API call
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        error || 'Error in process definition',
      );
    }
    const now = Date.now();

    workflow._compiledDefinition._id = newInstanceId;
    workflow._compiledDefinition.rootProcessInstanceId =
      newInstanceId.valueOf();
    workflow._compiledDefinition.timeActivated = now;
    workflow._compiledDefinition.timeStarted = now;
    workflow._compiledDefinition.stages[
      workflow._compiledDefinition._startIndex
    ].timeActivated = now; // status of start stage

    const data = await this.processInstanceRepositoryImpl.create(
      workflow._compiledDefinition as any,
    );
    this.execute.startFlow(data, processInstanceBody);
  }

  async getFormValues(processInstanceId: string, taskKeys: string[]) {
    const processInstance = await this.processInstanceRepositoryImpl.findOne({
      _id: processInstanceId,
    });
    if (!processInstance) return null;
    const data = taskKeys.map((taskKey) => {
      const index = processInstance._stageIndexJSON[taskKey];
      const path = ['stages', index, 'parameters'];
      return _.get(processInstance, path);
    });
    return data.reduce((acc, cur) => {
      return { ...acc, ...cur };
    }, {});
  }

  async getVariables(processInstanceId: string, variables: string[]) {
    const processInstance = await this.processInstanceRepositoryImpl.findOne({
      _id: processInstanceId,
    });
    if (!processInstance) return null;
    const data = processInstance.processVariables
      .filter((v) => variables.includes(v.key))
      .map((variable) => {
        const value = _.get(processInstance, `parameters.${variable.key}`);
        return {
          key: variable.key,
          val: value,
        };
      });
    data.push({ key: 'caseNo', val: processInstance.caseNo });
    return data.reduce((acc, cur) => ({ ...acc, [cur.key]: cur.val }), {});
  }

  async valueLocator(instance, path) {
    return this.execute.valueLocator(instance, path);
  }

  async updateWatchers(updateProcessWatcher: UpdateProcessWatcher) {
    const result = await this.processInstanceRepositoryImpl.updateOne(
      { _id: updateProcessWatcher.processInstanceId },
      { $addToSet: { watchers: updateProcessWatcher.watcherId } },
    );
    if (!result) {
      throw new BadRequestException('instance not found.');
    }
    return result;
  }

  async getParticipateInstances(query: GetQueryDto, userId: string) {
    const props = query.props?.split(',');
    const instanceProp = [
      '_id',
      'processDefinitionId',
      'processDefinitionKey',
      'processDefinitionName',
      'currentState',
      'caseNo',
      'contractNo',
      'stateList',
      'status',
      'createdAt',
      'updatedAt',
      'holdBy',
      'resumedBy',
      'canceledBy',
      'timeActivated',
      'maxPossibleDuration',
      'feasibilityProcessInstanceId',
    ].join(' ');
    const condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    let dateFilters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.dateFilters) {
        dateFilters = JSON.parse(query.dateFilters);
        if (dateFilters.startDate && dateFilters.endDate) {
          condition.$and.push({
            createdAt: {
              $gte: moment(dateFilters.startDate).startOf('day'),
              $lt: moment(dateFilters.endDate).endOf('day'),
            },
          });
        }
      }

      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (const key in search) {
          if (search.hasOwnProperty(key)) {
            const obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') };
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }

      if (query.sort) {
        sort = JSON.parse(query.sort);
      }
    } catch (err) {
      this.logger.error(err);

      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }
    condition.$and.push({ $or: [{ watchers: userId }, { owner: userId }] });
    // condition.$and.push({ watchers: userId });
    // condition.$and.push({ owner: userId });

    // const defaultProjection = {
    //   _startIndex: 0,
    //   _endIndex: 0,
    //   _flags: 0,
    //   _stageIndexJSON: 0,
    // };

    const count = await this.processInstanceRepositoryImpl.count(condition);
    const data = await this.processInstanceRepositoryImpl.find(
      condition,
      props?.map((p) => `parameters.${p}`).join(' ') + ' ' + instanceProp ||
        '-parameters',
      query.page,
      query.size,
      sort,
      query.populate,
    );
    return { data, count };
  }

  async updateInstanceState(updateInstanceState: UpdateInstanceState) {
    const result = await this.processInstanceRepositoryImpl.updateOne(
      { _id: updateInstanceState.processInstanceId },
      { currentState: updateInstanceState.stateName },
    );
    if (!result) {
      throw new BadRequestException('instance not found.');
    }
    return result;
  }

  async getInstancesReport(instanceReportDto: InstanceReportDto) {
    const matchAggregation = {
      // status: 'completed',
      createdAt: {
        $gte: moment(instanceReportDto.startDate).startOf('day').toDate(),
        $lt: moment(instanceReportDto.endDate).endOf('day').toDate(),
      },
      processDefinitionKey: { $in: instanceReportDto.definitionKey },
    };

    const lookupAggregationInspectionCost = {
      from: 'inspectioncosts',
      let: { instanceId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$caseId', '$$instanceId'] },
                // { $eq: ['$status', 'paid'] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            total: { $toDouble: '$total' },
          },
        },
        {
          $group: {
            _id: null,
            expense: { $sum: '$total' },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ],
      as: 'case_cost',
    };

    const lookupAggregationDebt = {
      from: 'debts',
      let: { instanceId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$instanceId', '$$instanceId'] },
                { $eq: ['$isPaid', false] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            amount: { $toDouble: '$amount' },
          },
        },
        {
          $group: {
            _id: null,
            totalDebt: { $first: '$amount' },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ],
      as: 'case_debt',
    };

    const lookupAggregateIncome = {
      from: 'debts',
      let: { instanceId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$instanceId', '$$instanceId'] },
                { $eq: ['$isPaid', true] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            amount: { $toDouble: '$amount' },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $first: '$amount' },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ],
      as: 'case_income',
    };

    let createDateFromParts = {};
    let groupByDate = {};
    switch (instanceReportDto.period) {
      case PeriodEnum.DAY:
        createDateFromParts = {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
          },
        };
        groupByDate = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
      case PeriodEnum.WEEK:
        createDateFromParts = {
          $dateFromParts: {
            isoWeekYear: '$_id.year',
            isoWeek: '$_id.week',
            isoDayOfWeek: 6,
          },
        };
        groupByDate = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        };
        break;
      case PeriodEnum.MONTH:
        createDateFromParts = {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
          },
        };
        groupByDate = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
      case PeriodEnum.YEAR:
        createDateFromParts = {
          $dateFromParts: {
            year: '$_id.year',
          },
        };
        groupByDate = {
          year: { $year: '$createdAt' },
        };
        break;
    }

    const result = await this.processInstanceRepositoryImpl.aggregate([
      {
        $match: matchAggregation,
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          caseNo: 1,
          sell: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$parameters.InvoiceTotal', null] },
                  { $eq: ['$parameters.InvoiceTotal', 'NaN'] },
                ],
              },
              then: 0,
              else: { $toDouble: '$parameters.InvoiceTotal' },
            },
          },
        },
      },
      {
        $lookup: lookupAggregationInspectionCost,
      },
      {
        $unwind: {
          path: '$case_cost',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          caseNo: 1,
          sell: 1,
          expense: {
            $cond: [
              { $lte: ['$case_cost.expense', null] },
              0,
              '$case_cost.expense',
            ],
          },
        },
      },
      {
        $addFields: {
          profit: { $subtract: ['$sell', '$expense'] },
        },
      },
      {
        $lookup: lookupAggregationDebt,
      },
      {
        $unwind: {
          path: '$case_debt',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: lookupAggregateIncome,
      },
      {
        $unwind: {
          path: '$case_income',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          sell: 1,
          expense: 1,
          profit: 1,
          totalDebt: {
            $cond: [
              { $lte: ['$case_debt.totalDebt', null] },
              0,
              '$case_debt.totalDebt',
            ],
          },
          totalIncome: {
            $cond: [
              { $lte: ['$case_income.totalIncome', null] },
              0,
              '$case_income.totalIncome',
            ],
          },
        },
      },
      {
        $group: {
          _id: groupByDate,
          sell: { $sum: '$sell' },
          expense: { $sum: '$expense' },
          profit: { $sum: '$profit' },
          debt: { $sum: '$totalDebt' },
          income: { $sum: '$totalIncome' },
        },
      },
      {
        $match: {
          $or: [
            { sell: { $gt: 0 } },
            { expense: { $gt: 0 } },
            { profit: { $gt: 0 } },
            { debt: { $gt: 0 } },
            { income: { $gt: 0 } },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          [instanceReportDto.period]: createDateFromParts,
          sell: 1,
          expense: 1,
          debt: 1,
          income: 1,
          profit: { $subtract: ['$sell', '$expense'] },
        },
      },
      { $sort: { [instanceReportDto.period]: 1 } },
    ]);

    return result;
  }

  async cancelInstance(
    instanceId: string,
    userId: string,
    cancelProcessDto: CancelProcessInstanceDto,
  ) {
    await this.execute.makeFlowCancel(
      { rootProcessInstanceId: instanceId },
      null,
      userId,
      cancelProcessDto,
    );
  }

  async makeInspectionCancel(
    instanceId: string,
    activeUser: ActiveUserData,
    cancelProcessDto: CancelProcessInstanceDto,
  ): Promise<void> {
    const deletedIncomesPromise = [],
      deletedInvoicesPromise = [],
      sysAdminUser = {
        branchId: null,
        id: '64fc34ccac4d2e3326f95a5c',
        fullName: 'sysadmin',
        email: '',
        groups: [Roles.SYSTEM],
        phoneNo: '',
        type: '',
      };
    const incomes = await this.incomeService.findWithOutPagination({
      instanceId,
    });

    const invoices = await this.invoiceService.findWithOutPagination({
      items: { $elemMatch: { $in: incomes.map((income) => income._id) } },
    });

    //Cancel invoice
    for (const invoice of invoices) {
      await this.invoiceService.makeInvoiceCancel(invoice._id, sysAdminUser);
    }

    //Remove incomes
    for (const income of incomes) {
      deletedIncomesPromise.push(
        this.incomeService.remove(income._id, sysAdminUser),
      );
    }

    //Remove costs
    const deletedCosts =
      this.inspectionCostService.deleteInspectionCostByCaseId(
        instanceId.toString(),
      );

    //Cancel All invoices and delete incomes
    await Promise.all([...deletedIncomesPromise, deletedCosts]);

    const instance = await this.findOnePublic(instanceId, [
      'InspectionInstanceId',
    ]);

    //Cancel inspection instance if exists
    await this.execute.makeFlowCancel(
      { rootProcessInstanceId: instance.parameters.InspectionInstanceId },
      null,
      activeUser.id,
      cancelProcessDto,
    );

    await this.execute.makeFlowCancel(
      { rootProcessInstanceId: instanceId },
      null,
      activeUser.id,
      cancelProcessDto,
    );
  }

  async processInstanceFileSummary(getQueryDto: GetQueryDto) {
    const props = getQueryDto.props?.split(',');
    const instanceProp = [
      '_id',
      'processDefinitionId',
      'processDefinitionKey',
      'processDefinitionName',
      'currentState',
      'caseNo',
      'contractNo',
      'stateList',
      'status',
      'createdAt',
      'updatedAt',
    ];

    const page = getQueryDto.page || 0;
    const size = getQueryDto.size || 10;
    const skip = page * size;

    const buyerExists = true;
    const processKeyRegex = 'Inspection_Case';
    const completedStatus = 'completed';

    const matchStage = { $match: { $and: [] } };
    const dynamicProjection = {};
    let sort = null;

    //PROJECTION
    if (props && Array.isArray(props)) {
      props.forEach((p) => {
        dynamicProjection[`parameters.${p}`] = 1;
      });
    }
    if (instanceProp) {
      instanceProp.forEach((p) => {
        dynamicProjection[`${p}`] = 1;
      });
    }
    dynamicProjection['parameters.InspectionInstanceId'] = 1;
    if (Object.keys(dynamicProjection).length === 0) {
      dynamicProjection['-parameters'] = 0;
    }

    //MATCH
    if (buyerExists) {
      matchStage.$match.$and.push({ 'parameters.Buyer': { $exists: true } });
    }

    if (processKeyRegex) {
      matchStage.$match.$and.push({
        processDefinitionKey: { $regex: processKeyRegex },
      });
    }
    if (completedStatus) {
      matchStage.$match.$and.push({ status: completedStatus });
    }

    if (getQueryDto.filters) {
      const filters = JSON.parse(getQueryDto.filters);
      matchStage.$match.$and.push(filters);
    }

    if (getQueryDto.search) {
      const search = JSON.parse(getQueryDto.search);
      const orCond = { $or: [] };
      for (const key in search) {
        if (search.hasOwnProperty(key)) {
          const obj = {};
          obj[key] = { $regex: new RegExp(search[key], 'i') };
          orCond.$or.push(obj);
        }
      }
      matchStage.$match.$and.push(orCond);
    }

    const pipeline: any = [
      matchStage,
      { $project: dynamicProjection },
      {
        $lookup: {
          from: 'inspectionfiles',
          let: {
            instanceId: { $toObjectId: '$parameters.InspectionInstanceId' },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$processInstanceId', '$$instanceId'] }],
                },
              },
            },
          ],
          as: 'inspectionFiles',
        },
      },
      {
        $lookup: {
          from: 'files',
          let: {
            id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$processInstanceId', '$$id'],
                },
              },
            },
            {
              $match: {
                $and: [{ path: { $regex: '/pic/' } }],
              },
            },
          ],
          as: 'files',
        },
      },
      {
        $group: {
          _id: '$parameters.Buyer.id',
          // processDefinitionKey: { $addToSet: '$processDefinitionKey' },
          // processDefinitionName: { $addToSet: '$processDefinitionName' },
          buyer: { $first: '$parameters.Buyer' },
          processInstanceWithFile: {
            $addToSet: {
              $cond: [
                {
                  $or: [
                    {
                      $gt: [
                        { $size: { $ifNull: ['$inspectionFiles', []] } },
                        0,
                      ],
                    },
                    { $gt: [{ $size: { $ifNull: ['$files', []] } }, 0] },
                  ],
                },
                '$_id',
                '$$REMOVE',
              ],
            },
          },
          processInstanceWithoutFile: {
            $addToSet: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        { $size: { $ifNull: ['$inspectionFiles', []] } },
                        0,
                      ],
                    },
                    { $eq: [{ $size: { $ifNull: ['$files', []] } }, 0] },
                  ],
                },
                '$_id',
                '$$REMOVE',
              ],
            },
          },
          caseNoWithoutFile: {
            $addToSet: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        { $size: { $ifNull: ['$inspectionFiles', []] } },
                        0,
                      ],
                    },
                    { $eq: [{ $size: { $ifNull: ['$files', []] } }, 0] },
                  ],
                },
                '$caseNo',
                '$$REMOVE',
              ],
            },
          },
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: size }],
        },
      },
    ];

    if (getQueryDto?.sort) {
      sort = JSON.parse(getQueryDto.sort);
      pipeline.push({
        $sort: sort,
      });
    }

    const result = await this.processInstanceRepositoryImpl.aggregate(pipeline);
    const data = result[0].data;
    const total =
      result[0].metadata.length > 0 ? result[0].metadata[0].total : 0;

    return {
      total,
      data,
    };
  }

  async findAllInstances(
    where?: FilterQuery<ProcessInstanceDocument>,
    populate?: string,
    projection?: string,
  ) {
    return this.processInstanceRepositoryImpl.findWithOutPagination(
      where,
      populate,
      projection,
    );
  }

  async aggregate(aggregation: any, option?: any) {
    return await this.processInstanceRepositoryImpl.aggregate(aggregation);
  }

  async count(where?: any): Promise<number> {
    return await this.processInstanceRepositoryImpl.count(where);
  }

  //Check all process instances have the same case type and return CaseType
  async isInstancesInSameType(processInstanceIds: string[]): Promise<boolean> {
    const getQueryDto: GetQueryWithDownloadDto = new GetQueryWithDownloadDto();
    const filter = JSON.parse(getQueryDto.filters || '{}');
    filter._id = { $in: processInstanceIds };
    getQueryDto.props = 'CaseType';
    getQueryDto.page = null;
    getQueryDto.size = null;
    getQueryDto.filters = JSON.stringify(filter);
    const { data: processInstances } = await this.findAll(null, getQueryDto);
    if (!processInstances) {
      throw new NotFoundException('Process instance not found');
    }

    const firstItemCaseType = processInstances[0]?.parameters?.CaseType;
    processInstances.forEach((pi) => {
      if (pi.parameters.CaseType !== firstItemCaseType) {
        return false;
      }
    });
    return true;
  }

  async calculateInspectionFeeInRial(
    instanceId: string,
    incomes?: IncomeDocument[] | undefined,
    session?: ClientSession,
  ): Promise<number> {
    let total = 0;
    if (incomes?.length === 0 || !incomes) {
      incomes = await this.incomeService.findWithOutPagination({
        instanceId,
        status: { $ne: IncomeStatuses.Canceled },
        isDeleted: false,
      });
    }

    total = incomes.reduce((acc, cur) => acc + cur.total, total);
    return total;
  }

  async test() {
    const incomes = await this.incomeService.aggregate([
      {
        $match: {
          $and: [{ tax: 0 }, { total: { $ne: 0 } }],
        },
      },
      {
        $lookup: {
          from: 'processinstances',
          localField: 'instanceId',
          foreignField: '_id',
          as: 'pi',
        },
      },
      {
        $unwind: { path: '$pi' },
      },
      {
        $match: {
          'pi.parameters.CaseType': 'official',
        },
      },
    ]);

    for (const income of incomes) {
      await this.incomeService.findOneAndUpdate(
        { _id: income._id },
        { tax: income.total * 0.1 },
      );
    }
  }
}
