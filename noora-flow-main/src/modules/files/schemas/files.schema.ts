import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';

class Access {
  @Prop({ type: [String] })
  groups: string[];

  @Prop({ type: [String] })
  users: string[];
}
@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
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
  versionKey: false,
  timestamps: true,
})
export class File extends Document {
  @Prop({ type: SchemaTypes.Types.ObjectId, required: true })
  processInstanceId: string;

  @Prop({ type: [String], required: true })
  fieldNames: string[];

  @Prop({ type: String, required: true })
  directory: string;

  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;

  @Prop({ type: String, required: true })
  owner: string;

  @Prop({ type: Access, required: false })
  access: Access;
}

export type FileDocument = File & Document;
export const FileSchema = SchemaFactory.createForClass(File);
