/* eslint-disable prefer-const */
import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreatePersonnelRequestDto } from './dto/create-personnel-request.dto';
import { UpdatePersonnelRequestDto } from './dto/update-personnel-request.dto';
import { CrudService } from 'src/shared/crud/service/crud.service';
import {
  PERSONNEL_REQUEST_STATUS,
  PersonnelRequest,
  PersonnelRequestDocument,
} from './schemas/personnel-request.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { PersonnelService } from '../personnel/personnel.service';
import { PersonnelRequestRepositoryImpl } from './repository/personnel-request.repository';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { GetQueryDto } from '../../shared/crud/dto/get-query.dto';
import { PersonnelAttendanceService } from '../personnel-attendance/personnel-attendance.service';
import { PERSONNEL_REQUEST_TYPE } from './schemas/personnel-request.schema';
import CustomError from 'src/common/providers/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import {
  getDatesBetween,
  checkOfficePresence,
  compareTimes,
  addTwoTimeStrings,
  calculateTimeDifference,
  subtractDurations,
} from 'src/common/providers/moment-date';
import CustomResponse from 'src/common/providers/custom-response.service';
import { ConfirmOrRejectPersonnelRequestsDto } from './dto/confirm-or-reject-personnel-requests.dto';
import {
  PERSONNEL_ATTENDANCE_STATUS,
  PersonnelAttendanceDocument,
} from '../personnel-attendance/schemas/personnel-attendance.schema';

@Injectable()
export class PersonnelRequestService extends CrudService<PersonnelRequestDocument> {
  constructor(
    @InjectModel('PersonnelRequest')
    personnelRequestModel: Model<PersonnelRequest>,
    private readonly personnelRequestRepositoryImpl: PersonnelRequestRepositoryImpl,
    @Inject(forwardRef(() => PersonnelAttendanceService))
    private personnelAttendanceService: PersonnelAttendanceService, // private readonly personnelAttendanceService: PersonnelAttendanceService
  ) {
    super(personnelRequestRepositoryImpl);
  }

  // make request with these types (hourly leave - daily leave - hourly mission - daily mission)
  async createRequest(
    createPersonnelRequestDto: CreatePersonnelRequestDto,
    user: ActiveUserData,
  ) {
    if (createPersonnelRequestDto.deputyId && createPersonnelRequestDto.deputyId === user.id) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.BAD_REQUEST,
      );
    }
    if (
      createPersonnelRequestDto.type === PERSONNEL_REQUEST_TYPE.DAILY_LEAVE ||
      createPersonnelRequestDto.type === PERSONNEL_REQUEST_TYPE.DAILY_MISSION
    ) {
      if (
        createPersonnelRequestDto.dateFrom > createPersonnelRequestDto.dateTo
      ) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          CustomMessages.BAD_REQUEST,
        );
      }
    } else {
      if (
        createPersonnelRequestDto.timeFrom >= createPersonnelRequestDto.timeTo
      ) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          CustomMessages.BAD_REQUEST,
        );
      }
    }

    switch (createPersonnelRequestDto.type) {
      case PERSONNEL_REQUEST_TYPE.DAILY_LEAVE: {
        /**
         * morakhasi roozane
         * baraye roozi ke asan nabayad biay sar kar va ghanun barat tarif nashode nemituni morakhasi roozane bezani
         * baraye roozike vorud khoruj zadi nemituni morakhasi roozane bezani
         */

        let datesBetween = getDatesBetween(
          createPersonnelRequestDto.dateFrom,
          createPersonnelRequestDto.dateTo,
        );

        let personnelAttendance =
          await this.personnelAttendanceService.findWithOutPagination({
            userId: user.id,
            date: {
              $gte: createPersonnelRequestDto.dateFrom,
              $lte: createPersonnelRequestDto.dateTo,
            },
          });

        if (personnelAttendance.length !== datesBetween.length) {
          throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.NOT_FOUND);
        }

        for (let i = 0; i < personnelAttendance.length; i++) {
          if (personnelAttendance[i].entryTime) {
            throw new CustomError(
              HttpStatus.FORBIDDEN,
              CustomMessages.FORBIDDEN,
            );
          }
        }
        return await this.personnelRequestRepositoryImpl.create({
          ...createPersonnelRequestDto,
          userId: user.id,
          status: PERSONNEL_REQUEST_STATUS.WAITING_CONFIRMATION,
          type: PERSONNEL_REQUEST_TYPE.DAILY_LEAVE,
        });

        break;
      }

      case PERSONNEL_REQUEST_TYPE.HOURLY_LEAVE: {
        let personnelAttendance = await this.personnelAttendanceService.findOne(
          { date: createPersonnelRequestDto.dateFrom, userId: user.id },
          null,
          'workingTimeRegulation',
        );

        //! You are not allowed to record a leave while you are working or you haven't attend at office yet
        if (
          personnelAttendance.status === PERSONNEL_ATTENDANCE_STATUS.WORKING ||
          personnelAttendance.status === PERSONNEL_ATTENDANCE_STATUS.ABSENCE
        ) {
          throw new CustomError(
            HttpStatus.BAD_REQUEST,
            CustomMessages.FORBIDDEN,
          );
        }

        //! You are not allowed to request a leave if you don't have any miss time
        if (personnelAttendance.miss === '00:00:00') {
          throw new CustomError(
            HttpStatus.BAD_REQUEST,
            CustomMessages.FORBIDDEN,
          );
        }

        let entriesExits = [];
        entriesExits.push(personnelAttendance.entryTime);
        entriesExits.push(personnelAttendance.exitTime);
        if (personnelAttendance.entriesExits !== '') {
          let tempEntriesExits = personnelAttendance.entriesExits.split(',');
          tempEntriesExits.shift();
          entriesExits = entriesExits.concat(tempEntriesExits);
        }

        //#region faghat baraye hesab kardan flexible exit time
        let entryTime: string;
        /**
              *! if your time is before your workingTimeRegulation, it will be counted as study time
              */
        entryTime = personnelAttendance.entryTime; //! keep entry time in a variable for sometimes you attend in the office before your regulation
        if (
          !compareTimes(
            JSON.parse(JSON.stringify(personnelAttendance)).entryTime,
            JSON.parse(JSON.stringify(personnelAttendance)).workingTimeRegulation
              .entryTime,
          )
        ) {
          if (
            !compareTimes(
              JSON.parse(JSON.stringify(personnelAttendance)).exitTime,
              JSON.parse(JSON.stringify(personnelAttendance))
                .workingTimeRegulation.entryTime,
            )
          ) {
            personnelAttendance.studyingDuration = addTwoTimeStrings(
              personnelAttendance.studyingDuration,
              calculateTimeDifference(
                JSON.parse(JSON.stringify(personnelAttendance)).entryTime,
                JSON.parse(JSON.stringify(personnelAttendance)).exitTime,
              ),
            );
            personnelAttendance.status = PERSONNEL_ATTENDANCE_STATUS.COMPLETED;
            return await personnelAttendance.save();
          } else if (
            !compareTimes(
              JSON.parse(JSON.stringify(personnelAttendance))
                .workingTimeRegulation.entryTime,
              JSON.parse(JSON.stringify(personnelAttendance)).exitTime,
            )
          ) {
            personnelAttendance.studyingDuration = addTwoTimeStrings(
              personnelAttendance.studyingDuration,
              calculateTimeDifference(
                JSON.parse(JSON.stringify(personnelAttendance)).entryTime,
                JSON.parse(JSON.stringify(personnelAttendance))
                  .workingTimeRegulation.entryTime,
              ),
            );
            entryTime = JSON.parse(JSON.stringify(personnelAttendance))
              .workingTimeRegulation.entryTime;
          }
        }
        /**
       *! Calculate miss time
       */

        let totalMissTime = '00:00:00';

        let definiteEntryTime = JSON.parse(JSON.stringify(personnelAttendance))
          .workingTimeRegulation.entryTime;
        let flexibleDefiniteEntryTime = addTwoTimeStrings(
          definiteEntryTime,
          JSON.parse(JSON.stringify(personnelAttendance)).workingTimeRegulation
            .flexible,
        );
        let missTime;
        if (compareTimes(entryTime, flexibleDefiniteEntryTime)) {
          missTime = calculateTimeDifference(
            flexibleDefiniteEntryTime,
            entryTime,
          );
          totalMissTime = addTwoTimeStrings(totalMissTime, missTime);
        }
        let definiteExitTime = JSON.parse(JSON.stringify(personnelAttendance))
          .workingTimeRegulation.exitTime;
        let definiteDuration = calculateTimeDifference(
          definiteEntryTime,
          definiteExitTime,
        );
        let flexibleExitTime: string, legalExtraTime: string;
        if (compareTimes(totalMissTime, '00:00:00')) {
          flexibleExitTime = addTwoTimeStrings(
            definiteExitTime,
            JSON.parse(JSON.stringify(personnelAttendance)).workingTimeRegulation
              .flexible,
          );
        } else {
          flexibleExitTime = addTwoTimeStrings(entryTime, definiteDuration);
        }
        //#endregion

        //! You are not allowed to record a leave request before you flexible entry time, also after your flexible exit time
        if (
          compareTimes(
            flexibleDefiniteEntryTime,
            createPersonnelRequestDto.timeFrom,
          ) ||
          compareTimes(createPersonnelRequestDto.timeTo, flexibleExitTime)
        ) {
          throw new CustomError(HttpStatus.CONFLICT, CustomMessages.FORBIDDEN);
        }

        let wasInOffice = checkOfficePresence(
          entriesExits,
          createPersonnelRequestDto.timeFrom,
          createPersonnelRequestDto.timeTo,
        );

        //! You are not allowed to record a leave in the time when you where in the office
        if (wasInOffice) {
          throw new CustomError(HttpStatus.CONFLICT, CustomMessages.FORBIDDEN);
        }

        let userRequests = await this.findWithOutPagination({
          dateFrom: createPersonnelRequestDto.dateFrom,
          userId: user.id,
          status: { $ne: PERSONNEL_REQUEST_STATUS.REJECTED },
        });
        let enterTimes = [],
          exitTimes = [];
        for (let request of userRequests) {
          enterTimes.push(request.timeFrom);
          exitTimes.push(request.timeTo);
        }

        //! You are not allowed record request with overlap
        if (
          this.checkRequestOverlap(
            enterTimes,
            exitTimes,
            createPersonnelRequestDto.timeFrom,
            createPersonnelRequestDto.timeTo,
          )
        ) {
          throw new CustomError(HttpStatus.CONFLICT, CustomMessages.FORBIDDEN);
        }

        if (
          !wasInOffice ||
          (createPersonnelRequestDto.timeFrom >=
            entriesExits[entriesExits.length - 1] &&
            createPersonnelRequestDto.timeTo <= flexibleExitTime)
        ) {
          return await this.personnelRequestRepositoryImpl.create({
            ...createPersonnelRequestDto,
            status: PERSONNEL_REQUEST_STATUS.WAITING_CONFIRMATION,
            userId: user.id,
            type: PERSONNEL_REQUEST_TYPE.HOURLY_LEAVE,
          });
        }

        break;
      }

      case PERSONNEL_REQUEST_TYPE.DAILY_MISSION: {
        /**
         * morakhasi roozane
         * baraye roozi ke asan nabayad biay sar kar va ghanun barat tarif nashode nemituni morakhasi roozane bezani
         * baraye roozike vorud khoruj zadi nemituni morakhasi roozane bezani
         */
        let datesBetween = getDatesBetween(
          createPersonnelRequestDto.dateFrom,
          createPersonnelRequestDto.dateTo,
        );

        let personnelAttendance =
          await this.personnelAttendanceService.findWithOutPagination({
            userId: user.id,
            date: {
              $gte: createPersonnelRequestDto.dateFrom,
              $lte: createPersonnelRequestDto.dateTo,
            },
          });

        if (personnelAttendance.length !== datesBetween.length) {
          throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.NOT_FOUND);
        }

        for (let i = 0; i < personnelAttendance.length; i++) {
          if (personnelAttendance[i].entryTime) {
            throw new CustomError(
              HttpStatus.FORBIDDEN,
              CustomMessages.FORBIDDEN,
            );
          }
        }
        return await this.personnelRequestRepositoryImpl.create({
          ...createPersonnelRequestDto,
          userId: user.id,
          status: PERSONNEL_REQUEST_STATUS.WAITING_CONFIRMATION,
          type: PERSONNEL_REQUEST_TYPE.DAILY_MISSION,
        });
        break;
      }

      case PERSONNEL_REQUEST_TYPE.HOURLY_MISSION: {
        let personnelAttendance = await this.personnelAttendanceService.findOne(
          { date: createPersonnelRequestDto.dateFrom, userId: user.id },
          null,
          'workingTimeRegulation',
        );

        //! You are not allowed to record a mission while you are working or you haven't attend at office yet
        if (
          personnelAttendance.status === PERSONNEL_ATTENDANCE_STATUS.WORKING ||
          personnelAttendance.status === PERSONNEL_ATTENDANCE_STATUS.ABSENCE
        ) {
          throw new CustomError(
            HttpStatus.BAD_REQUEST,
            CustomMessages.FORBIDDEN,
          );
        }

        let entriesExits = [];
        entriesExits.push(personnelAttendance.entryTime);
        entriesExits.push(personnelAttendance.exitTime);
        if (personnelAttendance.entriesExits !== '') {
          let tempEntriesExits = personnelAttendance.entriesExits.split(',');
          tempEntriesExits.shift();
          entriesExits = entriesExits.concat(tempEntriesExits);
        }

        let wasInOffice = checkOfficePresence(
          entriesExits,
          createPersonnelRequestDto.timeFrom,
          createPersonnelRequestDto.timeTo,
        );

        //! You are not allowed to record a mission in the time when you where in the office
        if (wasInOffice) {
          throw new CustomError(HttpStatus.CONFLICT, CustomMessages.FORBIDDEN);
        }

        let userRequests = await this.findWithOutPagination({
          dateFrom: createPersonnelRequestDto.dateFrom,
          userId: user.id,
          status: { $ne: PERSONNEL_REQUEST_STATUS.REJECTED },
        });
        let enterTimes = [],
          exitTimes = [];
        for (let request of userRequests) {
          enterTimes.push(request.timeFrom);
          exitTimes.push(request.timeTo);
        }

        //! You are not allowed record request with overlap
        if (
          this.checkRequestOverlap(
            enterTimes,
            exitTimes,
            createPersonnelRequestDto.timeFrom,
            createPersonnelRequestDto.timeTo,
          )
        ) {
          throw new CustomError(HttpStatus.CONFLICT, CustomMessages.FORBIDDEN);
        }

        if (!wasInOffice) {
          return await this.personnelRequestRepositoryImpl.create({
            ...createPersonnelRequestDto,
            status: PERSONNEL_REQUEST_STATUS.WAITING_CONFIRMATION,
            userId: user.id,
            type: PERSONNEL_REQUEST_TYPE.HOURLY_MISSION,
          });
        }
        break;
      }

      case PERSONNEL_REQUEST_TYPE.EXTRA: {
        return await this.personnelRequestRepositoryImpl.create({
          dateFrom: createPersonnelRequestDto.dateFrom,
          dateTo: createPersonnelRequestDto.dateTo,
          timeFrom: createPersonnelRequestDto.timeFrom,
          timeTo: createPersonnelRequestDto.timeTo,
          userId: user.id,
          status: PERSONNEL_REQUEST_STATUS.WAITING_CONFIRMATION,
          type: PERSONNEL_REQUEST_TYPE.EXTRA,
        });
        break;
      }
    }

    // let personnelAttendance=await this.personnelAttendanceService.findOne();
    // return this.personnelRequestRepositoryImpl.create({ ...createPersonnelRequestDto, userId: user.id })
  }

  async updateMissTimeHourly(user: ActiveUserData, date: string) {
    let personnelLeaveRequests = await this.findWithOutPagination({
      dateFrom: date,
      dateTo: date,
      userId: user.id,
      type: PERSONNEL_REQUEST_TYPE.HOURLY_LEAVE,
      status: PERSONNEL_REQUEST_STATUS.WAITING_CONFIRMATION,
    });
    let totalHourlyLeave = '00:00:00';
    if (personnelLeaveRequests.length > 0) {
      for (let i = 0; i < personnelLeaveRequests.length; i++) {
        let hourlyLeaveDuration = calculateTimeDifference(
          personnelLeaveRequests[i].timeFrom,
          personnelLeaveRequests[i].timeTo,
        );
        totalHourlyLeave = addTwoTimeStrings(
          hourlyLeaveDuration,
          totalHourlyLeave,
        );
        personnelLeaveRequests[i].status = PERSONNEL_REQUEST_STATUS.CONFIRMED;
      }
    }
    let personnelAttendance = await this.personnelAttendanceService.findOne({
      date,
      userId: user.id,
    });

    personnelAttendance.miss = subtractDurations(
      personnelAttendance.miss,
      totalHourlyLeave,
    );
    personnelAttendance.duration = addTwoTimeStrings(totalHourlyLeave, personnelAttendance.duration)
    return await personnelAttendance.save();
  }

  //superior person in organization have to carry out request (accept - reject - ...)
  async confirmOrRejectPersonnelRequests(
    confirmOrRejectPersonnelRequestsDto: ConfirmOrRejectPersonnelRequestsDto,
  ) {
    await this.updateMany(
      {
        _id: { $in: confirmOrRejectPersonnelRequestsDto.personnelRequestIds },
        status: PERSONNEL_REQUEST_STATUS.WAITING_CONFIRMATION,
      },
      { status: confirmOrRejectPersonnelRequestsDto.status },
    );

    let personnelRequests = await this.findWithOutPagination({
      _id: { $in: confirmOrRejectPersonnelRequestsDto.personnelRequestIds },
    });

    if (
      confirmOrRejectPersonnelRequestsDto.status ===
      PERSONNEL_REQUEST_STATUS.CONFIRMED
    ) {
      await this.updateMissTimesAfterConfirmation(
        confirmOrRejectPersonnelRequestsDto.personnelRequestIds,
      );
      await this.updateExtraTimesAfterConfirmation(
        confirmOrRejectPersonnelRequestsDto.personnelRequestIds,
      );
    }
  }

  //after request confirmation personnel miss times have to be get update
  async updateMissTimesAfterConfirmation(personnelRequestIds: string[]) {
    let requests =
      await this.personnelRequestRepositoryImpl.findWithOutPagination({
        _id: { $in: personnelRequestIds },
        $or: [
          { type: PERSONNEL_REQUEST_TYPE.DAILY_LEAVE },
          { type: PERSONNEL_REQUEST_TYPE.HOURLY_LEAVE },
          { type: PERSONNEL_REQUEST_TYPE.DAILY_MISSION },
          { type: PERSONNEL_REQUEST_TYPE.HOURLY_MISSION },
        ],
        status: PERSONNEL_REQUEST_STATUS.CONFIRMED,
      });
    let personnelAttendancesToUpdate = [];
    let requestsToUpdate = [];
    if (requests.length > 0) {
      let dailyLeaveRequestsDates = [],
        hourlyLeaveRequestsTotalTime: { [key: string]: any } = {},
        hourlyDates = [],
        userId: any,
        hourlyMissionRequestsTotalTime: { [key: string]: any } = {},
        hourlyMissionsDates = [],
        dailyMissionRequestsDates = [];
      for (let i = 0; i < requests.length; i++) {
        userId = requests[i].userId;
        if (requests[i].type === PERSONNEL_REQUEST_TYPE.DAILY_LEAVE) {
          dailyLeaveRequestsDates = getDatesBetween(
            requests[i].dateFrom,
            requests[i].dateTo,
          );
        } else if (requests[i].type === PERSONNEL_REQUEST_TYPE.HOURLY_LEAVE) {
          if (
            hourlyLeaveRequestsTotalTime[requests[i].dateFrom] === undefined
          ) {
            hourlyLeaveRequestsTotalTime[requests[i].dateFrom] = '00:00:00';
          }
          hourlyDates.push(requests[i].dateFrom);
          hourlyLeaveRequestsTotalTime[requests[i].dateFrom] =
            addTwoTimeStrings(
              hourlyLeaveRequestsTotalTime[requests[i].dateFrom],
              calculateTimeDifference(requests[i].timeFrom, requests[i].timeTo),
            );
        } else if (requests[i].type === PERSONNEL_REQUEST_TYPE.DAILY_MISSION) {
          dailyMissionRequestsDates = getDatesBetween(
            requests[i].dateFrom,
            requests[i].dateTo,
          );
        } else if (requests[i].type === PERSONNEL_REQUEST_TYPE.HOURLY_MISSION) {
          if (
            hourlyMissionRequestsTotalTime[requests[i].dateFrom] === undefined
          ) {
            hourlyMissionRequestsTotalTime[requests[i].dateFrom] = '00:00:00';
          }
          hourlyMissionsDates.push(requests[i].dateFrom);
          hourlyMissionRequestsTotalTime[requests[i].dateFrom] =
            addTwoTimeStrings(
              hourlyMissionRequestsTotalTime[requests[i].dateFrom],
              calculateTimeDifference(requests[i].timeFrom, requests[i].timeTo),
            );
        }
        requests[i].status = PERSONNEL_REQUEST_STATUS.COUNTED;
        requestsToUpdate.push(requests[i].save());
      }

      let personnelAttendances: PersonnelAttendanceDocument[];
      // await this.personnelAttendanceService.updateMany({ date: { $in: dailyLeaveRequestsDates }, userId }, { miss: "00:00:00", status: PERSONNEL_ATTENDANCE_STATUS.COMPLETED })

      //! Update personnel attendances that have Daily leave
      personnelAttendances =
        await this.personnelAttendanceService.findWithOutPagination(
          { date: { $in: dailyLeaveRequestsDates }, userId },
          'workingTimeRegulation',
        );
      for (let i = 0; i < personnelAttendances.length; i++) {
        personnelAttendances[i].miss = '00:00:00';
        personnelAttendances[i].status = PERSONNEL_ATTENDANCE_STATUS.COMPLETED;

        if (JSON.parse(JSON.stringify(personnelAttendances[i]))
          .workingTimeRegulation.entryTime) {
          personnelAttendances[i].duration = calculateTimeDifference(
            JSON.parse(JSON.stringify(personnelAttendances[i]))
              .workingTimeRegulation.entryTime,
            JSON.parse(JSON.stringify(personnelAttendances[i]))
              .workingTimeRegulation.exitTime,
          );
        }
        personnelAttendancesToUpdate.push(personnelAttendances[i].save());
      }

      //! Update personnel attendances that have Daily mission
      personnelAttendances =
        await this.personnelAttendanceService.findWithOutPagination(
          { date: { $in: dailyMissionRequestsDates }, userId },
          'workingTimeRegulation',
        );
      for (let i = 0; i < personnelAttendances.length; i++) {
        personnelAttendances[i].miss = '00:00:00';
        personnelAttendances[i].status = PERSONNEL_ATTENDANCE_STATUS.COMPLETED;
        if (JSON.parse(JSON.stringify(personnelAttendances[i]))
          .workingTimeRegulation.entryTime) {
          personnelAttendances[i].missionDuration = calculateTimeDifference(
            JSON.parse(JSON.stringify(personnelAttendances[i]))
              .workingTimeRegulation.entryTime,
            JSON.parse(JSON.stringify(personnelAttendances[i]))
              .workingTimeRegulation.exitTIme,
          );
        }
        personnelAttendancesToUpdate.push(personnelAttendances[i].save());
      }

      //! Update personnel attendances that have hourly leave
      personnelAttendances =
        await this.personnelAttendanceService.findWithOutPagination({
          date: { $in: hourlyDates },
          userId,
        });
      for (let i = 0; i < personnelAttendances.length; i++) {
        personnelAttendances[i].miss = subtractDurations(
          personnelAttendances[i].miss,
          hourlyLeaveRequestsTotalTime[personnelAttendances[i].date],
        );
        personnelAttendancesToUpdate.push(personnelAttendances[i].save());
      }

      //! Update personnel attendances that have hourly mission
      personnelAttendances =
        await this.personnelAttendanceService.findWithOutPagination({
          date: { $in: hourlyMissionsDates },
          userId,
        });
      for (let i = 0; i < personnelAttendances.length; i++) {
        personnelAttendances[i].miss = subtractDurations(
          personnelAttendances[i].miss,
          hourlyMissionRequestsTotalTime[personnelAttendances[i].date],
        );
        personnelAttendances[i].missionDuration =
          hourlyMissionRequestsTotalTime[personnelAttendances[i].date];
        personnelAttendancesToUpdate.push(personnelAttendances[i].save());
      }
    }
    return await Promise.all(
      personnelAttendancesToUpdate.concat(requestsToUpdate),
    );
  }

  // checking overlaps between requests
  checkRequestOverlap(
    enterTimes: string[],
    exitTimes: string[],
    timeFrom: string,
    timeTo: string,
  ) {
    for (let i = 0; i < enterTimes.length; i++) {
      if (
        (compareTimes(timeFrom, enterTimes[i]) || timeFrom === enterTimes[i]) &&
        (compareTimes(exitTimes[i], timeTo) || exitTimes[i] === timeTo)
      )
        return true;
    }
    return false;
  }

  async deleteRequest(user: ActiveUserData, requestId: string): Promise<any> {
    let request = await this.personnelRequestRepositoryImpl.findOne({
      _id: requestId,
      userId: user.id,
    });

    if (!request) {
      throw new CustomError(HttpStatus.NOT_FOUND, CustomMessages.NOT_FOUND);
    }
    if (request.status !== PERSONNEL_REQUEST_STATUS.WAITING_CONFIRMATION) {
      throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.FORBIDDEN);
    }
    return request.deleteOne();
  }

  async updateExtraTimesAfterConfirmation(personnelRequestIds: string[]) {
    let requests =
      await this.personnelRequestRepositoryImpl.findWithOutPagination({
        _id: { $in: personnelRequestIds },
        type: PERSONNEL_REQUEST_TYPE.EXTRA,
        status: PERSONNEL_REQUEST_STATUS.CONFIRMED,
      });
    let personnelAttendance: PersonnelAttendanceDocument;
    let personnelAttendanceToUpdate: Promise<PersonnelAttendanceDocument>[] =
      [];
    let personnelRequestsToUpdate: Promise<PersonnelRequestDocument>[] = [];
    for (let i = 0; i < requests?.length; i++) {
      personnelAttendance = await this.personnelAttendanceService.findOne({
        date: requests[i].dateFrom,
        userId: requests[i].userId,
      });
      if (personnelAttendance) {
        personnelAttendance.extra = addTwoTimeStrings(
          personnelAttendance.extra,
          calculateTimeDifference(requests[i].timeFrom, requests[i].timeTo),
        );
        personnelAttendanceToUpdate.push(personnelAttendance.save());
        requests[i].status = PERSONNEL_REQUEST_STATUS.COUNTED;
        personnelRequestsToUpdate.push(requests[i].save());
      }
    }
    await Promise.all(personnelRequestsToUpdate);
    return await Promise.all(personnelAttendanceToUpdate);
  }

}
