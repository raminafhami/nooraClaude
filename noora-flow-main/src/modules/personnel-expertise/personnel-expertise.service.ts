import { Injectable } from '@nestjs/common';
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
}
