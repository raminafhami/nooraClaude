import { Injectable } from '@nestjs/common';
import { IndustryService } from '../industry/industry.service';
import {
  consumerSubIndustries,
  industries,
  productionSubIndustries,
  servicesSubIndustries,
  activityProject,
} from './seeder-data';
import { ProjectService } from '../project/project.service';
import { ProjectType } from 'src/common/const/enums';
import { CategoryService } from '../categories/category.service';
import { InspectionCostsService } from '../inspection-costs/inspection-costs.service';
import { GetQueryWithDownloadDto } from '../process-instances/dtos';
import { ObjectId } from 'mongodb';

@Injectable()
export class SeederService {
  constructor(
    private readonly industryService: IndustryService,
    private readonly projectService: ProjectService,
    private readonly categoryService: CategoryService,
    private readonly inspectionCost: InspectionCostsService,
  ) {}

  async runSeeder() {
    const existIndustry = await this.industryService.findOne({});
    if (!existIndustry) {
      await this.industryService.create(industries);

      await this.industryService.create(productionSubIndustries);

      await this.industryService.create(servicesSubIndustries);

      await this.industryService.create(consumerSubIndustries);
    }

    const findHiddenProject = await this.projectService.findOne({
      type: ProjectType.ACTIVITY,
    });
    if (!findHiddenProject) {
      await this.projectService.create(activityProject);
    }

    const query: GetQueryWithDownloadDto = {
      page: null,
      size: null,
      filters: '',
      dateFilters: '',
      sort: '',
      search: '',
      populate: null,
      props: '',
      projection: '',
    };

    const inspectionCosts = await this.inspectionCost.findAll(query);
    const category = await this.categoryService.findAll(query);

    for (const elem of inspectionCosts.data) {
      const [persianTitle, englishTitle] = elem.title.split(':');

      if (englishTitle === 'misc') {
        if (persianTitle === 'متفرقه') {
          await this.inspectionCost.updateOne(
            { _id: elem._id },
            {
              categoryId: new ObjectId('673f280b996962e12cf4998b'),
              title: 'متفرقه',
            },
          );
        } else {
          const newDescription = persianTitle + ' ' + (elem.description || '');
          await this.inspectionCost.updateOne(
            { _id: elem._id },
            {
              categoryId: new ObjectId('673f280b996962e12cf4998b'),
              title: 'متفرقه',
              description: newDescription,
            },
          );
        }
      } else {
        for (const c of category.data) {
          if (c.title === persianTitle) {
            await this.inspectionCost.updateOne(
              { _id: elem._id },
              { categoryId: new ObjectId(c._id), title: persianTitle },
            );
          }
        }
      }
    }
  }
}
