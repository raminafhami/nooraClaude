import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

// A file uploaded as the answer to a FILE-type question of one occurrence.
// The answer value itself only stores [{ id, name }]; this record holds the
// storage details and is what every download endpoint authorizes against.
@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      delete ret.path;
      delete ret.directory;
      return ret;
    },
  },
})
export class FormAnswerFile extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'FormOccurrence',
    required: true,
  })
  public occurrenceId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public userId: string;

  @Prop({ type: String, required: true })
  public questionId: string;

  @Prop({ type: String, required: true })
  public originalName: string;

  @Prop({ type: String, required: true })
  public mimetype: string;

  @Prop({ type: Number, required: true })
  public size: number;

  @Prop({ type: String, required: true })
  public path: string;

  @Prop({ type: String, required: true })
  public directory: string;
}

export type FormAnswerFileDocument = FormAnswerFile & Document;
export const FormAnswerFileSchema = SchemaFactory.createForClass(FormAnswerFile);
FormAnswerFileSchema.index({ occurrenceId: 1, questionId: 1 });
