import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { FormCategoryDocument } from './schemas/form-category.schema';
import { FormCategoryRepositoryImpl } from './repository/form-category.repository';
import { FormRepositoryImpl } from './repository/form.repository';

// Default categories from spec section 5.2. Seeded once, flagged isSystem so
// they can't be deleted by accident, while admins remain free to add more.
const DEFAULT_CATEGORIES = [
  'بازرسی',
  'منابع انسانی',
  'اجرایی',
  'تضمین کیفیت',
  'تولید',
  'نگهداری و تعمیرات',
  'اداری',
  'سایر',
];

@Injectable()
export class FormCategoryService
  extends CrudService<FormCategoryDocument>
  implements OnModuleInit
{
  constructor(
    private readonly formCategoryRepositoryImpl: FormCategoryRepositoryImpl,
    private readonly formRepositoryImpl: FormRepositoryImpl,
  ) {
    super(formCategoryRepositoryImpl);
  }

  async onModuleInit() {
    for (const title of DEFAULT_CATEGORIES) {
      const exists = await this.formCategoryRepositoryImpl.findOne({ title });
      if (!exists) {
        await this.formCategoryRepositoryImpl.create({
          title,
          isSystem: true,
        });
      }
    }
  }

  async removeCategory(id: string) {
    const category = await this.formCategoryRepositoryImpl.findById(id);
    if (!category) {
      throw new BadRequestException('دسته‌بندی مورد نظر یافت نشد.');
    }
    if (category.isSystem) {
      throw new BadRequestException(
        'دسته‌بندی‌های پیش‌فرض سامانه قابل حذف نیستند.',
      );
    }
    const inUse = await this.formRepositoryImpl.model.exists({
      categoryId: id,
    });
    if (inUse) {
      throw new BadRequestException(
        'این دسته‌بندی به فرم‌های موجود تخصیص داده شده و قابل حذف نیست.',
      );
    }
    return this.deleteById(id);
  }
}
