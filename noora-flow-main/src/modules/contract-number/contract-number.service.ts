import { Injectable, OnModuleInit } from '@nestjs/common';
import { ContractNumberRepositoryImpl } from './repository/contract-number.repository';
import { ContractNumberDocument } from './schemas/contract-number.schema';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { IndicatorService } from '../indicator/indicator.service';
import { CreateContractNumberDto } from './dto/create-contract-number.dto';
import { BuyerCodeRepositoryImpl } from './repository/buyer-code.repository';
import * as moment from 'moment-jalaali';

@Injectable()
export class ContractNumberService
  extends CrudService<ContractNumberDocument>
  implements OnModuleInit
{
  constructor(
    private contractNumberRepositoryImpl: ContractNumberRepositoryImpl,
    private buyerCodeRepositoryImpl: BuyerCodeRepositoryImpl,
    private indicatorService: IndicatorService,
  ) {
    super(contractNumberRepositoryImpl);
  }
  async onModuleInit() {
    const buyerIndicatorExists = await this.indicatorService.findOne({
      where: { key: 'BuyerCode' },
    });

    if (!buyerIndicatorExists) {
      await this.indicatorService.create({
        title: 'شماره خریدار',
        counter: 1000,
        format: '${counter}',
        key: 'BuyerCode',
      });
    }
  }

  async createCN(createContractNumberDto: any) {
    let buyerCode = await this.buyerCodeRepositoryImpl.findOneAndUpdate(
      { buyerId: createContractNumberDto.buyerId },
      {
        $inc: { counter: 1 },
      },
    );
    if (!buyerCode) {
      const code = await this.indicatorService.findByKeyAndIncrement(
        'BuyerCode',
      );
      buyerCode = await this.buyerCodeRepositoryImpl.create({
        code,
        buyerId: createContractNumberDto.buyerId,
      });
    }
    const cn = `${moment().format('jYY')}-${buyerCode.code}-${
      buyerCode.counter
    }`;
    return this.create({
      ...createContractNumberDto,
      cn,
    });
  }

  async getContractNo(contractId: string) {
    const contractnumber = await this.findById(contractId);
    if (!contractnumber) return null;

    return contractnumber.cn;
  }
}
