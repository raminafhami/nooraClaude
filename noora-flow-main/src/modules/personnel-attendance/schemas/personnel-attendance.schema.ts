import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Date, Document, HydratedDocument, ObjectId, Schema as mSchema } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { WorkingTimeRegulation } from 'src/modules/working-time-regulations/schemas/working-time-regulation.schema';

export enum PERSONNEL_ATTENDANCE_STATUS {
    COMPLETED = 'completed',
    ABANDONED = 'abandoned',
    REJECTED = 'rejected',
    PROGRESSING = 'progressing',
    ABSENCE = 'absence',
    WORKING = 'working'
}

@Schema({
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class PersonnelAttendance extends Document {
    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    date: string

    @Prop({
        type: mSchema.Types.ObjectId,
        ref: "User",
        required: true
    })
    userId: string


    @Prop({
        validate: {
            validator: function (value: string) {
                // Use the regex to validate the time format
                return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
            },
            message: props => `${props.value} is not a valid time format (hh:mm:ss)`,
        },
    })
    entryTime: string;

    @Prop({
        validate: {
            validator: function (value: string) {
                // Use the regex to validate the time format
                return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
            },
            message: props => `${props.value} is not a valid time format (hh:mm:ss)`,
        },
    })
    exitTime: string

    @Prop({ type: mSchema.Types.ObjectId, ref: "WorkingTimeRegulation" })
    @IsOptional()
    workingTimeRegulationId?: string

    @Prop({
        validate: {
            validator: function (value: string) {
                // Use the regex to validate the time format
                return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
            },
            message: props => `${props.value} is not a valid time format (hh:mm:ss)`,
        },
        default: "00:00:00",
        required: true
    })
    extra: string

    @Prop({
        validate: {
            validator: function (value: string) {
                // Use the regex to validate the time format
                return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
            },
            message: props => `${props.value} is not a valid time format (hh:mm:ss)`,
        },
        default: "00:00:00",
        required: true
    })
    miss: string

    @Prop({
        validate: {
            validator: function (value: string) {
                // Use the regex to validate the time format
                return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
            },
            message: props => `${props.value} is not a valid time format (hh:mm:ss)`,
        },
        default: "00:00:00",
        required: true
    })
    duration: string

    @Prop({
        validate: {
            validator: function (value: string) {
                // Use the regex to validate the time format
                return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
            },
            message: props => `${props.value} is not a valid time format (hh:mm:ss)`,
        },
        default: "00:00:00",
        required: false
    })
    missionDuration: string

    @Prop({
        validate: {
            validator: function (value: string) {
                // Use the regex to validate the time format
                return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
            },
            message: props => `${props.value} is not a valid time format (hh:mm:ss)`,
        },
        default: "00:00:00",
        required: false
    })
    studyingDuration: string

    @Prop({
        type: Boolean,
        default: false
    })
    isHoliday: boolean

    @Prop({
        type: String,
        default: ''
    })
    @IsOptional()
    entriesExits?: string

    @Prop({
        type: String,
        default: PERSONNEL_ATTENDANCE_STATUS.ABSENCE,
        validate: {
            validator: function (value) {
                return Object.values(PERSONNEL_ATTENDANCE_STATUS).includes(value);
            },
            message: props => `${props.value} is not a valid attendance type`,
        },
    })
    public status: string

}

export type PersonnelAttendanceDocument = PersonnelAttendance & Document;

export const PersonnelAttendanceSchema = SchemaFactory.createForClass(PersonnelAttendance);

PersonnelAttendanceSchema.virtual('workingTimeRegulation', {
    ref: "WorkingTimeRegulation",
    localField: 'workingTimeRegulationId',
    foreignField: '_id',
    justOne: true,
});

PersonnelAttendanceSchema.virtual('user', {
    ref: "User",
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});


