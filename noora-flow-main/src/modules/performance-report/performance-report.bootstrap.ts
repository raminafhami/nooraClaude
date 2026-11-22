import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as moment from 'moment-jalaali';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { HashingService } from '../iam/hashing-and-encryption/hashing.service';
import {
  Permission,
  PermissionDocument,
} from '../permissions/schemas/permission.schema';
import { Personnel, PersonnelDocument } from '../personnel/schemas/personnel.schema';
import {
  ProcessInstance,
  ProcessInstanceDocument,
} from '../process-instances/schemas/process-instances.schema';
import { UserTasks, UserTasksDocument } from '../tasks/schemas/user-tasks.schema';
import {
  USER_GROUP_TYPE,
  UserGroup,
  UserGroupDocument,
} from '../user-groups/schemas/user-group.schema';
import {
  LoginTypes,
  User,
  UserDocument,
  UserTypes,
} from '../users/schemas/user.schema';
import { todayKey } from './performance-report.time';

export const PERFORMANCE_PERMISSION_DESCRIPTION = 'مشاهده گزارش عملکرد - مشاهده';

const DEMO_PASSWORD = 'Demo1234!';

@Injectable()
export class PerformanceReportBootstrap {
  private readonly logger = new Logger(PerformanceReportBootstrap.name);

  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
    @InjectModel(UserGroup.name)
    private readonly userGroupModel: Model<UserGroupDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Personnel.name)
    private readonly personnelModel: Model<PersonnelDocument>,
    @InjectModel(UserTasks.name)
    private readonly userTasksModel: Model<UserTasksDocument>,
    @InjectModel(ProcessInstance.name)
    private readonly processInstanceModel: Model<ProcessInstanceDocument>,
    private readonly hashingService: HashingService,
  ) {}

  async ensurePermission(): Promise<PermissionDocument> {
    let permission = await this.permissionModel.findOne({
      subject: Subjects.PERFORMANCE_REPORT,
      actions: PermissionAction.READ,
    });
    if (!permission) {
      permission = await this.permissionModel.create({
        actions: [PermissionAction.READ],
        subject: Subjects.PERFORMANCE_REPORT,
        conditions: '{}',
        description: PERFORMANCE_PERMISSION_DESCRIPTION,
      });
    } else if (permission.description !== PERFORMANCE_PERMISSION_DESCRIPTION) {
      permission.description = PERFORMANCE_PERMISSION_DESCRIPTION;
      await permission.save();
    }

    const roles = [
      { name: 'ceo', title: 'مدیرعامل' },
      { name: 'hr-manager', title: 'مدیر منابع انسانی' },
    ];
    for (const role of roles) {
      let group = await this.userGroupModel.findOne({ name: role.name });
      if (!group) {
        group = await this.userGroupModel.create({
          name: role.name,
          title: role.title,
          type: USER_GROUP_TYPE.ROLE,
          permissions: [permission._id],
        });
      } else {
        await this.userGroupModel.updateOne(
          { _id: group._id },
          { $addToSet: { permissions: permission._id } },
        );
      }
    }
    return permission;
  }

  async seedDemoUsers(): Promise<void> {
    if (process.env.SEED_DEMO_USERS !== 'true') return;

    const inspection = await this.ensureGroup(
      'inspection-unit',
      'واحد بازرسی',
      USER_GROUP_TYPE.SECTION,
    );
    const office = await this.ensureGroup(
      'management-office',
      'دفتر مدیریت',
      USER_GROUP_TYPE.SECTION,
    );
    const hrUnit = await this.ensureGroup(
      'hr-unit',
      'واحد منابع انسانی',
      USER_GROUP_TYPE.SECTION,
    );
    const staff = await this.ensureGroup('staff', 'کارمند', USER_GROUP_TYPE.ROLE);
    const ceo = await this.userGroupModel.findOne({ name: 'ceo' });
    const hr = await this.userGroupModel.findOne({ name: 'hr-manager' });

    const taskRead = await this.ensureTaskReadPermission();
    for (const group of [staff, ceo, hr].filter(Boolean)) {
      await this.userGroupModel.updateOne(
        { _id: group._id },
        { $addToSet: { permissions: taskRead._id } },
      );
    }

    const password = await this.hashingService.hash(DEMO_PASSWORD);
    const ceoUser = await this.ensureUser({
      phoneNo: '09121000001',
      name: 'رضا',
      lastname: 'مدیری',
      groups: [ceo?._id, office._id].filter(Boolean),
      password,
    });
    const hrUser = await this.ensureUser({
      phoneNo: '09121000002',
      name: 'سارا',
      lastname: 'منابعی',
      groups: [hr?._id, hrUnit._id].filter(Boolean),
      password,
    });
    const employee = await this.ensureUser({
      phoneNo: '09121000003',
      name: 'علی',
      lastname: 'کارمند',
      groups: [staff._id, inspection._id],
      password,
    });

    await this.ensurePersonnel(ceoUser);
    await this.ensurePersonnel(hrUser);
    await this.ensurePersonnel(employee);
    await this.ensureSampleHistory(employee);
    this.logger.log(
      'Demo users ready: 09121000001 CEO, 09121000002 HR, 09121000003 employee. Password Demo1234!',
    );
  }

  private async ensureGroup(name: string, title: string, type: USER_GROUP_TYPE) {
    const existing = await this.userGroupModel.findOne({ name });
    if (existing) return existing;
    return this.userGroupModel.create({
      name,
      title,
      type,
      permissions: [],
    });
  }

  private async ensureTaskReadPermission(): Promise<PermissionDocument> {
    const existing = await this.permissionModel.findOne({
      subject: Subjects.TASK,
      actions: PermissionAction.READ,
    });
    if (existing) return existing;
    return this.permissionModel.create({
      actions: [PermissionAction.READ],
      subject: Subjects.TASK,
      conditions: '{}',
      description: 'تسک‌ها - مشاهده',
    });
  }

  private async ensureUser(input: {
    phoneNo: string;
    name: string;
    lastname: string;
    groups: any[];
    password: string;
  }): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ phoneNo: input.phoneNo });
    if (existing) {
      const groups = (existing.groups ?? []).map(String);
      const missing = input.groups
        .map(String)
        .filter((id) => !groups.includes(id));
      if (missing.length) {
        await this.userModel.updateOne(
          { _id: existing._id },
          { $addToSet: { groups: { $each: input.groups } } },
        );
      }
      return existing;
    }
    return this.userModel.create({
      name: input.name,
      lastname: input.lastname,
      username: input.phoneNo,
      phoneNo: input.phoneNo,
      password: input.password,
      phoneValidated: true,
      setPassword: true,
      isActive: true,
      type: UserTypes.PERSONNEL,
      loginType: LoginTypes.PASSWORD,
      groups: input.groups,
    });
  }

  private async ensurePersonnel(user: UserDocument) {
    const exists = await this.personnelModel.exists({ userId: user._id });
    if (exists) return;
    await this.personnelModel.create({
      userId: user._id,
      createdBy: user._id,
    });
  }

  private async ensureSampleHistory(user: UserDocument) {
    const day = moment().utcOffset(210);
    const at = (hours: number, minutes = 0) =>
      day.clone().startOf('day').add(hours, 'hours').add(minutes, 'minutes').valueOf();
    const yesterdayDeadline = day.clone().startOf('day').subtract(1, 'hour').valueOf();
    const samples = [
      {
        caseNo: 'DEMO-ACTIVITY-1001',
        processDefinitionName: 'بازرسی',
        key: 'demo-review',
        summary: 'بررسی پرونده نمونه',
        description: 'اقدام سیستمی ثبت‌شده در تاریخچه کارتابل',
        status: 'done',
        timeStarted: at(9),
        timeCompleted: at(10, 30),
        dueDate: at(18),
        historyAction: 'complete',
      },
      {
        caseNo: 'DEMO-ACTIVITY-1002',
        processDefinitionName: 'دبیرخانه',
        key: 'demo-followup',
        summary: 'پیگیری مدارک',
        description: 'کار باز با مهلت گذشته؛ مدت زمان ندارد چون پایان ثبت نشده',
        status: 'todo',
        timeStarted: at(11),
        timeCompleted: -1,
        dueDate: yesterdayDeadline,
        historyAction: 'start',
      },
    ];

    for (const sample of samples) {
      let task = await this.userTasksModel.findOne({
        assignee: user._id,
        caseNo: sample.caseNo,
      });
      const instanceId = task?.processInstanceId
        ? new Types.ObjectId(String(task.processInstanceId))
        : new Types.ObjectId();
      const exists = await this.processInstanceModel.exists({ _id: instanceId });
      if (!exists) {
        await this.processInstanceModel.create({
          _id: instanceId,
          processDefinitionName: sample.processDefinitionName,
          name: sample.summary,
          caseNo: sample.caseNo,
          version: 0,
          parameters: {},
          owner: String(user._id),
        });
      }
      const shape = {
        processInstanceId: instanceId,
        processDefinitionKey: sample.key,
        candidate: { groups: [], users: [] },
        data: [],
        properties: [],
      };
      if (!task) {
        await this.userTasksModel.create({
          ...shape,
          processDefinitionName: sample.processDefinitionName,
          rootProcessInstanceId: instanceId,
          taskId: new Types.ObjectId(),
          key: sample.key,
          summary: sample.summary,
          description: sample.description,
          assignee: user._id,
          caseNo: sample.caseNo,
          status: sample.status,
          timeStarted: sample.timeStarted,
          timeCompleted: sample.timeCompleted,
          dueDate: sample.dueDate,
          expEndDate: sample.dueDate,
          history: [
            {
              parameters: { action: sample.historyAction },
              timeActivated: sample.timeStarted,
              timeStarted: sample.timeStarted,
              timeCompleted: sample.timeCompleted,
            },
          ],
        });
      } else {
        await this.userTasksModel.updateOne({ _id: task._id }, { $set: shape });
      }
    }

    this.logger.log(`Sample history for ${todayKey()} attached to ${user.phoneNo}`);
  }
}
