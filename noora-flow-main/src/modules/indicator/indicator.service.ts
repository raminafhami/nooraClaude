import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { IndicatorRepositoryImpl } from './repository/indicator.repository';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { IndicatorDocument } from './schemas/indicator.schema';
import { ClientSession } from 'mongoose';

@Injectable()
export class IndicatorService extends CrudService<IndicatorDocument> {
  constructor(private indicatorRepository: IndicatorRepositoryImpl) {
    super(indicatorRepository);
  }

  async findByIdAndIncrement(id: string) {
    const indicator = await this.indicatorRepository.findByIdAndUpdate(id, {
      $inc: { counter: 1 },
    });

    if (!indicator) {
      throw new NotFoundException('indicator not exist');
    }
    return indicator.format.replace('${counter}', indicator.counter - 1);
  }

  async findByKeyAndIncrement(key: string, session?: ClientSession) {
    const indicator = await this.indicatorRepository.findOneAndUpdate(
      { key },
      {
        $inc: { counter: 1 },
      },
      false,
      session,
    );

    if (!indicator) {
      throw new NotFoundException('indicator not exist');
    }
    return indicator.format.replace('${counter}', indicator.counter - 1);
  }
}
