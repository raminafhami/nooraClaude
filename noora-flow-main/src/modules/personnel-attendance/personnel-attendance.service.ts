/* eslint-disable prefer-const */
import {
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CreatePersonnelAttendanceDto } from './dto/create-personnel-attendance.dto';
import { UpdatePersonnelAttendanceDto } from './dto/update-personnel-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PERSONNEL_ATTENDANCE_STATUS,
  PersonnelAttendance,
  PersonnelAttendanceDocument,
} from './schemas/personnel-attendance.schema';
import { PersonnelAttendanceRepositoryImpl } from './repository/personnel-attendance.repository';
import { PersonnelService } from '../personnel/personnel.service';
import { GetQueryDto } from '../process-instances/dtos';
import {
  gregorianToJalaali,
  isJalaaliHoliday,
  calculateTimeDifference,
  addTwoTimeStrings,
  compareTimes,
  checkOfficePresence,
} from 'src/common/providers/moment-date';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { PersonnelAttendanceReportDto } from './dto/personnel-attendance-report.dto';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { CreatePersonnelScheduleDto } from './dto/create-personnel-schedule.dto';
import { PersonnelRequestService } from '../personnel-request/personnel-request.service';
import { ManualTimeDto } from './dto/manual-time.dto';
import CustomError from 'src/common/providers/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import CustomResponse from 'src/common/providers/custom-response.service';
import {
  PERSONNEL_REQUEST_STATUS,
  PERSONNEL_REQUEST_TYPE,
} from '../personnel-request/schemas/personnel-request.schema';
import { UpdateWholeTimesDto } from './dto/update-whole-times.dto';

@Injectable()
export class PersonnelAttendanceService extends CrudService<PersonnelAttendanceDocument> {
  constructor(
    @InjectModel('PersonnelAttendance')
    personnelAttendanceModel: Model<PersonnelAttendance>,
    private readonly personnelAttendanceRepositoryImpl: PersonnelAttendanceRepositoryImpl,
    private readonly personnelService: PersonnelService,
    cronJobService: CronJobService,
    @Inject(forwardRef(() => PersonnelRequestService))
    private personnelRequestService: PersonnelRequestService, // private readonly personnelRequestService: PersonnelRequestService
  ) {
    super(personnelAttendanceRepositoryImpl);
    cronJobService.startJob(
      '59 23 * * *',
      this.closingBooks.bind(this),
      'Asia/Tehran',
    );
  }

  //For record personnel's entries or exits
  async recordEntryOrExit(
    createPersonnelAttendanceDto: CreatePersonnelAttendanceDto,
    metaData: any,
  ) {
    let { activeUser } = metaData;
    let { date } = metaData;
    const today = new Date();
    let entryTime: string;

    // Extract only the date part (year, month, day)
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are zero-based, so add 1
    const day = today.getDate();
    const currentDate = `${year}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;

    let personnelAttendances: any;
    /**
     *! if date is valid so request is executed by system to update
     */

    if (date) {
      personnelAttendances = await this.findOne(
        { userId: activeUser.id, date },
        null,
        'workingTimeRegulation',
      );
    } else {
      personnelAttendances = await this.findOne(
        { userId: activeUser.id, date: currentDate },
        null,
        'workingTimeRegulation',
      );
    }

    /**
     *! if you are not supposed to attend in office but you did so system creates a record for your attendance but without regulation
     */
    if (!personnelAttendances) {
      personnelAttendances =
        await this.personnelAttendanceRepositoryImpl.create({
          userId: activeUser.id,
          date: currentDate,
          isHoliday: isJalaaliHoliday(currentDate),
        });
    }

    if (!JSON.parse(JSON.stringify(personnelAttendances)).entryTime) {
      //this is your first enter to the office
      personnelAttendances.entryTime = createPersonnelAttendanceDto.time;
      personnelAttendances.status = PERSONNEL_ATTENDANCE_STATUS.WORKING;
      return await personnelAttendances.save();
    } else if (!JSON.parse(JSON.stringify(personnelAttendances)).exitTime) {
      //! this is your first exit from the office
      personnelAttendances.exitTime = createPersonnelAttendanceDto.time;
      await personnelAttendances.save();

      //! if personnel attendance record doesn't have any regulation so the system can calculate nothing
      if (!personnelAttendances.workingTimeRegulation) {
        personnelAttendances.miss = '00:00:00';
        personnelAttendances.extra = '00:00:00';
        personnelAttendances.duration = '00:00:00';
        personnelAttendances.missionDuration = '00:00:00';
        personnelAttendances.studyingDuration = '00:00:00';
        personnelAttendances.status = PERSONNEL_REQUEST_STATUS.REJECTED;
        return personnelAttendances.save();
      }

      /**
       *! if your time is before your workingTimeRegulation, it will be counted as study time
       */
      entryTime = personnelAttendances.entryTime; //! keep entry time in a variable for sometimes you attend in the office before your regulation
      if (
        !compareTimes(
          JSON.parse(JSON.stringify(personnelAttendances)).entryTime,
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .entryTime,
        )
      ) {
        if (
          !compareTimes(
            JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
            JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime,
          )
        ) {
          personnelAttendances.studyingDuration = addTwoTimeStrings(
            personnelAttendances.studyingDuration,
            calculateTimeDifference(
              JSON.parse(JSON.stringify(personnelAttendances)).entryTime,
              JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
            ),
          );
          personnelAttendances.status = PERSONNEL_ATTENDANCE_STATUS.COMPLETED;
          return await personnelAttendances.save();
        } else if (
          !compareTimes(
            JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime,
            JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
          )
        ) {
          personnelAttendances.studyingDuration = addTwoTimeStrings(
            personnelAttendances.studyingDuration,
            calculateTimeDifference(
              JSON.parse(JSON.stringify(personnelAttendances)).entryTime,
              JSON.parse(JSON.stringify(personnelAttendances))
                .workingTimeRegulation.entryTime,
            ),
          );
          entryTime = JSON.parse(JSON.stringify(personnelAttendances))
            .workingTimeRegulation.entryTime;
        }
      }

      /**
       *! Calculate miss time
       */

      let totalMissTime = '00:00:00';

      let definiteEntryTime = JSON.parse(JSON.stringify(personnelAttendances))
        .workingTimeRegulation.entryTime;
      let flexibleDefiniteEntryTime = addTwoTimeStrings(
        definiteEntryTime,
        JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
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
      let definiteExitTime = JSON.parse(JSON.stringify(personnelAttendances))
        .workingTimeRegulation.exitTime;
      let definiteDuration = calculateTimeDifference(
        definiteEntryTime,
        definiteExitTime,
      );
      let flexibleExitTime: string, legalExtraTime: string;
      if (compareTimes(totalMissTime, '00:00:00')) {
        flexibleExitTime = addTwoTimeStrings(
          definiteExitTime,
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .flexible,
        );
      } else {
        flexibleExitTime = addTwoTimeStrings(entryTime, definiteDuration);
      }
      legalExtraTime = addTwoTimeStrings(
        JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
          .legalExtra,
        flexibleExitTime,
      );
      if (compareTimes(entryTime, flexibleExitTime)) {
        if (compareTimes(entryTime, legalExtraTime)) {
          //darkhast ezafe kar bezan
          await this.personnelRequestService.createRequest(
            {
              dateFrom: personnelAttendances.date,
              dateTo: personnelAttendances.date,
              timeFrom: entryTime,
              timeTo: personnelAttendances.exitTime,
              entitlement: true,
              type: PERSONNEL_REQUEST_TYPE.EXTRA,
            },
            activeUser,
          );
        } else {
          if (compareTimes(legalExtraTime, personnelAttendances.exitTime)) {
            personnelAttendances.extra = calculateTimeDifference(
              entryTime,
              personnelAttendances.exitTime,
            );
          } else {
            personnelAttendances.extra = calculateTimeDifference(
              entryTime,
              legalExtraTime,
            );
            //darkhast ezafe kar bezan az legal ta khoruj
            await this.personnelRequestService.createRequest(
              {
                dateFrom: personnelAttendances.date,
                dateTo: personnelAttendances.date,
                timeFrom: legalExtraTime,
                timeTo: personnelAttendances.exitTime,
                entitlement: true,
                type: PERSONNEL_REQUEST_TYPE.EXTRA,
              },
              activeUser,
            );
          }
        }
        return personnelAttendances.save();
      }
      if (compareTimes(flexibleExitTime, personnelAttendances.exitTime)) {
        missTime = calculateTimeDifference(
          personnelAttendances.exitTime,
          flexibleExitTime,
        );
        totalMissTime = addTwoTimeStrings(totalMissTime, missTime);
      }
      personnelAttendances.miss = totalMissTime;
      await personnelAttendances.save();
      let duration = calculateTimeDifference(
        entryTime,
        JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
      );
      personnelAttendances.duration = duration;

      /**
       * Calculate extra
       */
      let extra = '00:00:00';
      if (
        compareTimes(
          JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
          flexibleExitTime,
        )
      ) {
        if (
          compareTimes(
            legalExtraTime,
            JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
          )
        ) {
          extra = calculateTimeDifference(
            flexibleExitTime,
            JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
          );
        } else {
          extra = calculateTimeDifference(flexibleExitTime, legalExtraTime);

          //ye request ezafe kar az legal ta exit
          await this.personnelRequestService.createRequest(
            {
              dateFrom: personnelAttendances.date,
              dateTo: personnelAttendances.date,
              timeFrom: legalExtraTime,
              timeTo: personnelAttendances.exitTime,
              entitlement: true,
              type: PERSONNEL_REQUEST_TYPE.EXTRA,
            },
            activeUser,
          );
        }
      }
      personnelAttendances.extra = extra;
      personnelAttendances.status = PERSONNEL_ATTENDANCE_STATUS.COMPLETED;
      return await personnelAttendances.save();
    }

    /**
     * ! This part will execute if employee has more than one entry and exit in day
     */

    personnelAttendances.entriesExits += `,${createPersonnelAttendanceDto.time}`;
    await personnelAttendances.save();

    //! if personnel attendance record doesn't have any regulation so the system can calculate nothing
    if (!personnelAttendances.workingTimeRegulationId) {
      return;
    }
    let entriesExits = personnelAttendances.entriesExits.split(',');
    entriesExits.shift();

    //! everything will calculate when personnel record exit time
    if (entriesExits.length % 2 === 0) {
      personnelAttendances.status = PERSONNEL_ATTENDANCE_STATUS.COMPLETED;
      let totalMissTime = '00:00:00';
      let totalExtraTime = '00:00:00';
      let totalStudyingDuration = '00:00:00';

      /**
       *!  your first enter and exit are before your working regulation
       *!  so we count that as study time
       */

      if (
        !compareTimes(
          JSON.parse(JSON.stringify(personnelAttendances)).entryTime,
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .entryTime,
        ) &&
        JSON.parse(JSON.stringify(personnelAttendances)).entryTime !==
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .entryTime
      ) {
        if (
          !compareTimes(
            JSON.parse(JSON.stringify(personnelAttendances)).exitTIme,
            JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime,
          )
        ) {
          totalStudyingDuration = calculateTimeDifference(
            JSON.parse(JSON.stringify(personnelAttendances)).entryTime,
            JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
          );
        } else if (
          !compareTimes(
            JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime,
            JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
          )
        ) {
          totalStudyingDuration = calculateTimeDifference(
            JSON.parse(JSON.stringify(personnelAttendances)).entryTime,
            JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime,
          );
        }
      }
      let definiteEntryTime = JSON.parse(JSON.stringify(personnelAttendances))
        .workingTimeRegulation.entryTime;
      let flexibleDefiniteEntryTime = addTwoTimeStrings(
        definiteEntryTime,
        JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
          .flexible,
      );
      let missTime;

      let entryTime: string, exitTime: string;

      /**
       *! calculate studying time and find out personnel valid entry time and exit time
       */
      for (let i = 0; i < entriesExits.length; i = i + 2) {
        let enter = entriesExits[i];
        let exit = entriesExits[i + 1];
        if (
          !compareTimes(
            enter,
            JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime,
          )
        ) {
          if (
            !compareTimes(
              exit,
              JSON.parse(JSON.stringify(personnelAttendances))
                .workingTimeRegulation.entryTime,
            )
          ) {
            totalStudyingDuration = addTwoTimeStrings(
              totalStudyingDuration,
              calculateTimeDifference(enter, exit),
            );
            personnelAttendances.status = PERSONNEL_ATTENDANCE_STATUS.COMPLETED;
            entryTime = enter;
            exitTime = exit;
          } else if (
            !compareTimes(
              JSON.parse(JSON.stringify(personnelAttendances))
                .workingTimeRegulation.entryTime,
              exit,
            )
          ) {
            totalStudyingDuration = addTwoTimeStrings(
              totalStudyingDuration,
              calculateTimeDifference(
                enter,
                JSON.parse(JSON.stringify(personnelAttendances))
                  .workingTimeRegulation.entryTime,
              ),
            );
            entryTime = JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime;
            exitTime = exit;
          }
        } else {
          entryTime = enter;
          exitTime = exit;
        }
      }

      personnelAttendances.studyingDuration = totalStudyingDuration;
      await personnelAttendances.save();

      for (let i = 0; i < entriesExits.length; i = i + 2) {
        let enter = entriesExits[i];
        let exit = entriesExits[i + 1];
        if (
          !compareTimes(
            enter,
            JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime,
          )
        ) {
          if (
            !compareTimes(
              exit,
              JSON.parse(JSON.stringify(personnelAttendances))
                .workingTimeRegulation.entryTime,
            )
          ) {
            entriesExits.shift();
            entriesExits.shift();
            i = i - 2;
          } else if (
            !compareTimes(
              JSON.parse(JSON.stringify(personnelAttendances))
                .workingTimeRegulation.entryTime,
              exit,
            )
          ) {
            entriesExits.shift();
            entriesExits.unshift(
              JSON.parse(JSON.stringify(personnelAttendances))
                .workingTimeRegulation.entryTime,
            );
          }
        }
      }

      if (entriesExits.length === 0) {
        return;
      } else {
        entryTime = entriesExits[0];
        exitTime = entriesExits[1];
      }
      if (
        compareTimes(
          JSON.parse(JSON.stringify(personnelAttendances)).entryTime,
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .entryTime,
        ) ||
        JSON.parse(JSON.stringify(personnelAttendances)).entryTime ===
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .entryTime
      ) {
        entryTime = JSON.parse(JSON.stringify(personnelAttendances)).entryTime;
        exitTime = JSON.parse(JSON.stringify(personnelAttendances)).exitTime;
      } else {
        if (
          compareTimes(
            JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
            JSON.parse(JSON.stringify(personnelAttendances))
              .workingTimeRegulation.entryTime,
          )
        ) {
          entryTime = JSON.parse(JSON.stringify(personnelAttendances))
            .workingTimeRegulation.entryTime;
          exitTime = JSON.parse(JSON.stringify(personnelAttendances)).exitTime;
        }
      }
      if (compareTimes(entryTime, flexibleDefiniteEntryTime)) {
        missTime = calculateTimeDifference(
          flexibleDefiniteEntryTime,
          entryTime,
        );
        totalMissTime = addTwoTimeStrings(totalMissTime, missTime);
      }

      let lastExit: string, lastEnter: string;
      let totalDuration = '00:00:00';

      if (
        compareTimes(
          JSON.parse(JSON.stringify(personnelAttendances)).entryTime,
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .entryTime,
        ) ||
        JSON.parse(JSON.stringify(personnelAttendances)).entryTime ===
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .entryTime
      ) {
        totalDuration = addTwoTimeStrings(
          totalDuration,
          calculateTimeDifference(entryTime, exitTime),
        );
      }
      let definiteExitTime = JSON.parse(JSON.stringify(personnelAttendances))
        .workingTimeRegulation.exitTime;
      let definiteDuration = calculateTimeDifference(
        definiteEntryTime,
        definiteExitTime,
      );
      let flexibleExitTime;
      if (compareTimes(totalMissTime, '00:00:00')) {
        flexibleExitTime = addTwoTimeStrings(
          definiteExitTime,
          JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
            .flexible,
        );
      } else {
        flexibleExitTime = addTwoTimeStrings(entryTime, definiteDuration);
      }
      let legalExtraTime = addTwoTimeStrings(
        flexibleExitTime,
        JSON.parse(JSON.stringify(personnelAttendances)).workingTimeRegulation
          .legalExtra,
      );

      for (let i = 0; i < entriesExits.length; i = i + 2) {
        let lastEnter = entriesExits[i];
        let previousExit = entriesExits[i - 1];
        lastExit = entriesExits[i + 1];
        if (!previousExit) {
          previousExit = exitTime;
        }
        //#region in ghesmat dar tarikh 14 jan ezafe shode bana bar moshkel saeed ke ezafe kari dorost hesab nemishod va mitune baes injad bug beshe
        if (
          compareTimes(
            JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
            flexibleExitTime,
          )
        ) {
          if (
            compareTimes(
              legalExtraTime,
              JSON.parse(JSON.stringify(personnelAttendances)).exitTime,
            )
          ) {
            totalExtraTime = calculateTimeDifference(
              flexibleExitTime,
              previousExit,
            );
          } else {
            totalExtraTime = calculateTimeDifference(
              flexibleExitTime,
              legalExtraTime,
            );

            //ye request ezafe kar az legal ta exit
            await this.personnelRequestService.createRequest(
              {
                dateFrom: personnelAttendances.date,
                dateTo: personnelAttendances.date,
                timeFrom: legalExtraTime,
                timeTo: previousExit,
                entitlement: true,
                type: PERSONNEL_REQUEST_TYPE.EXTRA,
              },
              activeUser,
            );
          }
        }
        //#endregion
        if (compareTimes(lastEnter, flexibleExitTime)) {
          if (compareTimes(legalExtraTime, lastEnter)) {
            if (compareTimes(legalExtraTime, lastExit)) {
              totalExtraTime = addTwoTimeStrings(
                totalExtraTime,
                calculateTimeDifference(lastEnter, lastExit),
              );
            } else {
              totalExtraTime = addTwoTimeStrings(
                totalExtraTime,
                calculateTimeDifference(lastEnter, legalExtraTime),
              );
              //request ezafe kari bezan az legal ta khoruj
              await this.personnelRequestService.createRequest(
                {
                  dateFrom: personnelAttendances.date,
                  dateTo: personnelAttendances.date,
                  timeFrom: legalExtraTime,
                  timeTo: lastExit,
                  entitlement: true,
                  type: PERSONNEL_REQUEST_TYPE.EXTRA,
                },
                activeUser,
              );
            }
          } else {
            //request ezafe kari bezan az last enter ta last exit
            await this.personnelRequestService.createRequest(
              {
                dateFrom: personnelAttendances.date,
                dateTo: personnelAttendances.date,
                timeFrom: lastEnter,
                timeTo: lastExit,
                entitlement: true,
                type: PERSONNEL_REQUEST_TYPE.EXTRA,
              },
              activeUser,
            );
          }

          totalDuration = addTwoTimeStrings(
            totalDuration,
            calculateTimeDifference(lastEnter, lastExit),
          );
          continue;
        }
        if (compareTimes(lastExit, flexibleExitTime)) {
          if (compareTimes(lastExit, legalExtraTime)) {
            totalExtraTime = addTwoTimeStrings(
              totalExtraTime,
              calculateTimeDifference(flexibleExitTime, legalExtraTime),
            );
            //request ezafe kar bezan az legal ta exit
            await this.personnelRequestService.createRequest(
              {
                dateFrom: personnelAttendances.date,
                dateTo: personnelAttendances.date,
                timeFrom: legalExtraTime,
                timeTo: lastExit,
                entitlement: true,
                type: PERSONNEL_REQUEST_TYPE.EXTRA,
              },
              activeUser,
            );
          } else {
            totalExtraTime = addTwoTimeStrings(
              totalExtraTime,
              calculateTimeDifference(flexibleExitTime, lastExit),
            );
          }
        }
        if (compareTimes(lastEnter, previousExit)) {
          totalMissTime = addTwoTimeStrings(
            totalMissTime,
            calculateTimeDifference(previousExit, lastEnter),
          );
        }

        totalDuration = addTwoTimeStrings(
          totalDuration,
          calculateTimeDifference(lastEnter, lastExit),
        );
      }

      if (compareTimes(flexibleExitTime, lastExit)) {
        missTime = calculateTimeDifference(lastExit, flexibleExitTime);
        totalMissTime = addTwoTimeStrings(totalMissTime, missTime);
      }
      personnelAttendances.miss = totalMissTime;
      personnelAttendances.duration = totalDuration;

      personnelAttendances.extra = totalExtraTime;
      return await personnelAttendances.save();
    } else {
      personnelAttendances.status = PERSONNEL_ATTENDANCE_STATUS.WORKING;
      return await personnelAttendances.save();
    }
  }

  //this should execute at the start of day
  async createDailyRecord(query: GetQueryDto) {
    let personnel = await this.personnelService.findWithOutPagination(
      {},
      'workingTimeRegulation',
    );

    let personnelDailyAttendance = [];
    const today = new Date();

    // Extract only the date part (year, month, day)
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are zero-based, so add 1
    const day = today.getDate();
    let dayOfWeekNumber = today.getDay();

    // Format the date as a string (YYYY-MM-DD)
    const currentDate = `${year}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;
    let jalaliDate = gregorianToJalaali(currentDate);
    let isHoliday =
      isJalaaliHoliday(jalaliDate) ||
      dayOfWeekNumber == 5 ||
      dayOfWeekNumber == 4;

    if (personnel.length > 0) {
      for (let person of personnel) {
        person = JSON.parse(JSON.stringify(person));
        personnelDailyAttendance.push({
          date: currentDate,
          userId: person.userId,
          entry: null,
          exit: null,
          workingTimeRegulationId: person.workingTimeRegulationId,
          isHoliday,
        });
      }
    }
    return await this.personnelAttendanceRepositoryImpl.create(
      personnelDailyAttendance,
    );
  }

  //provide a full report of personnel attendances in details
  async getReport(
    personnelAttendanceReportDto: PersonnelAttendanceReportDto,
    user: ActiveUserData,
  ) {
    personnelAttendanceReportDto.populate = 'workingTimeRegulation';

    let userAttendances = await this.personnelAttendanceRepositoryImpl.find(
      {
        date: {
          $gte: personnelAttendanceReportDto.dateFrom,
          $lte: personnelAttendanceReportDto.dateTo,
        },
        userId: user.id,
      },
      null,
      personnelAttendanceReportDto.page,
      personnelAttendanceReportDto.size,
      personnelAttendanceReportDto.sort,
      personnelAttendanceReportDto.populate,
    );
    let totalExtra = '00:00:00';
    let totalMiss = '00:00:00';
    let totalDuration = '00:00:00';
    if (userAttendances) {
      for (let i = 0; i < userAttendances.length; i++) {
        totalExtra = addTwoTimeStrings(totalExtra, userAttendances[i].extra);
        totalMiss = addTwoTimeStrings(totalMiss, userAttendances[i].miss);
        totalDuration = addTwoTimeStrings(
          totalDuration,
          userAttendances[i].duration,
        );
      }
    }
    return { data: userAttendances, totalMiss, totalExtra, totalDuration };
  }

  //provide a general report about personnel total times
  async personnelGeneralReport(
    personnelAttendanceReportDto: PersonnelAttendanceReportDto,
  ) {
    personnelAttendanceReportDto.populate = 'user';
    let result: { [key: string]: any } = {};

    let userAttendances = await this.personnelAttendanceRepositoryImpl.find(
      {
        date: {
          $gte: personnelAttendanceReportDto.dateFrom,
          $lte: personnelAttendanceReportDto.dateTo,
        },
      },
      null,
      personnelAttendanceReportDto.page,
      personnelAttendanceReportDto.size,
      personnelAttendanceReportDto.sort,
      personnelAttendanceReportDto.populate,
    );

    for (let i = 0; i < userAttendances.length; i++) {
      // Initialize result[userId] as an object if it doesn't exist
      if (!result[userAttendances[i].userId]) {
        result[userAttendances[i].userId] = {
          totalExtra: '00:00:00',
          totalMiss: '00:00:00',
          totalDuration: '00:00:00',
          name: '',
          lastname: '',
        };
      }
      result[userAttendances[i].userId].totalExtra = addTwoTimeStrings(
        result[userAttendances[i].userId].totalExtra,
        userAttendances[i].extra,
      );
      result[userAttendances[i].userId].totalMiss = addTwoTimeStrings(
        result[userAttendances[i].userId].totalMiss,
        userAttendances[i].miss,
      );
      result[userAttendances[i].userId].totalDuration = addTwoTimeStrings(
        result[userAttendances[i].userId].totalDuration,
        userAttendances[i].duration,
      );
      result[userAttendances[i].userId].name = JSON.parse(
        JSON.stringify(userAttendances[i]),
      ).user.name;
      result[userAttendances[i].userId].lastname = JSON.parse(
        JSON.stringify(userAttendances[i]),
      ).user.lastname;
    }
    return result;
  }

  // prepare each personnel plan to attendance with assigning working time regulation
  async createPersonnelSchedule(
    createPersonnelScheduleDto: CreatePersonnelScheduleDto,
  ) {
    let { dates, workingTimeRegulationId, userIds } =
      createPersonnelScheduleDto;
    let personnelAttendances = [];
    let personnelAttendancesIdsToUpdate = [];
    let personnelAttendanceToReCalculate = [];

    if (dates.length > 0 && userIds.length > 0) {
      for (let i = 0; i < dates.length; i++) {
        let existedPersonnelAttendances = await this.findWithOutPagination({
          date: dates[i],
        });
        for (let j = 0; j < userIds.length; j++) {
          let personnelAttendanceExists = existedPersonnelAttendances.find(
            (pa) => {
              return pa.userId.toString() === userIds[j];
            },
          );
          if (personnelAttendanceExists) {
            personnelAttendanceExists.workingTimeRegulationId =
              createPersonnelScheduleDto.workingTimeRegulationId;
            personnelAttendancesIdsToUpdate.push(personnelAttendanceExists._id);
            if (personnelAttendanceExists.exitTime) {
              personnelAttendanceToReCalculate.push(personnelAttendanceExists);
            }
          } else {
            personnelAttendances.push({
              date: dates[i],
              entry: null,
              exit: null,
              workingTimeRegulationId,
              isHoliday: isJalaaliHoliday(dates[i]),
              userId: userIds[j],
            });
          }
        }
      }
    }

    await this.updateMany(
      { _id: { $in: personnelAttendancesIdsToUpdate } },
      { workingTimeRegulationId },
    );

    await this.recalculate(personnelAttendanceToReCalculate);
    return await this.personnelAttendanceRepositoryImpl.create(
      personnelAttendances,
    );
  }

  // get a specific day report
  async getPersonnelAttendanceByDate(date: string, user: ActiveUserData) {
    return super.findOne(
      { date, userId: user.id },
      null,
      'workingTimeRegulation',
    );
  }

  // recalculate personnel attendance if you change working time regulation
  async recalculate(
    personnelAttendances: PersonnelAttendanceDocument[],
  ): Promise<any> {
    let times = [];

    for (let i = 0; i < personnelAttendances.length; i++) {
      times = [];
      times.push(personnelAttendances[i].entryTime);
      times.push(personnelAttendances[i].exitTime);
      let tempEntriesExits = personnelAttendances[i].entriesExits.split(',');
      tempEntriesExits.shift();
      times.push(...tempEntriesExits);
      await this.updateById(personnelAttendances[i]._id, {
        entriesExits: '',
        missionDuration: '00:00:00',
        extra: '00:00:00',
        miss: '00:00:00',
        duration: '00:00:00',
        $unset: { entryTime: 1, exitTime: 1 },
      });

      for (let j = 0; j < times.length; j++) {
        let temp = await this.recordEntryOrExit(
          { time: times[j] },
          {
            activeUser: { id: personnelAttendances[i].userId },
            date: personnelAttendances[i].date,
          },
        );
      }
    }
  }

  //carry out today's attendances at the end of the day
  async closingBooks(): Promise<any> {
    const today = new Date();

    // Extract only the date part (year, month, day)
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are zero-based, so add 1
    const day = today.getDate();
    const currentDate = `${year}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;
    let personnelAttendances =
      await this.personnelAttendanceRepositoryImpl.findWithOutPagination(
        { date: currentDate },
        'workingTimeRegulation',
      );
    for (let i = 0; i < personnelAttendances.length; i++) {
      let personnelRequest = await this.personnelRequestService.findOne({
        userId: personnelAttendances[i].userId,
        date: personnelAttendances[i].date,
        $or: [
          { type: PERSONNEL_REQUEST_TYPE.DAILY_MISSION },
          { type: PERSONNEL_REQUEST_TYPE.DAILY_LEAVE },
        ],
      });
      if (
        !JSON.parse(JSON.stringify(personnelAttendances[i]))
          ?.workingTimeRegulation?.entryTime
      ) {
        personnelAttendances[i].status = PERSONNEL_ATTENDANCE_STATUS.REJECTED;
      } else if (
        personnelAttendances[i].status === PERSONNEL_ATTENDANCE_STATUS.WORKING
      ) {
        personnelAttendances[i].status = PERSONNEL_ATTENDANCE_STATUS.ABANDONED;
        personnelAttendances[i].miss = calculateTimeDifference(
          JSON.parse(JSON.stringify(personnelAttendances[i]))
            .workingTimeRegulation.entryTime,
          JSON.parse(JSON.stringify(personnelAttendances[i]))
            .workingTimeRegulation.exitTime,
        );
      } else if (
        personnelAttendances[i].status === PERSONNEL_ATTENDANCE_STATUS.ABSENCE
      ) {
        personnelAttendances[i].miss = calculateTimeDifference(
          JSON.parse(JSON.stringify(personnelAttendances[i]))
            .workingTimeRegulation.entryTime,
          JSON.parse(JSON.stringify(personnelAttendances[i]))
            .workingTimeRegulation.exitTime,
        );
      } else if (personnelAttendances[i].miss === '00:00:00') {
        personnelAttendances[i].status = PERSONNEL_ATTENDANCE_STATUS.COMPLETED;
      }
      await personnelAttendances[i].save();
    }
  }

  //personnel can record their time manually instead of using recognition device
  async manualTime(
    manualTimeDto: ManualTimeDto,
    user: ActiveUserData,
  ): Promise<CustomError | CustomResponse> {
    // Create a new Date object with the current time in Tehran.
    const date = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran' }),
    );
    let currentDate = date.toISOString().split('T')[0];

    if (
      manualTimeDto.entryTime >= manualTimeDto.exitTime ||
      manualTimeDto.date > currentDate
    ) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST);
    }

    let personnelAttendance =
      await this.personnelAttendanceRepositoryImpl.findOne({
        userId: user.id,
        date: manualTimeDto.date,
      });

    if (!personnelAttendance) {
      throw new CustomError(HttpStatus.NOT_FOUND, CustomMessages.NOT_FOUND);
    }
    let personnel = await this.personnelService.findOne({ userId: user.id });
    if (personnel.maxManualTime > 0) {
      personnel.maxManualTime = parseInt(personnel.maxManualTime) - 1;

      let personnelRequests =
        await this.personnelRequestService.findWithOutPagination({
          dateFrom: { $lte: manualTimeDto.date },
          dateTo: { $gte: manualTimeDto.date },
          userId: user.id,
        });

      let hourlyRequests = [],
        dailyRequests = [],
        entryTimes = [],
        exitTimes = [];
      for (let i = 0; i < personnelRequests.length; i++) {
        if (
          personnelRequests[i].type === PERSONNEL_REQUEST_TYPE.DAILY_LEAVE ||
          personnelRequests[i].type === PERSONNEL_REQUEST_TYPE.DAILY_MISSION
        ) {
          dailyRequests.push(personnelRequests[i]);
        } else if (
          personnelRequests[i].type === PERSONNEL_REQUEST_TYPE.HOURLY_LEAVE ||
          personnelRequests[i].type === PERSONNEL_REQUEST_TYPE.HOURLY_MISSION
        ) {
          hourlyRequests.push(personnelRequests[i]);
          entryTimes.push(personnelRequests[i].timeFrom);
          exitTimes.push(personnelRequests[i].timeTo);
        }
      }

      if (dailyRequests.length > 0) {
        throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.FORBIDDEN);
      }
      let checkRequestOverlap =
        this.personnelRequestService.checkRequestOverlap(
          entryTimes,
          exitTimes,
          manualTimeDto.entryTime,
          manualTimeDto.exitTime,
        );

      if (checkRequestOverlap) {
        throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.FORBIDDEN);
      }
      if (personnelAttendance.status === PERSONNEL_ATTENDANCE_STATUS.WORKING) {
        throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.FORBIDDEN);
      }
      if (!personnelAttendance.entryTime || !personnelAttendance.exitTime) {
        await this.recordEntryOrExit(
          { time: manualTimeDto.entryTime },
          { activeUser: user, date: manualTimeDto.date },
        );
        await personnel.save();
        return await this.recordEntryOrExit(
          { time: manualTimeDto.exitTime },
          { activeUser: user, date: manualTimeDto.date },
        );
      }

      let allEntriesExits = [];
      allEntriesExits.push(personnelAttendance.entryTime);
      allEntriesExits.push(personnelAttendance.exitTime);
      let entriesExits = personnelAttendance.entriesExits.split(',');
      entriesExits.shift();
      allEntriesExits = allEntriesExits.concat(entriesExits);
      let officePresence = checkOfficePresence(
        allEntriesExits,
        manualTimeDto.entryTime,
        manualTimeDto.exitTime,
      );
      if (officePresence) {
        throw new CustomError(HttpStatus.CONFLICT, CustomMessages.FORBIDDEN);
      }
      allEntriesExits.push(manualTimeDto.entryTime);
      allEntriesExits.push(manualTimeDto.exitTime);
      allEntriesExits.sort();
      await this.updateById(personnelAttendance._id, {
        entriesExits: '',
        missionDuration: '00:00:00',
        extra: '00:00:00',
        miss: '00:00:00',
        duration: '00:00:00',
        $unset: { entryTime: 1, exitTime: 1 },
      });
      for (let i = 0; i < allEntriesExits.length; i++) {
        await this.recordEntryOrExit(
          { time: allEntriesExits[i] },
          { activeUser: user, date: manualTimeDto.date },
        );
      }
    } else {
      throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.FORBIDDEN);
    }

    return await personnel.save();
  }

  async singleTime(manualTimeDto: ManualTimeDto, user: ActiveUserData) {
    let personnelAttendance = await this.findOne({
      userId: user.id,
      date: manualTimeDto.date,
    });
    let entriesExits: string[] = [];
    if (personnelAttendance) {
      if (personnelAttendance.status !== PERSONNEL_ATTENDANCE_STATUS.WORKING) {
        throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.FORBIDDEN);
      }
      entriesExits.push(personnelAttendance.entryTime);
      if (personnelAttendance.exitTime) {
        entriesExits.push(personnelAttendance.exitTime);
      }
      if (personnelAttendance?.entriesExits?.length > 0) {
        let tempEntriesExits = personnelAttendance.entriesExits.split(',');

        tempEntriesExits.shift();
        entriesExits = entriesExits.concat(tempEntriesExits);
      }
      entriesExits.push(manualTimeDto.singleTime);
      entriesExits.sort();
      await this.updateById(personnelAttendance._id, {
        entriesExits: '',
        missionDuration: '00:00:00',
        extra: '00:00:00',
        miss: '00:00:00',
        duration: '00:00:00',
        $unset: { entryTime: 1, exitTime: 1 },
      });
      let personnel = await this.personnelService.findOne({ userId: user.id });

      personnel.maxManualTime = personnel.maxManualTime - 1;

      await personnel.save();
      for (let i = 0; i < entriesExits.length; i++) {
        await this.recordEntryOrExit(
          { time: entriesExits[i] },
          { activeUser: user },
        );
      }
    }
    return personnelAttendance;
  }

  async updateWholeTimes(
    updateWholeTimesDto: UpdateWholeTimesDto,
  ): Promise<any> {
    let splittedTimes = updateWholeTimesDto.times.split(',');
    splittedTimes.sort();
    let personnelAttendance = await this.findOne({
      userId: updateWholeTimesDto.userId,
      date: updateWholeTimesDto.date,
    });
    let result = await this.updateById(personnelAttendance._id, {
      entriesExits: '',
      missionDuration: '00:00:00',
      extra: '00:00:00',
      miss: '00:00:00',
      duration: '00:00:00',
      status: PERSONNEL_ATTENDANCE_STATUS.ABSENCE,
      $unset: { entryTime: 1, exitTime: 1 },
    });
    for (let i = 0; i < splittedTimes.length; i++) {
      await this.recordEntryOrExit(
        { time: splittedTimes[i] },
        {
          date: updateWholeTimesDto.date,
          activeUser: { id: updateWholeTimesDto.userId },
        },
      );
    }
    return result;
  }
}
