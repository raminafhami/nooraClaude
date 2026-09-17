import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { CategoryDocument } from './entity/category.schema';
import { CategoryRepositoryImpl } from './repository/category.repository.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService extends CrudService<CategoryDocument> {
  constructor(private readonly categoryRepositoryImpl: CategoryRepositoryImpl) {
    super(categoryRepositoryImpl);
  }

  async categorySoftDelete(categoryId: string) {
    const category = await this.categoryRepositoryImpl.findById(categoryId);

    if (!category) {
      throw new NotFoundException('category not found');
    }

    const deletedCategory = await this.categoryRepositoryImpl.updateById(
      categoryId,
      {
        isDeleted: true,
      },
    );
    if (!category.parentId) {
      const deletedSubcategories = await this.categoryRepositoryImpl.updateMany(
        { parentId: categoryId },
        { isDeleted: true },
      );
      return {
        deletedCategory,
        deletedSubcategories,
      };
    }
    return deletedCategory;
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoryRepositoryImpl.findById(categoryId);

    if (!category) {
      throw new NotFoundException('category not found');
    }

    if (updateCategoryDto.parentId) {
      const subCategories =
        await this.categoryRepositoryImpl.findWithOutPagination({
          parentId: categoryId,
        });
      if (subCategories) {
        throw new BadRequestException(
          'you cannot make this category as a child',
        );
      }
    }
    return this.categoryRepositoryImpl.updateById(
      categoryId,
      updateCategoryDto,
    );
  }
}
