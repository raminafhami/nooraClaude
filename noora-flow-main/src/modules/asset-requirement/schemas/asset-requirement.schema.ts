import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Schema as SchemaTypes,
  Types,
} from 'mongoose';
import { Audit } from 'src/modules/audit/schemas/audit.schema';
import { AssetRequirementFile } from './asset-requirement-file.schema';

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
      return ret;
    },
  },
})
export class AssetRequirement extends Document {
  @Prop({
    type: String,
    required: true,
  })
  questionDescription: string;

  @Prop({
    type: String,
    required: false,
  })
  paraNumber: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  description: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  conflict: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  state: boolean;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: AssetRequirement.name,
    required: false,
  })
  parent: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Audit.name,
    required: true,
  })
  auditId: string;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: AssetRequirement.name }],
    default: [],
  })
  children: string[];

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: AssetRequirement.name }],
    default: [],
  })
  ancestors: string[];

  @Prop({
    type: [
      { type: SchemaTypes.Types.ObjectId, ref: AssetRequirementFile.name },
    ],
    default: [],
  })
  files: string[];
}
export type AssetRequirementDocument = AssetRequirement & Document;

const AssetRequirementSchema = SchemaFactory.createForClass(AssetRequirement);

AssetRequirementSchema.virtual('filesList', {
  ref: AssetRequirementFile.name,
  localField: 'files',
  foreignField: '_id',
  options: { projection: '_id title' },
});

export { AssetRequirementSchema };
