import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { PersonnelExpertiseRepositoryImpl } from './repository/personnel-expertise.repository';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { PersonnelExpertiseDocument } from './schemas/personnel-expertise.schema';
import { PersonnelCertificateRepositoryImpl } from './repository/personnel-certificate.repository';

@Injectable()
export class PersonnelExpertiseService extends CrudService<PersonnelExpertiseDocument> {
  constructor(
    private personnelExpertiseRepositoryImpl: PersonnelExpertiseRepositoryImpl,
    private personnelCertificateRepositoryImpl: PersonnelCertificateRepositoryImpl,
  ) {
    super(personnelExpertiseRepositoryImpl);
  }

  async findByUserId(userId: string) {
    return this.personnelExpertiseRepositoryImpl.model
      .find({ userId })
      .select('_id status data expertiseId')
      .populate('expertiseId', 'name')
      .exec();
  }

  async filterUserIdsByExpertiseId(expertiseId: string) {
    const data = await this.personnelExpertiseRepositoryImpl.model
      .find({ expertiseId })
      .select('userId')
      .exec();
    return data.map((d) => d.userId);
  }
  async bulkCreate(data: any) {
    return this.personnelExpertiseRepositoryImpl.bulkCreate(data, true);
  }
  async bulkUpdate(data: any, modify: any) {
    return this.personnelExpertiseRepositoryImpl.bulkUpdate(data, modify);
  }

  async findByUserAndExpertise(userId: string, expertiseIds: string[]) {
    return this.personnelExpertiseRepositoryImpl.model.find({
      userId,
      expertiseId: { $in: expertiseIds },
    });
  }

  async saveFile(data: any) {
    return this.personnelCertificateRepositoryImpl.create(data);
  }

  async updateCertificateFile(id: string, data: any) {
    return this.personnelCertificateRepositoryImpl.updateById(id, data);
  }

  async getCertificate(certificateId: string) {
    return this.personnelCertificateRepositoryImpl.findById(certificateId);
  }

  // Undo an uploaded certificate (e.g. the wrong file): the file and its
  // record go, and the checklist row is back to "unqualified".
  async removeCertificate(id: string, modifyBy: string) {
    const pe = await this.findById(id);
    if (!pe) return null;
    const certificateId = pe.data?.certificateId;
    if (certificateId) {
      const certificate = await this.personnelCertificateRepositoryImpl.findById(
        certificateId,
      );
      if (certificate?.path) {
        try {
          fs.unlinkSync(certificate.path);
        } catch {
          // already gone from disk
        }
      }
      if (certificate) {
        await this.personnelCertificateRepositoryImpl.deleteById(
          String(certificateId),
        );
      }
    }
    return this.findByIdAndUpdate(id, {
      $unset: { 'data.certificateId': 1 },
      status: 'unqualified',
      modifyBy,
      modifyAt: new Date(),
    });
  }

  // The person's certificates (add-job modal or training page) for items their
  // current jobs require (`requiredIds`), newest first, with the training each
  // was uploaded for.
  async findCertificatesByUser(userId: string, requiredIds: Set<string>) {
    const inUse = (
      await this.personnelExpertiseRepositoryImpl.model
        .find({
          userId,
          expertiseId: { $in: [...requiredIds] },
          'data.certificateId': { $exists: true, $ne: null },
        })
        .select('data.certificateId')
        .lean()
    ).map((r: any) => r.data.certificateId);
    const certificates: any[] = await this.personnelCertificateRepositoryImpl.model
      .find({ userId, _id: { $in: inUse } })
      .populate('expertiseId', 'title type')
      .sort({ _id: -1 })
      .lean();
    return certificates.map((c) => ({
      id: String(c._id),
      expertiseId: c.expertiseId?._id ? String(c.expertiseId._id) : null,
      title: c.expertiseId?.title ?? null,
      type: c.expertiseId?.type ?? null,
      organizationName: c.organizationName,
      certificateDate: c.certificateDate,
      mimetype: c.mimetype,
      filename: c.filename,
    }));
  }
}
