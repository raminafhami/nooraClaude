import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { PropertyStatus, PropertyTypes } from 'src/common/const/enums';
import { User } from 'src/modules/users/schemas/user.schema';
import { PropertyFile } from './property-file.schema';
import { Branch } from 'src/modules/branch/schemas/branch.schema';

class PropertyLocation {
  @Prop({ type: String })
  building: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Branch.name,
  })
  branchId: string;

  @Prop({ type: String })
  floor: string;

  @Prop({ type: String })
  room: string;
}
class PropertyDimension {
  @Prop({ type: Number, required: false })
  length: number;

  @Prop({ type: Number, required: false })
  width: number;

  @Prop({ type: Number, required: false })
  height?: number;
}
class PropertyMovment {
  @Prop({ type: PropertyLocation })
  from: PropertyLocation;

  @Prop({ type: PropertyLocation })
  to: PropertyLocation;

  @Prop({ type: Date })
  date: Date;
}

class PropertyAssignmentHistory {
  @Prop({ type: SchemaTypes.Types.ObjectId, ref: User.name })
  userId: string;

  @Prop({ type: String })
  action: 'ASSIGN' | 'UNASSIGN';

  @Prop({ type: Date })
  date: Date;
}

class PropertyRepairHistory {
  @Prop({ type: String, enum: PropertyTypes })
  type: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number })
  cost: number;

  @Prop({ type: Date })
  date: Date;
}

@Schema({
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      return ret;
    },
  },
})
class PropertyMaintenanceHistory {
  _id: SchemaTypes.Types.ObjectId;

  @Prop({ type: String })
  technician: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Date })
  date: Date;

  @Prop({ type: Number })
  cost: number;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;
}

class PropertyDecommissionDetails {
  @Prop({ type: String })
  method: string;

  @Prop({ type: String })
  reason: string;

  @Prop({ type: Date })
  date: Date;

  @Prop({ type: Number })
  scrapValue: number;
}

@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.filesList) {
        ret.files = ret.filesList;
        delete ret.filesList;
      }
      if (ret?.assignmentHistoryUsers) {
        ret.assignmentHistory.forEach((h, index) => {
          h.userId = ret.assignmentHistoryUsers[index];
        });
        delete ret.assignmentHistoryUsers;
      }
      if (ret?.locationBranch) {
        ret.location.branchId = ret.locationBranch;
        delete ret.locationBranch;
      }

      if (ret?.movementHistoryBranchTo) {
        ret.movementHistory.forEach((h, index) => {
          if (h?.to) {
            h.to.branchId = ret.movementHistoryBranchTo[index];
          }
        });
        delete ret.movementHistoryBranchTo;
      }

      if (ret?.movementHistoryBranchFrom) {
        ret.movementHistory.forEach((h, index) => {
          if (h?.from) {
            h.from.branchId = ret.movementHistoryBranchFrom[index];
          }
        });
        delete ret.movementHistoryBranchFrom;
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.filesList) {
        ret.files = ret.filesList;
        delete ret.filesList;
      }
      if (ret?.assignmentHistoryUsers) {
        ret.assignmentHistory.forEach((h, index) => {
          h.userId = ret.assignmentHistoryUsers[index];
        });
        delete ret.assignmentHistoryUsers;
      }

      if (ret?.locationBranch) {
        ret.location.branchId = ret.locationBranch;
        delete ret.locationBranch;
      }

      if (ret?.movementHistoryBranchTo) {
        ret.movementHistory.forEach((h, index) => {
          if (h?.to) {
            h.to.branchId = ret.movementHistoryBranchTo[index];
          }
        });
        delete ret.movementHistoryBranchTo;
      }

      if (ret?.movementHistoryBranchFrom) {
        ret.movementHistory.forEach((h, index) => {
          if (h?.from) {
            h.from.branchId = ret.movementHistoryBranchFrom[index];
          }
        });
        delete ret.movementHistoryBranchFrom;
      }
      return ret;
    },
  },
})
export class Property extends Document {
  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  propertyNo: string;

  @Prop({ type: String })
  model: string;

  @Prop({ type: String })
  manufacturer: string;

  @Prop({ type: String, unique: true })
  serialNumber: string;

  @Prop({ type: PropertyDimension, required: false })
  dimensions: PropertyDimension;

  @Prop({ type: Number })
  weight: number;

  @Prop({ type: String })
  color: string;

  @Prop({ type: Date, required: false })
  purchaseDate: Date;

  @Prop({ type: Number, required: false })
  purchasePrice: number;

  @Prop({ type: Number })
  currentValue: number;

  @Prop({ type: Number })
  depreciationRate: number;

  @Prop({ type: PropertyLocation, required: true })
  location: PropertyLocation;

  @Prop([PropertyMovment])
  movementHistory: PropertyMovment[];

  @Prop({ type: Date })
  warrantyStart: Date;

  @Prop({ type: Date })
  warrantyEnd: Date;

  @Prop({ type: String })
  insurancePolicyNumber: string;

  @Prop({ type: String })
  insuranceCompany: string;

  @Prop({ type: String })
  supplierName: string;

  @Prop({ type: String })
  technicalSpecifications: string;

  @Prop({ type: Date })
  calibrationDate: Date;

  @Prop({ type: Date })
  nextCalibrationDate: Date;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    default: null,
  })
  assignedUser: string;

  @Prop([PropertyAssignmentHistory])
  assignmentHistory: PropertyAssignmentHistory[];

  @Prop({
    type: String,
    enum: PropertyStatus,
    default: PropertyStatus.ACTIVE,
  })
  status: PropertyStatus;

  @Prop([PropertyMaintenanceHistory])
  maintenanceHistory: PropertyMaintenanceHistory[];

  @Prop(PropertyRepairHistory)
  repairHistory: PropertyRepairHistory[];

  @Prop({
    type: PropertyDecommissionDetails,
    default: null,
  })
  decommissionDetails: PropertyDecommissionDetails;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: PropertyFile.name }],
    default: [],
  })
  files: string[];

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy: string;
}
export type PropertyDocument = Property & Document;

export const PropertySchema = SchemaFactory.createForClass(Property);

PropertySchema.pre('save', function (next) {
  if (this.isModified('location')) {
    const prevLocation = (this.$locals.prevLocation ||
      null) as PropertyLocation;
    this.movementHistory.push({
      date: new Date(),
      from: prevLocation,
      to: this.location,
    });
    this.$locals.prevLocation = this.location;
  }
  next();
});

PropertySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  if (update?.location || update?.assignedUser !== undefined) {
    this.model.findOne(this.getQuery()).then((doc: Property) => {
      if (update?.location) {
        const prevLocation = doc.location;
        update.$push = {
          movementHistory: {
            date: new Date(),
            from: prevLocation,
            to: update?.location,
          },
        };
      }
      if (update?.assignedUser !== undefined) {
        const prevAssignedUser = doc.assignedUser?.toString();
        const prevAssignmentHistory = doc?.assignmentHistory || [];

        if (!!prevAssignedUser && prevAssignedUser != update?.assignedUser) {
          prevAssignmentHistory.push({
            date: new Date(),
            userId: prevAssignedUser,
            action: 'UNASSIGN',
          });
        }
        if (!!update.assignedUser) {
          prevAssignmentHistory.push({
            date: new Date(),
            userId: update.assignedUser,
            action: 'ASSIGN',
          });
        }
        update.assignmentHistory = prevAssignmentHistory;
      }
      next();
    });
  } else {
    next();
  }
});

PropertySchema.post('save', function (doc) {
  const lastMaintenance =
    doc.maintenanceHistory[doc.maintenanceHistory.length - 1];

  if (
    lastMaintenance?.endDate &&
    doc.status === PropertyStatus.UNDER_MAINTENANCE
  ) {
    doc.status = PropertyStatus.ACTIVE;
    doc.save();
  }
});

PropertySchema.virtual('filesList', {
  ref: PropertyFile.name,
  localField: 'files',
  foreignField: '_id',
  options: { projection: '_id title' },
});

PropertySchema.virtual('assignmentHistoryUsers', {
  ref: User.name,
  localField: 'assignmentHistory.userId',
  foreignField: '_id',
  options: {
    projection: '_id name lastname username branchId',
  },
});

PropertySchema.virtual('locationBranch', {
  ref: Branch.name,
  localField: 'location.branchId',
  foreignField: '_id',
  justOne: true,
  options: {
    projection: '_id name title',
  },
});

PropertySchema.virtual('movementHistoryBranchTo', {
  ref: Branch.name,
  localField: 'movementHistory.to.branchId',
  foreignField: '_id',
  options: {
    projection: '_id name title',
  },
});

PropertySchema.virtual('movementHistoryBranchFrom', {
  ref: Branch.name,
  localField: 'movementHistory.from.branchId',
  foreignField: '_id',
  options: {
    projection: '_id name title',
  },
});
