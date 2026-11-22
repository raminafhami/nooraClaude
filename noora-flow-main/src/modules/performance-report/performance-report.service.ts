import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { NotificationPriority } from '../notifications/enums';
import { NotificationsService } from '../notifications/notifications.service';
import { Personnel, PersonnelDocument } from '../personnel/schemas/personnel.schema';
import {
  ProcessInstance,
  ProcessInstanceDocument,
} from '../process-instances/schemas/process-instances.schema';
import {
  ProjectTask,
  ProjectTaskDocument,
} from '../project-task/schemas/project-task.schema';
import { UserTasks, UserTasksDocument } from '../tasks/schemas/user-tasks.schema';
import {
  USER_GROUP_TYPE,
  UserGroup,
  UserGroupDocument,
} from '../user-groups/schemas/user-group.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  Permission,
  PermissionDocument,
} from '../permissions/schemas/permission.schema';
import { Subjects } from '../iam/authentication/enums';
import {
  ActivityTypeDto,
  ChartQueryDto,
  CreateManualActivityDto,
  UpdateManualActivityDto,
} from './dto/manual-activity.dto';
import { PerformanceReportBootstrap } from './performance-report.bootstrap';
import {
  dayBounds,
  durationFromClocks,
  durationFromEpoch,
  eachDateKey,
  formatClock,
  formatDuration,
  jalaliMonthStart,
  parseDateKey,
  shiftDateKey,
  todayKey,
  toJalaliLabel,
} from './performance-report.time';
import {
  PerformanceActivityType,
  PerformanceActivityTypeDocument,
} from './schemas/activity-type.schema';
import {
  DailyActivityReport,
  DailyActivityReportDocument,
} from './schemas/daily-report.schema';
import { ManualActivity, ManualActivityDocument } from './schemas/manual-activity.schema';

const SEES_ALL = ['ceo', 'hr-manager', 'system-admin', 'super-admin', 'admins'];
const MANUAL_NOTE =
  'نبود فعالیت دستی به‌معنی عملکرد صفر نیست. ردیف‌های سیستمی از تاریخچه موجود ساخته می‌شوند.';

type UnitSnapshot = { id: string | null; title: string };

@Injectable()
export class PerformanceReportService implements OnModuleInit {
  private static cronStarted = false;

  constructor(
    @InjectModel(PerformanceActivityType.name)
    private readonly activityTypeModel: Model<PerformanceActivityTypeDocument>,
    @InjectModel(ManualActivity.name)
    private readonly manualModel: Model<ManualActivityDocument>,
    @InjectModel(DailyActivityReport.name)
    private readonly reportModel: Model<DailyActivityReportDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserGroup.name)
    private readonly groupModel: Model<UserGroupDocument>,
    @InjectModel(Personnel.name)
    private readonly personnelModel: Model<PersonnelDocument>,
    @InjectModel(UserTasks.name)
    private readonly userTasksModel: Model<UserTasksDocument>,
    @InjectModel(ProjectTask.name)
    private readonly projectTaskModel: Model<ProjectTaskDocument>,
    @InjectModel(ProcessInstance.name)
    private readonly processInstanceModel: Model<ProcessInstanceDocument>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly cronJobService: CronJobService,
    private readonly i18n: I18nService,
    private readonly bootstrap: PerformanceReportBootstrap,
  ) {}

  async onModuleInit() {
    await this.bootstrap.ensurePermission();
    await this.bootstrap.seedDemoUsers();
    if (PerformanceReportService.cronStarted) return;
    PerformanceReportService.cronStarted = true;
    this.cronJobService.startJob(
      '0 18 * * *',
      () => this.autoSend(),
      'Asia/Tehran',
      'dailyActivityReport',
    );
  }

  async myDay(actor: ActiveUserData, date?: string) {
    const user = await this.loadUser(actor.id);
    const dateKey = parseDateKey(date);
    return this.buildDay(user, dateKey);
  }

  async myUnits(actor: ActiveUserData) {
    const user = await this.loadUser(actor.id);
    return this.selectableUnits(user);
  }

  async myActivityTypes(actor: ActiveUserData) {
    const user = await this.loadUser(actor.id);
    const groupIds = this.groupIds(user);
    const types = await this.activityTypeModel
      .find({ isActive: true, groupId: { $in: groupIds } })
      .sort({ title: 1 });
    const groups = await this.groupModel.find({ _id: { $in: groupIds } });
    const titles = new Map(groups.map((group) => [String(group._id), group.title]));
    return types.map((type) => ({
      id: String(type._id),
      title: type.title,
      groupId: String(type.groupId),
      groupTitle: titles.get(String(type.groupId)) ?? '',
      description: type.description ?? '',
    }));
  }

  async colleagues(actor: ActiveUserData) {
    const personnel = await this.personnelModel.find({}).select('userId');
    const ids = personnel
      .map((item) => String(item.userId))
      .filter((id) => id !== String(actor.id));
    const users = await this.userModel
      .find({ _id: { $in: ids }, isActive: { $ne: false } })
      .select('name lastname')
      .sort({ name: 1 });
    return users.map((user) => ({
      id: String(user._id),
      fullName: this.fullName(user),
    }));
  }

  async createManual(actor: ActiveUserData, dto: CreateManualActivityDto) {
    const user = await this.loadUser(actor.id);
    const payload = await this.manualPayload(user, dto);
    const created = await this.manualModel.create({
      userId: user._id,
      fullName: this.fullName(user),
      ...payload,
      changeHistory: [],
    });
    return this.buildDay(user, created.dateKey);
  }

  async updateManual(
    actor: ActiveUserData,
    id: string,
    dto: UpdateManualActivityDto,
  ) {
    const activity = await this.ownedManual(actor, id);
    const user = await this.loadUser(actor.id);
    const merged = {
      date: dto.date ?? activity.dateKey,
      organizationalUnitId:
        dto.organizationalUnitId ?? activity.organizationalUnitId ?? undefined,
      activityTypeId: dto.activityTypeId ?? String(activity.activityTypeId),
      description: dto.description ?? activity.description,
      colleagueIds:
        dto.colleagueIds ?? activity.colleagues.map((item) => String(item.userId)),
      startTime: dto.startTime ?? activity.startTime ?? undefined,
      endTime: dto.endTime ?? activity.endTime ?? undefined,
      status: dto.status ?? activity.status,
      incompleteReason:
        dto.incompleteReason ?? activity.incompleteReason ?? undefined,
    };
    const payload = await this.manualPayload(user, merged);
    const before = this.snapshotManual(activity);
    Object.assign(activity, payload);
    const after = this.snapshotManual(activity);
    const changes = this.diff(before, after);
    const report = await this.reportModel.findOne({
      userId: user._id,
      dateKey: activity.dateKey,
    });
    if (report?.status === 'sent' && Object.keys(changes).length) {
      activity.changeHistory.push({
        at: new Date(),
        by: String(user._id),
        byName: this.fullName(user),
        changes,
      });
      report.changeHistory.push({
        at: new Date(),
        by: String(user._id),
        byName: this.fullName(user),
        summary: `ویرایش فعالیت «${activity.activityTypeTitle}»`,
      });
      await report.save();
    }
    await activity.save();
    return this.buildDay(user, activity.dateKey);
  }

  async deleteManual(actor: ActiveUserData, id: string) {
    const activity = await this.ownedManual(actor, id);
    const user = await this.loadUser(actor.id);
    const report = await this.reportModel.findOne({
      userId: user._id,
      dateKey: activity.dateKey,
    });
    if (report?.status === 'sent') {
      report.changeHistory.push({
        at: new Date(),
        by: String(user._id),
        byName: this.fullName(user),
        summary: `حذف فعالیت «${activity.activityTypeTitle}»`,
      });
      await report.save();
    }
    const dateKey = activity.dateKey;
    await activity.deleteOne();
    return this.buildDay(user, dateKey);
  }

  async sendToday(actor: ActiveUserData) {
    const user = await this.loadUser(actor.id);
    await this.sendReport(user, todayKey(), 'manual');
    return this.buildDay(user, todayKey());
  }

  async autoSend() {
    const personnel = await this.personnelModel.find({}).select('userId');
    for (const item of personnel) {
      try {
        const user = await this.loadUser(String(item.userId));
        if (user.isActive === false) continue;
        await this.sendReport(user, todayKey(), 'auto');
      } catch (error) {
        console.error('daily activity auto-send failed', item.userId, error);
      }
    }
  }

  async access() {
    return { canView: true };
  }

  async personnelList(actor: ActiveUserData, date?: string) {
    const dateKey = parseDateKey(date);
    const people = await this.scopedPeople(actor);
    const rows = [];
    let showDelayed = false;
    for (const person of people) {
      const day = await this.buildDay(person, dateKey);
      if (day.delayedTasks !== null) showDelayed = true;
      rows.push({
        userId: String(person._id),
        fullName: this.fullName(person),
        organizationalUnitId: day.organizationalUnit.id,
        organizationalUnitTitle: day.organizationalUnit.title,
        dateKey,
        dateLabel: toJalaliLabel(dateKey),
        total: day.summary.total,
        system: day.summary.system,
        manual: day.summary.manual,
        completed: day.summary.completed,
        incomplete: day.summary.incomplete,
        delayedTasks: day.delayedTasks,
        reportStatus: day.reportStatus,
        reportStatusLabel: day.reportStatusLabel,
      });
    }
    return { dateKey, dateLabel: toJalaliLabel(dateKey), showDelayed, rows, note: MANUAL_NOTE };
  }

  async personnelDay(actor: ActiveUserData, userId: string, date?: string) {
    const person = await this.assertInScope(actor, userId);
    return this.buildDay(person, parseDateKey(date));
  }

  async filters(actor: ActiveUserData) {
    const people = await this.scopedPeople(actor);
    const units = new Map<string, string>();
    for (const person of people) {
      const unit = await this.resolveUnit(person);
      if (unit.id) units.set(unit.id, unit.title);
    }
    const types = await this.activityTypeModel.find({}).sort({ title: 1 });
    return {
      employees: people.map((person) => ({
        id: String(person._id),
        fullName: this.fullName(person),
      })),
      units: [...units.entries()].map(([id, title]) => ({ id, title })),
      activityTypes: types.map((type) => ({
        id: String(type._id),
        title: type.title,
      })),
      origins: [
        { id: 'system', title: 'سیستمی' },
        { id: 'manual', title: 'ثبت‌شده توسط کارمند' },
      ],
      sourceModules: [
        { id: 'user-task', title: 'کارتابل' },
        { id: 'manual', title: 'ثبت دستی' },
      ],
    };
  }

  async charts(actor: ActiveUserData, query: ChartQueryDto) {
    const anchor = parseDateKey(query.date || query.to);
    let from = query.from ? parseDateKey(query.from) : anchor;
    const to = query.to ? parseDateKey(query.to) : anchor;
    if (!query.from) {
      if (query.range === 'week') from = shiftDateKey(anchor, -6);
      if (query.range === 'month') from = jalaliMonthStart(anchor);
    }
    if (from > to) from = to;
    const days = eachDateKey(from, to);
    let people = await this.scopedPeople(actor);
    if (query.userId) {
      people = people.filter((person) => String(person._id) === query.userId);
    }
    if (query.unitId) {
      const matched = [];
      for (const person of people) {
        const unit = await this.resolveUnit(person);
        if (unit.id === query.unitId) matched.push(person);
      }
      people = matched;
    }

    const userIds = people.map((person) => person._id);
    const manuals = await this.manualModel.find({
      userId: { $in: userIds },
      dateKey: { $gte: days[0], $lte: days[days.length - 1] },
    });
    const tasks = await this.tasksOverlapping(userIds, days[0], days[days.length - 1]);
    const linked = await this.linkedInstances(tasks);
    const delay = await this.delayByUser(userIds, dayBounds(days[days.length - 1]).endMs);

    const rows = [];
    for (const person of people) {
      const id = String(person._id);
      const unit = await this.resolveUnit(person);
        const personTasks = tasks.filter((task) => String(task.assignee) === id);
        const personLabel = { id, fullName: this.fullName(person) };
        const used = new Set<string>();
        for (const dateKey of days) {
          const bounds = dayBounds(dateKey);
          for (const task of personTasks) {
            const taskId = String(task._id);
            if (used.has(taskId)) continue;
            if (!this.taskMatchesDay(task, bounds)) continue;
            used.add(taskId);
            rows.push(this.systemRow(task, dateKey, unit, linked, personLabel));
          }
          for (const manual of manuals.filter(
            (item) => String(item.userId) === id && item.dateKey === dateKey,
          )) {
            rows.push(this.manualRow(manual, personLabel.fullName));
          }
        }
    }

    const filtered = rows.filter((row) => {
      if (query.origin && row.origin !== query.origin) return false;
      if (query.sourceModule && row.sourceModule !== query.sourceModule) return false;
      if (query.activityTypeId && row.activityTypeId !== query.activityTypeId) {
        return false;
      }
      if (query.unitId && row.organizationalUnitId !== query.unitId) return false;
      return true;
    });

    return this.aggregateCharts(filtered, people, delay, from, to);
  }

  async listActivityTypes() {
    const types = await this.activityTypeModel.find({}).sort({ title: 1 });
    const groups = await this.groupModel.find({
      _id: { $in: types.map((type) => type.groupId) },
    });
    const titles = new Map(groups.map((group) => [String(group._id), group.title]));
    return types.map((type) => ({
      id: String(type._id),
      title: type.title,
      description: type.description ?? '',
      isActive: type.isActive,
      groupId: String(type.groupId),
      groupTitle: titles.get(String(type.groupId)) ?? '',
    }));
  }

  async createActivityType(dto: ActivityTypeDto) {
    const group = await this.groupModel.findById(dto.groupId);
    if (!group) throw new BadRequestException(this.msg('performance_report_unit_invalid', 'گروه انتخاب‌شده وجود ندارد'));
    const created = await this.activityTypeModel.create({
      title: dto.title.trim(),
      groupId: group._id,
      description: dto.description?.trim() ?? '',
      isActive: dto.isActive !== false,
    });
    return this.listActivityTypes().then((items) =>
      items.find((item) => item.id === String(created._id)),
    );
  }

  async updateActivityType(id: string, dto: ActivityTypeDto) {
    const type = await this.activityTypeModel.findById(id);
    if (!type) throw new NotFoundException('activity type not found');
    if (dto.groupId) {
      const group = await this.groupModel.findById(dto.groupId);
      if (!group) throw new BadRequestException('گروه انتخاب‌شده وجود ندارد');
      type.groupId = String(group._id);
    }
    if (dto.title) type.title = dto.title.trim();
    if (dto.description !== undefined) type.description = dto.description.trim();
    if (dto.isActive !== undefined) type.isActive = dto.isActive;
    await type.save();
    return this.listActivityTypes().then((items) => items.find((item) => item.id === id));
  }

  async deleteActivityType(id: string) {
    const deleted = await this.activityTypeModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('activity type not found');
    return { deleted: true };
  }

  private async sendReport(
    user: UserDocument,
    dateKey: string,
    sentBy: 'manual' | 'auto',
  ) {
    const existing = await this.reportModel.findOne({ userId: user._id, dateKey });
    if (existing?.status === 'sent') {
      if (sentBy === 'manual') {
        throw new BadRequestException(
          this.msg(
            'performance_report_already_sent',
            'گزارش این روز قبلاً ارسال شده است',
          ),
        );
      }
      return existing;
    }
    const unit = await this.resolveUnit(user);
    const report = await this.reportModel.create({
      userId: user._id,
      dateKey,
      status: 'sent',
      sentAt: new Date(),
      sentBy,
      fullName: this.fullName(user),
      organizationalUnitId: unit.id,
      organizationalUnitTitle: unit.title,
      notificationSent: false,
      changeHistory: [],
    });
    try {
      const notified = await this.notify(user, report, sentBy);
      if (notified) {
        report.notificationSent = true;
        await report.save();
      }
    } catch (error) {
      console.error('daily activity notification failed', error);
    }
    return report;
  }

  private async notify(
    user: UserDocument,
    report: DailyActivityReportDocument,
    sentBy: 'manual' | 'auto',
  ) {
    const recipients = new Set<string>();
    if (sentBy === 'auto') recipients.add(String(user._id));
    const managers = await this.managersWhoCanSee(user);
    managers.forEach((id) => recipients.add(id));
    if (!recipients.size) return false;

    const label = toJalaliLabel(report.dateKey);
    const title =
      sentBy === 'auto' ? 'ارسال خودکار گزارش فعالیت' : 'گزارش فعالیت ارسال شد';
    const description =
      sentBy === 'auto' && recipients.has(String(user._id))
        ? `گزارش فعالیت ${label} ساعت ۱۸ به‌صورت خودکار ارسال شد.`
        : `${this.fullName(user)} گزارش فعالیت ${label} را ارسال کرد.`;
    const notification = await this.notificationsService.create({
      title,
      description,
      category: 'performance-report',
      priority: NotificationPriority.MEDIUM,
      recipient: { users: [...recipients], groups: [] },
      link: `/dashboard/charts?tab=performance&userId=${user._id}&date=${report.dateKey}`,
      createdBy: user._id,
      isPublished: true,
    });
    await this.notificationsService.sendNotification(notification);
    return true;
  }

  private async managersWhoCanSee(employee: UserDocument) {
    const permission = await this.permissionModel.findOne({
      subject: Subjects.PERFORMANCE_REPORT,
      actions: 'read',
    });
    if (!permission) return [];
    const groups = await this.groupModel.find({
      permissions: { $in: [permission._id, String(permission._id)] },
    });
    if (!groups.length) return [];
    const managers = await this.userModel.find({
      groups: { $in: groups.map((group) => group._id) },
      isActive: { $ne: false },
    });
    const ids = [];
    for (const manager of managers) {
      if (String(manager._id) === String(employee._id)) continue;
      const populated = await this.loadUser(String(manager._id));
      const actor = {
        id: String(populated._id),
        groups: (populated.groups ?? []).map((group: any) => group.name),
        type: populated.type,
        branchId: populated.branchId,
      } as ActiveUserData;
      if (await this.canSee(actor, employee)) ids.push(String(manager._id));
    }
    return ids;
  }

  private async buildDay(user: UserDocument, dateKey: string) {
    const report = await this.reportModel.findOne({ userId: user._id, dateKey });
    const unit =
      report?.status === 'sent'
        ? {
            id: report.organizationalUnitId,
            title: report.organizationalUnitTitle,
          }
        : await this.resolveUnit(user);
    const manuals = await this.manualModel
      .find({ userId: user._id, dateKey })
      .sort({ startTime: 1, createdAt: 1 });
    const tasks = await this.tasksOnDay(String(user._id), dateKey);
    const linked = await this.linkedInstances(tasks);
    const personLabel = { id: String(user._id), fullName: this.fullName(user) };
    const rows = [
      ...tasks.map((task) => this.systemRow(task, dateKey, unit, linked, personLabel)),
      ...manuals.map((manual) => this.manualRow(manual, personLabel.fullName)),
    ].sort((a, b) => (a.sortKey || '').localeCompare(b.sortKey || ''));
    const summary = this.summarize(rows);
    const delayedTasks = (await this.delayByUser([user._id], dayBounds(dateKey).endMs)).get(
      String(user._id),
    );
    return {
      userId: String(user._id),
      fullName: report?.fullName || this.fullName(user),
      dateKey,
      dateLabel: toJalaliLabel(dateKey),
      organizationalUnit: unit,
      reportStatus: report?.status === 'sent' ? 'sent' : 'draft',
      reportStatusLabel: report?.status === 'sent' ? 'ارسال‌شده' : 'پیش‌نویس',
      sentAt: report?.sentAt ?? null,
      sentBy: report?.sentBy ?? null,
      reportChangeHistory: report?.changeHistory ?? [],
      delayedTasks: delayedTasks ?? null,
      note: MANUAL_NOTE,
      summary,
      rows,
    };
  }

  private summarize(rows: any[]) {
    const durationMinutes = rows.reduce(
      (sum, row) => sum + (row.durationMinutes ?? 0),
      0,
    );
    const hasDuration = rows.some((row) => row.durationMinutes);
    return {
      total: rows.length,
      system: rows.filter((row) => row.origin === 'system').length,
      manual: rows.filter((row) => row.origin === 'manual').length,
      completed: rows.filter((row) => row.status === 'completed').length,
      incomplete: rows.filter((row) => row.status === 'incomplete').length,
      durationMinutes: hasDuration ? durationMinutes : null,
      durationLabel: hasDuration ? formatDuration(durationMinutes) : null,
    };
  }

  private async tasksOnDay(userId: string, dateKey: string) {
    const bounds = dayBounds(dateKey);
    return this.userTasksModel.find({
      assignee: userId,
      $or: [
        { createdAt: { $gte: bounds.start, $lt: bounds.end } },
        { timeStarted: { $gte: bounds.startMs, $lt: bounds.endMs } },
        { timeCompleted: { $gte: bounds.startMs, $lt: bounds.endMs } },
        { 'history.timeStarted': { $gte: bounds.startMs, $lt: bounds.endMs } },
        { 'history.timeCompleted': { $gte: bounds.startMs, $lt: bounds.endMs } },
      ],
    });
  }

  private async tasksOverlapping(userIds: any[], from: string, to: string) {
    const start = dayBounds(from);
    const end = dayBounds(to);
    return this.userTasksModel.find({
      assignee: { $in: userIds },
      $or: [
        { createdAt: { $gte: start.start, $lt: end.end } },
        { timeStarted: { $gte: start.startMs, $lt: end.endMs } },
        { timeCompleted: { $gte: start.startMs, $lt: end.endMs } },
        { 'history.timeStarted': { $gte: start.startMs, $lt: end.endMs } },
        { 'history.timeCompleted': { $gte: start.startMs, $lt: end.endMs } },
      ],
    });
  }

  private taskMatchesDay(
    task: UserTasksDocument,
    bounds: { startMs: number; endMs: number; start: Date; end: Date },
  ) {
    const stamps = [
      task.timeStarted,
      task.timeCompleted,
      ...(task.history ?? []).flatMap((entry) => [entry?.timeStarted, entry?.timeCompleted]),
    ];
    if (
      stamps.some((value) => {
        const time = Number(value);
        return time > 0 && time >= bounds.startMs && time < bounds.endMs;
      })
    ) {
      return true;
    }
    const created = task.get('createdAt') as Date | undefined;
    return Boolean(created && created >= bounds.start && created < bounds.end);
  }

  private systemRow(
    task: UserTasksDocument,
    dateKey: string,
    unit: UnitSnapshot,
    linked: Set<string>,
    person: { id: string; fullName: string },
  ) {
    const history = (task.history ?? []).find((entry) => {
      const started = Number(entry?.timeStarted);
      const completed = Number(entry?.timeCompleted);
      return started > 0 || completed > 0;
    });
    const startedMs = Number(history?.timeStarted) > 0
      ? Number(history.timeStarted)
      : Number(task.timeStarted);
    const completedMs = Number(history?.timeCompleted) > 0
      ? Number(history.timeCompleted)
      : Number(task.timeCompleted);
    const startTime = formatClock(startedMs);
    const endTime = formatClock(completedMs);
    const durationMinutes = durationFromEpoch(startedMs, completedMs);
    const completed = completedMs > 0 || ['done', 'completed'].includes(task.status);
    const deadline =
      Number(task.dueDate) > 0
        ? Number(task.dueDate)
        : Number(task.expEndDate) > 0
          ? Number(task.expEndDate)
          : 0;
    const deadlineMet =
      deadline > 0 && completedMs > 0 ? completedMs <= deadline : null;
    const instanceId = String(task.processInstanceId || '');
    return {
      id: `system:${task._id}`,
      userId: person.id,
      fullName: person.fullName,
      origin: 'system',
      originLabel: 'سیستمی',
      dateKey,
      deadlineMet,
      sortKey: startTime || formatClock(task.get('createdAt')?.valueOf?.()) || '99:99',
      title: task.summary,
      description: task.description || '',
      sourceModule: 'user-task',
      sourceModuleLabel: 'کارتابل',
      sourceLink: linked.has(instanceId) ? `/dashboard/tasks/${task.taskId}` : null,
      relatedLabel: task.caseNo || task.processDefinitionName || null,
      startTime,
      endTime,
      durationMinutes,
      durationLabel: formatDuration(durationMinutes),
      colleagues: [],
      status: completed ? 'completed' : 'incomplete',
      statusLabel: completed ? 'تکمیل‌شده' : 'تکمیل‌نشده',
      incompleteReason: null,
      activityTypeId: null,
      activityTypeTitle: task.processDefinitionName || null,
      organizationalUnitId: unit.id,
      organizationalUnitTitle: unit.title,
      changeHistory: [],
    };
  }

  private manualRow(activity: ManualActivityDocument, fullName?: string) {
    const durationMinutes = durationFromClocks(activity.startTime, activity.endTime);
    return {
      id: String(activity._id),
      userId: String(activity.userId),
      fullName: fullName || activity.fullName,
      origin: 'manual',
      originLabel: 'ثبت‌شده توسط کارمند',
      dateKey: activity.dateKey,
      sortKey: activity.startTime || '99:99',
      title: activity.activityTypeTitle,
      description: activity.description,
      sourceModule: 'manual',
      sourceModuleLabel: 'ثبت دستی',
      sourceLink: null,
      relatedLabel: null,
      startTime: activity.startTime,
      endTime: activity.endTime,
      durationMinutes,
      durationLabel: formatDuration(durationMinutes),
      colleagues: activity.colleagues.map((item) => ({
        userId: String(item.userId),
        fullName: item.fullName,
      })),
      status: activity.status,
      statusLabel: activity.status === 'completed' ? 'تکمیل‌شده' : 'تکمیل‌نشده',
      incompleteReason: activity.incompleteReason,
      activityTypeId: String(activity.activityTypeId),
      activityTypeTitle: activity.activityTypeTitle,
      organizationalUnitId: activity.organizationalUnitId,
      organizationalUnitTitle: activity.organizationalUnitTitle,
      changeHistory: activity.changeHistory ?? [],
    };
  }

  private async linkedInstances(tasks: UserTasksDocument[]) {
    const ids = tasks
      .map((task) => task.processInstanceId)
      .filter((id) => id && Types.ObjectId.isValid(String(id)));
    if (!ids.length) return new Set<string>();
    const found = await this.processInstanceModel
      .find({ _id: { $in: ids } })
      .select('_id');
    return new Set(found.map((item) => String(item._id)));
  }

  private async delayByUser(userIds: any[], asOfMs: number) {
    const result = new Map<string, number | null>();
    userIds.forEach((id) => result.set(String(id), null));
    if (!userIds.length) return result;
    const tasks = await this.userTasksModel
      .find({
        assignee: { $in: userIds },
        $or: [{ dueDate: { $gt: 0 } }, { expEndDate: { $gt: 0 } }],
      })
      .select('assignee dueDate expEndDate timeCompleted status');
    const projects = await this.projectTaskModel
      .find({
        assignee: { $in: userIds },
        deadline: { $ne: null },
      })
      .select('assignee deadline progress');

    const seen = new Set<string>();
    const bump = (userId: string, delayed: boolean) => {
      seen.add(userId);
      const current = result.get(userId);
      result.set(userId, (current ?? 0) + (delayed ? 1 : 0));
    };
    for (const task of tasks) {
      const deadline = Number(task.dueDate) > 0 ? Number(task.dueDate) : Number(task.expEndDate);
      if (!deadline || deadline <= 0) continue;
      const userId = String(task.assignee);
      const finished = Number(task.timeCompleted) > 0 && Number(task.timeCompleted) <= deadline;
      bump(userId, deadline < asOfMs && !finished);
    }
    for (const task of projects) {
      if (!task.deadline) continue;
      const deadline = new Date(task.deadline).valueOf();
      if (!deadline) continue;
      const userId = String(task.assignee);
      const finished = Number(task.progress) >= 100;
      bump(userId, deadline < asOfMs && !finished);
    }
    for (const [userId, value] of result) {
      if (!seen.has(userId)) result.set(userId, null);
      else if (value === null) result.set(userId, 0);
    }
    return result;
  }

  private aggregateCharts(
    rows: any[],
    people: UserDocument[],
    delay: Map<string, number | null>,
    from: string,
    to: string,
  ) {
    const nameOf = new Map(people.map((person) => [String(person._id), this.fullName(person)]));
    const byEmployeeMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const moduleMap = new Map<string, number>();
    const unitMap = new Map<string, number>();
    const timeMap = new Map<string, number>();
    const collabMap = new Map<string, number>();
    let completed = 0;
    let incomplete = 0;
    let systemCompleted = 0;
    let systemTotal = 0;
    let onTime = 0;
    let onTimeBase = 0;

    for (const row of rows) {
      const name = row.fullName || nameOf.get(row.userId) || row.title;
      byEmployeeMap.set(name, (byEmployeeMap.get(name) ?? 0) + 1);
      const dailyKey = `${row.dateKey}|${name}`;
      dailyMap.set(dailyKey, (dailyMap.get(dailyKey) ?? 0) + 1);
      if (row.status === 'completed') completed += 1;
      else incomplete += 1;
      if (row.origin === 'system') {
        systemTotal += 1;
        if (row.status === 'completed') systemCompleted += 1;
      }
      const typeName = row.activityTypeTitle || (row.origin === 'system' ? 'سیستمی' : 'بدون نوع');
      typeMap.set(typeName, (typeMap.get(typeName) ?? 0) + 1);
      moduleMap.set(row.sourceModuleLabel, (moduleMap.get(row.sourceModuleLabel) ?? 0) + 1);
      unitMap.set(
        row.organizationalUnitTitle,
        (unitMap.get(row.organizationalUnitTitle) ?? 0) + 1,
      );
      if (row.durationMinutes) {
        timeMap.set(name, (timeMap.get(name) ?? 0) + row.durationMinutes);
      }
      if (row.colleagues?.length) {
        collabMap.set(name, (collabMap.get(name) ?? 0) + row.colleagues.length);
      }
    }

    const systemRows = rows.filter((row) => row.origin === 'system');
    for (const row of systemRows) {
      if (row.deadlineMet === true) {
        onTime += 1;
        onTimeBase += 1;
      } else if (row.deadlineMet === false) {
        onTimeBase += 1;
      }
    }

    const delayedRows = people
      .map((person) => ({
        name: this.fullName(person),
        count: delay.get(String(person._id)),
      }))
      .filter((item) => item.count !== null && item.count !== undefined);
    const hasDelay = delayedRows.length > 0;

    const toSeries = (map: Map<string, number>) =>
      [...map.entries()].map(([name, count]) => ({ name, count }));

    return {
      from,
      to,
      fromLabel: toJalaliLabel(from),
      toLabel: toJalaliLabel(to),
      note: MANUAL_NOTE,
      summary: {
        volume: rows.length,
        completed,
        incomplete,
        durationMinutes: [...timeMap.values()].reduce((sum, value) => sum + value, 0) || null,
        collaboration: [...collabMap.values()].reduce((sum, value) => sum + value, 0) || null,
        taskCompletionPercent: systemTotal
          ? Math.round((systemCompleted / systemTotal) * 100)
          : null,
        onTimePercent: onTimeBase ? Math.round((onTime / onTimeBase) * 100) : null,
        delayed: hasDelay
          ? delayedRows.reduce((sum, item) => sum + (item.count as number), 0)
          : null,
      },
      dailyActivityCount: dailyMap.size
        ? [...dailyMap.entries()].map(([key, count]) => {
            const [dateKey, name] = key.split('|');
            return { date: toJalaliLabel(dateKey), name, count };
          })
        : null,
      byEmployee: byEmployeeMap.size ? toSeries(byEmployeeMap) : null,
      completedVsIncomplete: rows.length ? { completed, incomplete } : null,
      delayedByEmployee: hasDelay ? delayedRows : null,
      timeSpent: timeMap.size
        ? [...timeMap.entries()].map(([name, minutes]) => ({
            name,
            minutes,
            label: formatDuration(minutes),
          }))
        : null,
      byActivityType: typeMap.size ? toSeries(typeMap) : null,
      bySourceModule: moduleMap.size ? toSeries(moduleMap) : null,
      collaboration: collabMap.size ? toSeries(collabMap) : null,
      byUnit: unitMap.size ? toSeries(unitMap) : null,
    };
  }

  private async manualPayload(user: UserDocument, dto: CreateManualActivityDto) {
    const dateKey = parseDateKey(dto.date);
    const type = await this.activityTypeModel.findOne({
      _id: dto.activityTypeId,
      isActive: true,
      groupId: { $in: this.groupIds(user) },
    });
    if (!type) {
      throw new BadRequestException(
        this.msg(
          'performance_report_type_invalid',
          'نوع فعالیت برای گروه شما تعریف نشده است',
        ),
      );
    }
    const colleagues = await this.colleagueSnapshots(user, dto.colleagueIds);
    const unit = await this.pickUnit(user, dto.organizationalUnitId);
    const status = dto.status;
    const reason = dto.incompleteReason?.trim() || '';
    if (status === 'incomplete' && !reason) {
      throw new BadRequestException(
        this.msg(
          'performance_report_incomplete_reason',
          'برای فعالیت تکمیل‌نشده ذکر دلیل الزامی است',
        ),
      );
    }
    return {
      dateKey,
      organizationalUnitId: unit.id,
      organizationalUnitTitle: unit.title,
      activityTypeId: type._id,
      activityTypeTitle: type.title,
      groupId: type.groupId,
      description: dto.description.trim(),
      colleagues,
      startTime: dto.startTime?.trim() || null,
      endTime: dto.endTime?.trim() || null,
      status,
      incompleteReason: status === 'incomplete' ? reason : null,
    };
  }

  private async colleagueSnapshots(user: UserDocument, ids: string[]) {
    const unique = [...new Set(ids.map(String))].filter((id) => id !== String(user._id));
    if (!unique.length) {
      throw new BadRequestException(
        this.msg(
          'performance_report_colleague_required',
          'حداقل یک همکار را انتخاب کنید',
        ),
      );
    }
    const users = await this.userModel.find({ _id: { $in: unique } }).select('name lastname');
    if (users.length !== unique.length) {
      throw new BadRequestException('همکار انتخاب‌شده یافت نشد');
    }
    return users.map((colleague) => ({
      userId: colleague._id,
      fullName: this.fullName(colleague),
    }));
  }

  private async pickUnit(user: UserDocument, requested?: string | null): Promise<UnitSnapshot> {
    const units = await this.selectableUnits(user);
    if (!requested) return units[0] ?? (await this.resolveUnit(user));
    const match = units.find((unit) => unit.id === requested);
    if (!match) {
      throw new BadRequestException(
        this.msg(
          'performance_report_unit_invalid',
          'واحد سازمانی انتخاب‌شده متعلق به شما نیست',
        ),
      );
    }
    return match;
  }

  private async selectableUnits(user: UserDocument): Promise<UnitSnapshot[]> {
    const groups = (user.groups ?? []) as any[];
    const units = groups
      .filter((group) => group?.type && group.type !== USER_GROUP_TYPE.ROLE)
      .map((group) => ({ id: String(group._id), title: group.title }));
    if (user.branchId) {
      const branch = await this.groupModel.findById(user.branchId);
      if (branch && !units.some((unit) => unit.id === String(branch._id))) {
        units.push({ id: String(branch._id), title: branch.title });
      }
    }
    if (!units.length) units.push(await this.resolveUnit(user));
    return units;
  }

  private async resolveUnit(user: UserDocument): Promise<UnitSnapshot> {
    const groups = (user.groups ?? []) as any[];
    const section = groups.find((group) => group?.type === USER_GROUP_TYPE.SECTION);
    if (section) return { id: String(section._id), title: section.title };
    if (user.branchId) {
      const branch = await this.groupModel.findById(user.branchId);
      if (branch) return { id: String(branch._id), title: branch.title };
    }
    const other = groups.find((group) => group?.type && group.type !== USER_GROUP_TYPE.ROLE);
    if (other) return { id: String(other._id), title: other.title };
    return { id: null, title: 'بدون واحد' };
  }

  private async scopedPeople(actor: ActiveUserData) {
    const personnel = await this.personnelModel.find({}).select('userId');
    const users = await this.userModel
      .find({ _id: { $in: personnel.map((item) => item.userId) }, isActive: { $ne: false } })
      .populate('groups');
    const visible = [];
    for (const user of users) {
      if (await this.canSee(actor, user)) visible.push(user);
    }
    return visible.sort((a, b) => this.fullName(a).localeCompare(this.fullName(b), 'fa'));
  }

  private async assertInScope(actor: ActiveUserData, userId: string) {
    const user = await this.loadUser(userId);
    if (!(await this.canSee(actor, user))) {
      throw new ForbiddenException(
        this.msg(
          'performance_report_out_of_scope',
          'این پرسنل در محدوده واحدهای شما نیست',
        ),
      );
    }
    return user;
  }

  private async canSee(actor: ActiveUserData, user: UserDocument) {
    if (actor.type === 'system') return true;
    if ((actor.groups ?? []).some((group) => SEES_ALL.includes(group))) return true;
    return String(user.branchId || '') === String(actor.branchId || '');
  }

  private async ownedManual(actor: ActiveUserData, id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('activity not found');
    const activity = await this.manualModel.findById(id);
    if (!activity) throw new NotFoundException('activity not found');
    if (String(activity.userId) !== String(actor.id)) {
      throw new ForbiddenException(
        this.msg('performance_report_not_owner', 'این فعالیت متعلق به شما نیست'),
      );
    }
    return activity;
  }

  private async loadUser(id: string) {
    const user = await this.userModel.findById(id).populate('groups');
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  private groupIds(user: UserDocument) {
    return (user.groups ?? []).map((group: any) => group?._id || group);
  }

  private fullName(user: { name?: string; lastname?: string }) {
    return `${user.name ?? ''} ${user.lastname ?? ''}`.trim();
  }

  private snapshotManual(activity: ManualActivityDocument) {
    return {
      dateKey: activity.dateKey,
      organizationalUnitTitle: activity.organizationalUnitTitle,
      activityTypeTitle: activity.activityTypeTitle,
      description: activity.description,
      colleagues: activity.colleagues.map((item) => item.fullName).join('، '),
      startTime: activity.startTime,
      endTime: activity.endTime,
      status: activity.status,
      incompleteReason: activity.incompleteReason,
    };
  }

  private diff(before: Record<string, unknown>, after: Record<string, unknown>) {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(after)) {
      if (JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null)) {
        changes[key] = { from: before[key] ?? null, to: after[key] ?? null };
      }
    }
    return changes;
  }

  private msg(key: string, fallback: string) {
    const translated = this.i18n.translate(`common.${key}`, { lang: 'fa' });
    return typeof translated === 'string' && !translated.startsWith('common.')
      ? translated
      : fallback;
  }
}
