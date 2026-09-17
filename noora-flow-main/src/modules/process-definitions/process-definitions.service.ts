import { HttpStatus, Injectable, Logger, Scope } from '@nestjs/common';
import {
  CreateProcessDefinitionDto,
  UpdateProcessDefinitionDto,
  GetProcessDefinitionDto,
  UpdateDefinitionParams,
  StageDefinition,
  GetProcessDefinitionQueryDto,
} from './dtos';
import { CustomMessages } from 'src/common/const/custom-messages';
import { UpdateStageBody, UpdateStageParams } from './dtos/update-stage.dto';
import {
  Constants,
  LogEntities,
  Operations,
  Paths,
} from 'src/common/const/constants';
import { Mappings } from 'src/common/const/BPMN-mappings';
import { CommonHeadersDto } from 'src/shared/dtos';
import { Compiler } from '../process-instances/providers';
import { StagesSchema } from './joi-validations/create-process-definition.joi';
import * as convert from 'xml-js';
import { ProcessDefinitionRepositoryImpl } from './repository/process-definitions.repository.impl';
import CustomError from 'src/common/providers/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ConnectorTypes } from 'src/common/const/enums';

@Injectable()
export class ProcessDefinitionService {
  private readonly logger: Logger = new Logger(ProcessDefinitionService.name);

  constructor(
    private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
    private compiler: Compiler,
  ) {}

  /**
   * checks duplicate key in an array of objects
   * @param key {string} - key to be checked, e.g. "k3"
   * @param arr {object} - target array, e.g. [{key: "k1"}, {key: "k2"}]
   * @returns {boolean} e.g. true/false
   */

  private checkDuplicateKey(key, arr) {
    const map = {};
    let isDup = false;
    for (let i = 0; i < arr.length; i++) {
      const obj = arr[i];
      if (map[obj[key]]) {
        isDup = true;
        break;
      }
      map[obj[key]] = true;
    }
    return isDup;
  }

  /**
   * It verifies the compound task properties with the properties of the attached process definition
   * @param definition {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   * @returns {undefined/object} - Error array, e.g. [{taskKey: "", processDefinitionKey: "", parameterKey: "", error: ""}]
   */
  private async verifyCompoundTaskParams(definition) {
    const compoundTasks = definition.stages.filter(
      (stage) =>
        stage.subType === Constants.STAGE_SUB_TYPES.COMPOUND_TASK &&
        (stage.processDefinitionId || stage.processDefinitionKey),
    );
    const childProcessDefinitionKeys = compoundTasks.map(
      (stage) => stage.processDefinitionKey,
    );
    const compObject = compoundTasks.reduce(
      (obj, item) =>
        Object.assign(obj, {
          [item.processDefinitionKey]: {
            key: item.key,
            properties: item.properties,
          },
        }),
      {},
    );
    const childDef = await this.processDefinitionRepositoryImpl.find(
      {
        key: childProcessDefinitionKeys,
        properties: { $exists: true, $ne: [] },
      },
      { key: 1, properties: 1 },
    );
    const errors = [];
    childDef.forEach((def) => {
      const propObj = compObject[def.key].properties.reduce(
        (obj, item) => Object.assign(obj, { [item.key]: item.value?.default }),
        {},
      );
      def.properties.forEach((p) => {
        if (
          (p.value.required === true || (p.value.required as any) === 'true') &&
          !propObj[p.key]
        ) {
          errors.push({
            taskKey: compObject[def.key].key,
            processDefinitionKey: def.key,
            parameterKey: p.key,
            error:
              'default value must be set for the input parameters which are required for child workflow',
          });
        }
      });
    });
    if (errors[0]) {
      return errors;
    }
  }

  /**
   * Validate the individual stage schema
   * @param createProcessDefinitionDto {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   * @returns {undefined/string} - Error, e.g. "Error for key [k1] and subType [user-task] : [Invalid datatype]"
   */
  private async validateStages(
    createProcessDefinitionDto: CreateProcessDefinitionDto,
  ) {
    for (let i = 0; i < createProcessDefinitionDto.stages.length; i++) {
      const stage = createProcessDefinitionDto.stages[i];
      const stageSubType = stage.subType;
      const validationResult = StagesSchema?.[stageSubType]?.validate(stage);
      if (validationResult?.error) {
        return `Error for key [${stage?.key}] and subType [${stageSubType}] : [${validationResult?.error?.details?.[0]?.message}]`;
      }
    }
  }

  /**
   * Create a process definition record in database
   * @param headers {object} - Defined request headers
   * @param createProcessDefinitionDto {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async create(createProcessDefinitionDto: CreateProcessDefinitionDto) {
    const uniqueStageIdentifier = 'key';
    if (
      this.checkDuplicateKey(
        uniqueStageIdentifier,
        createProcessDefinitionDto.stages,
      )
    ) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        `[${uniqueStageIdentifier}] must be unique within [stages] array`,
      );
    }

    //validates the process-definition-stages schema
    const stagesValidationResult = await this.validateStages(
      createProcessDefinitionDto,
    );
    if (stagesValidationResult) {
      throw new CustomError(HttpStatus.BAD_REQUEST, stagesValidationResult);
    }

    const compoundTaskValidate = await this.verifyCompoundTaskParams(
      createProcessDefinitionDto,
    );
    if (compoundTaskValidate) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        'Error in compound tasks [properties]',
        compoundTaskValidate,
      );
    }

    const workflow = await this.processDefinitionRepositoryImpl.model
      .findOne({
        key: createProcessDefinitionDto.key,
      })
      .sort('-version');

    if (workflow) {
      createProcessDefinitionDto['version'] = workflow.version + 1;
      const updatedProcessDefinition = {
        ...createProcessDefinitionDto,
        ...workflow,
      };
      const data = await this.processDefinitionRepositoryImpl.create(
        updatedProcessDefinition,
      );
      this.updateCompiledDefinition(data);
      return { data, newVersion: true };
    }

    createProcessDefinitionDto['version'] = 1;
    const data = await this.processDefinitionRepositoryImpl.create(
      createProcessDefinitionDto,
    );
    this.updateCompiledDefinition(data);
    return { data, newVersion: false };
  }

  /**
   * Add a compiled process definition in the root process definition
   * @param processDefinition {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   */
  private async updateCompiledDefinition(processDefinition) {
    const compiledWorkflow = this.compiler.compileV2(processDefinition);
    await this.processDefinitionRepositoryImpl.update(
      { _id: processDefinition._id },
      { _compiledDefinition: compiledWorkflow },
    );
  }

  /**
   * Update a process definition record by id in database
   * @param headers {object} - Defined request headers
   * @param id {string} - _id of the mongo document
   * @param updateProcessDefinitionDto {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async update(
    id: string,
    updateProcessDefinitionDto: UpdateProcessDefinitionDto,
  ) {
    const workflow = await this.processDefinitionRepositoryImpl.findOne({
      _id: id,
    });
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_FOUND,
      );
    }
    const uniqueStageIdentifier = 'key';
    if (
      !!updateProcessDefinitionDto?.stages &&
      this.checkDuplicateKey(
        uniqueStageIdentifier,
        updateProcessDefinitionDto.stages,
      )
    ) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        `[${uniqueStageIdentifier}] must be unique within [stages] array`,
      );
    }
    // updateProcessDefinitionDto['version'] = workflow.version + 1;
    const data = await this.processDefinitionRepositoryImpl.update(
      { _id: id },
      updateProcessDefinitionDto,
    );
    this.updateCompiledDefinition(data);
    return data;
  }

  /**
   * Update a stage by processDefinitionId and stageId
   * @param headers {object} - Defined request headers
   * @param params {object} - Defined query params
   * @param stage {object} - Stage object
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async updateStage(
    params: UpdateStageParams,
    stage: UpdateStageBody,
  ): Promise<CustomResponse | CustomError> {
    const condition = {
      _id: params.processDefinitionId,
      'stages._id': params.stageId,
    };

    const workflow = await this.processDefinitionRepositoryImpl.findOne(
      condition,
    );
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_FOUND,
      );
    }

    const setValues = {
      ...(stage.description && { 'stages.$.description': stage.description }),
      ...(stage.stageId && {
        'stages.$.id': stage.stageId,
      }),
      ...(stage.conditions?.length && {
        'stages.$.conditions': stage.conditions,
      }),
      ...(stage.properties?.length && {
        'stages.$.properties': stage.properties,
      }),
      ...(stage.assignee?.length && { 'stages.$.assignee': stage.assignee }),
      ...(stage.criteria && { 'stages.$.criteria': stage.criteria }),
      ...(stage.connector && { 'stages.$.connector': stage.connector }),
      ...(stage.nextStage && { 'stages.$.nextStage': stage.nextStage }),
      ...(stage.type && { 'stages.$.type': stage.type }),
      ...(stage.subType && { 'stages.$.subType': stage.subType }),
      ...((stage.dueDate || stage.dueDate === null) && {
        'stages.$.dueDate': stage.dueDate,
      }),
    };
    console.log(setValues);

    const data = await this.processDefinitionRepositoryImpl.updateStage(
      condition,
      setValues,
    );
    return new CustomResponse(
      HttpStatus.OK,
      CustomMessages.WORKFLOW_UPDATED,
      data,
    );
  }

  /**
   * Find a list of definitions with pagination, filters, search option
   * @param query {object} - Query params object
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findAll(query: GetProcessDefinitionDto, user: ActiveUserData) {
    const condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
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
    // if (!condition.$and.length) {
    //   condition = {};
    // }

    condition.$and.push({
      $and: [
        {
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
        },
        { $or: [{ displayable: true }, { displayable: { $exists: false } }] },
      ],
    });

    const count = await this.processDefinitionRepositoryImpl.count(condition);
    const data = await this.processDefinitionRepositoryImpl.find(
      condition,
      {
        name: 1,
        key: 1,
        version: 1,
        displayable: 1,
        properties: 1,
        createdAt: 1,
        updatedAt: 1,
        candidateStarter: 1,
        useCN: 1,
      },
      query.page,
      query.size,
    );
    return { data, count };
  }

  /**
   * Find a process deifnition by _id
   * @param id {string} - _id of the mongo document
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findOne(id: string) {
    const condition = { _id: id };
    const workflow = await this.processDefinitionRepositoryImpl.findOne(
      condition,
    );
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_FOUND,
      );
    }
    return workflow;
  }

  /**
   * Find a process deifnition by key
   * @param key {string} - Process definiton key
   * @param query {object} - Query params object
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findOneByKey(key: string, query: GetProcessDefinitionQueryDto) {
    const condition = {
      key,
      ...(query.version && { version: query.version }),
    };
    const workflow = await this.processDefinitionRepositoryImpl.model
      .findOne(
        condition,
        {},
        // { version: 1 },
      )
      .sort('-version');
    if (!workflow) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_FOUND,
      );
    }
    return workflow;
  }

  /**
   * Upload a file
   * @param headers {object} - Defined request headers
   * @param file {object} - file object
   * @returns {Promise} - CustomResponse, e.g. {statusCode: 200, message: "", result: {}}
   */
  async uploadProtoFile(file) {
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, {
      protoPath: file.filename,
    });
  }

  /**
   * Upload a file
   * @param headers {object} - Defined request headers
   * @param file {object} - file object
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async uploadBPMNFile(file) {
    const xml = file.buffer.toString();
    const options = { ignoreComment: true, alwaysChildren: true };
    const rawJson = convert.xml2js(xml, options); // or convert.xml2json(xml, options)
    const businessFlowJson = this.bpmnJsonToNativeJson(rawJson);
    // return { data: businessFlowJson, newVersion: false };
    const data = await this.create(businessFlowJson);
    return data;
  }

  /**
   * Convert bpmn json to native json
   * @param bpmnJson {object} - input bpmn json
   * @returns {object} - target json
   */
  bpmnJsonToNativeJson(bpmnJson) {
    const bpmnProcessJson = bpmnJson.elements[0]['elements'].find(
      (ele) => ele.name === 'bpmn:process',
    );
    // return bpmnProcessJson;
    const targetProcessJSON: CreateProcessDefinitionDto = {
      name: bpmnProcessJson.attributes.name || bpmnProcessJson.attributes.id,
      description: bpmnProcessJson.attributes.description || '',
      key: bpmnProcessJson.attributes.id,
      isParallel: false,
      indicator:
        bpmnProcessJson.elements
          ?.find((e) => e.name == 'bpmn:extensionElements')
          ?.elements?.find((e) => e.name == 'camunda:properties')
          ?.elements?.find((e) => e.attributes.name == 'indicator')?.attributes
          ?.value || null,
      useCN:
        bpmnProcessJson.elements
          ?.find((e) => e.name == 'bpmn:extensionElements')
          ?.elements?.find((e) => e.name == 'camunda:properties')
          ?.elements?.find((e) => e.attributes.name == 'useCN')?.attributes
          ?.value === 'true',
      maxPossibleDuration:
        bpmnProcessJson.elements
          ?.find((e) => e.name == 'bpmn:extensionElements')
          ?.elements?.find((e) => e.name == 'camunda:properties')
          ?.elements?.find((e) => e.attributes.name == 'maxPossibleDuration')
          ?.attributes?.value || null,
      displayable:
        bpmnProcessJson.elements
          ?.find((e) => e.name == 'bpmn:extensionElements')
          ?.elements?.find((e) => e.name == 'camunda:properties')
          ?.elements?.find((e) => e.attributes.name == 'displayable')
          ?.attributes?.value === 'true',
      stages: [],
      candidateStarter: {
        groups:
          bpmnProcessJson.attributes['camunda:candidateStarterGroups']?.split(
            ',',
          ) || [],
        users:
          bpmnProcessJson.attributes['camunda:candidateStarterUsers']?.split(
            ',',
          ) || [],
      },
      processVariables: [],
      documents: JSON.parse(
        bpmnProcessJson.elements
          ?.find((e) => e.name == 'bpmn:extensionElements')
          ?.elements?.find((e) => e.name == 'camunda:properties')
          ?.elements?.find((e) => e.attributes.name == 'documents')?.attributes
          ?.value || '{"_id":false}',
      ),
      stateList: JSON.parse(
        bpmnProcessJson.elements
          ?.find((e) => e.name == 'bpmn:extensionElements')
          ?.elements?.find((e) => e.name == 'camunda:properties')
          ?.elements?.find((e) => e.attributes.name == 'stateList')?.attributes
          ?.value || '[]',
      ),
    };
    // return bpmnJson.elements[0]['elements'][1].elements
    // return bpmnProcessJson.elements;
    targetProcessJSON.stages = bpmnProcessJson.elements
      .map((ele) => {
        if (Mappings.StageMappings[ele.name]) {
          const stage = { ...Mappings.StageMappings[ele.name] };
          stage.key = ele?.attributes.id;
          stage.name = ele?.attributes.name || ele?.attributes.id;
          stage.description = ele.attributes.description || ele.name;
          const nextStages = bpmnProcessJson.elements
            .filter(
              (linkObj) =>
                linkObj.name === 'bpmn:sequenceFlow' &&
                linkObj.attributes.sourceRef === ele.attributes.id,
            )
            .map((obj) => obj.attributes.targetRef);
          if (ele.name != 'bpmn:endEvent') {
            stage.nextStages = nextStages;
          }
          if (ele.name == 'bpmn:exclusiveGateway') {
            stage.conditionsExp = this.handleExclusiveGateway(
              ele,
              bpmnProcessJson,
            );
            stage.nextStages = [nextStages[0]];
          }
          if (
            ele.name != 'bpmn:startEvent' &&
            ele.name != 'bpmn:endEvent' &&
            ele.name != 'bpmn:exclusiveGateway' &&
            ele.name != 'bpmn:serviceTask'
          ) {
            stage.properties = ele.elements
              .find((obj) => obj.name === 'bpmn:extensionElements')
              ?.elements.find((obj) => obj.name === 'camunda:formData')
              ?.elements.map((obj) => {
                if (obj.name === 'camunda:formField') {
                  return {
                    key: obj.attributes.id,
                    value: {
                      type: obj.attributes?.type,
                      label: obj.attributes?.label,
                      default: obj.attributes?.defaultValue || null,
                      required:
                        obj.attributes?.type === 'template' ? false : true,
                    },
                  };
                }
              })
              .filter((obj) => obj);
            stage.subForms = ele.elements
              .find((obj) => obj.name === 'bpmn:extensionElements')
              ?.elements.find((obj) => obj.name === 'camunda:properties')
              ?.elements.map((obj) => {
                if (
                  obj.name === 'camunda:property' &&
                  obj.attributes.name === 'subForm'
                ) {
                  return obj.attributes.value;
                }
              })
              .filter((obj) => obj);

            stage.data = ele.elements
              .find((obj) => obj.name === 'bpmn:extensionElements')
              ?.elements.find((obj) => obj.name === 'camunda:properties')
              ?.elements.map((obj) => {
                if (
                  obj.name === 'camunda:property' &&
                  obj.attributes.name === 'data'
                ) {
                  return obj.attributes.value.split(',');
                }
              })
              .filter((obj) => obj)[0];
          }
          if (ele.name === 'bpmn:callActivity') {
            stage.processDefinitionKey = ele.elements
              .find((extEle) => (extEle.name = 'bpmn:extensionElements'))
              ?.elements.find(
                (obj) => obj.name === 'zeebe:calledElement',
              )?.attributes?.processId;
          }
          if (ele.name == 'bpmn:userTask') {
            stage.dueDate = ele.attributes['camunda:dueDate'] || null;
            stage.assignee = ele.attributes['camunda:assignee'] || null;
            stage.candidate = {
              groups:
                ele.attributes['camunda:candidateGroups']?.split(',') || [],
              users: ele.attributes['camunda:candidateUsers']?.split(',') || [],
            };
          }
          if (ele.name == 'bpmn:serviceTask') {
            const delegateExpression =
              ele.attributes?.['camunda:delegateExpression'];
            if (delegateExpression) {
              const service = {} as any;
              service.name = delegateExpression.split('.')[1];
              service.inputs = ele.elements
                .find((obj) => obj.name === 'bpmn:extensionElements')
                ?.elements.find((obj) => obj.name === 'camunda:inputOutput')
                ?.elements?.filter(
                  (obj) => obj.name === 'camunda:inputParameter',
                )
                ?.reduce((acc, cur) => {
                  const field = cur.attributes.name;
                  acc = {
                    ...acc,
                    [field]: cur.elements[0].text,
                  };
                  return acc;
                }, {});

              service.output = ele.elements
                .find((obj) => obj.name === 'bpmn:extensionElements')
                ?.elements.find((obj) => obj.name === 'camunda:inputOutput')
                ?.elements?.filter(
                  (obj) => obj.name === 'camunda:outputParameter',
                )
                ?.map((item) => item.attributes.name)[0];
              stage.service = service;
            } else {
              const connector = {} as any;
              connector.type = ConnectorTypes.REST;

              connector.config = {
                connectorKey: ele.elements
                  .find((obj) => obj.name === 'bpmn:extensionElements')
                  ?.elements.find((obj) => obj.name === 'camunda:connector')
                  ?.elements.find((obj) => obj.name === 'camunda:connectorId')
                  ?.elements[0].text,
                ...ele.elements
                  .find((obj) => obj.name === 'bpmn:extensionElements')
                  ?.elements.find((obj) => obj.name === 'camunda:connector')
                  ?.elements.find((obj) => obj.name === 'camunda:inputOutput')
                  ?.elements?.filter(
                    (obj) => obj.name === 'camunda:inputParameter',
                  )
                  ?.reduce((acc, cur) => {
                    const [type, field] = cur.attributes.name.split('.');
                    acc = {
                      ...acc,
                      [type]: { ...acc[type], [field]: cur.elements[0].text },
                    };
                    return acc;
                  }, {}),
              };
              stage.connector = connector;
            }
          }
          return stage;
        }
      })
      .filter((obj) => obj?.key);

    targetProcessJSON.processVariables = bpmnProcessJson.elements
      .filter((el) => el.name === 'bpmn:userTask')
      .map((ele) => {
        return ele.elements
          .find((obj) => obj.name === 'bpmn:extensionElements')
          ?.elements.find((obj) => obj.name === 'camunda:formData')
          ?.elements.map((obj) => {
            if (obj.name === 'camunda:formField') {
              return {
                key: obj.attributes.id,
                type: obj.attributes?.type,
                required: obj.attributes?.type === 'template' ? false : true,
              };
            }
          })
          .filter((obj) => obj);
      })
      .reduce((acc, cur) => {
        if (!cur) return acc;
        return [...cur, ...acc];
      }, []);

    const serviceOutputVariables = targetProcessJSON.stages
      .filter((s) => s.subType === 'service-task' && !!s.service?.output)
      .map((i) => i.service?.output)
      .map((s) => {
        return {
          key: s,
          type: 'string',
          required: false,
        };
      });

    targetProcessJSON.processVariables =
      targetProcessJSON.processVariables.concat(serviceOutputVariables);

    targetProcessJSON.processVariables =
      targetProcessJSON.processVariables.filter((value, index) => {
        const _value = JSON.stringify(value);
        return (
          index ===
          targetProcessJSON.processVariables.findIndex((obj) => {
            return JSON.stringify(obj) === _value;
          })
        );
      });
    return targetProcessJSON;
  }

  private handleExclusiveGateway(element, bpmnJson) {
    const conditions = bpmnJson.elements
      .filter(
        (linkObj) =>
          linkObj.name === 'bpmn:sequenceFlow' &&
          linkObj.attributes.sourceRef === element.attributes.id,
      )
      .map((obj) => {
        const [elements] = obj.elements;
        if (elements) {
          const [el] = elements.elements;
          return {
            expression: el.text,
            onTrueNextStage: obj.attributes.targetRef,
            name: obj.attributes.id,
          };
        }
      })
      .filter((obj) => obj);
    return conditions;
  }

  detectInspectionType(processKey: string): string | undefined {
    let inspectionType: string | undefined;
    if (processKey.startsWith('Inspection_Case_')) {
      inspectionType = processKey
        .replace('Inspection_Case_', '')
        .replaceAll('_', '-')
        .toLowerCase();
    } else if (processKey.endsWith('Sampling')) {
      inspectionType = 'sampling';
    }

    return inspectionType;
  }

  async allProcessDefinitions(query: GetProcessDefinitionDto) {
    const condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.search) {
        const search = JSON.parse(query.search);
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
    // condition.$and.push({
    //   $or: [{ displayable: true }, { displayable: { $exists: false } }],
    // });
    const count = await this.processDefinitionRepositoryImpl.count(condition);
    const data = await this.processDefinitionRepositoryImpl.find(
      condition,
      {
        name: 1,
        key: 1,
        version: 1,
      },
      query.page,
      query.size,
    );
    return { data, count };
  }
}
