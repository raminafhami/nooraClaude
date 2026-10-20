import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { IndicatorService } from '../indicator/indicator.service';
import { FormDocument, FormStatus } from './schemas/form.schema';
import {
  CHOICE_QUESTION_TYPES,
  FormVersionStatus,
} from './schemas/form-version.schema';
import { FormRepositoryImpl } from './repository/form.repository';
import { FormVersionRepositoryImpl } from './repository/form-version.repository';
import { FormCategoryRepositoryImpl } from './repository/form-category.repository';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { UpsertFormVersionDto } from './dto/upsert-form-version.dto';
import { FormPdfService } from './form-pdf.service';

const FORM_CODE_INDICATOR_KEY = 'form-code';
// Company prefix first, then form type, then the sequence: APK-FR-001.
const FORM_CODE_PREFIX = 'APK-FR';

@Injectable()
export class FormService
  extends CrudService<FormDocument>
  implements OnModuleInit
{
  constructor(
    private readonly formRepositoryImpl: FormRepositoryImpl,
    private readonly formVersionRepositoryImpl: FormVersionRepositoryImpl,
    private readonly formCategoryRepositoryImpl: FormCategoryRepositoryImpl,
    private readonly indicatorService: IndicatorService,
    private readonly formPdfService: FormPdfService,
  ) {
    super(formRepositoryImpl);
  }

  async onModuleInit() {
    const exists = await this.indicatorService.findOne({
      key: FORM_CODE_INDICATOR_KEY,
    });
    if (!exists) {
      await this.indicatorService.create({
        title: 'کد فرم (فرم‌ساز)',
        counter: 1,
        format: '${counter}',
        key: FORM_CODE_INDICATOR_KEY,
      });
    }
  }

  private async generateFormCode(session?: ClientSession): Promise<string> {
    const counter = await this.indicatorService.findByKeyAndIncrement(
      FORM_CODE_INDICATOR_KEY,
      session,
    );
    return `${FORM_CODE_PREFIX}-${String(counter).padStart(3, '0')}`;
  }

  private validateQuestions(
    questions: UpsertFormVersionDto['questions'],
  ): void {
    const orders = new Set<number>();
    for (const question of questions) {
      if (orders.has(question.order)) {
        throw new BadRequestException('ترتیب سوالات نباید تکراری باشد.');
      }
      orders.add(question.order);

      if (CHOICE_QUESTION_TYPES.includes(question.type as any)) {
        if (!question.settings?.options?.length) {
          throw new BadRequestException(
            `سوال «${question.title}» باید حداقل یک گزینه داشته باشد.`,
          );
        }
      }
    }
  }

  async createForm(
    dto: CreateFormDto,
    userId: string,
    session?: ClientSession,
  ) {
    const category = await this.formCategoryRepositoryImpl.findById(
      dto.categoryId,
    );
    if (!category) {
      throw new BadRequestException('دسته‌بندی انتخاب‌شده معتبر نیست.');
    }

    const code = await this.generateFormCode(session);

    const [form] = await this.formRepositoryImpl.create(
      {
        code,
        title: dto.title,
        categoryId: dto.categoryId,
        description: dto.description ?? null,
        status: FormStatus.DRAFT,
        createdBy: userId,
      },
      session,
    );

    const [version] = await this.formVersionRepositoryImpl.create(
      {
        formId: form.id,
        versionNo: 1,
        status: FormVersionStatus.DRAFT,
        questions: [],
        createdBy: userId,
      },
      session,
    );

    await this.formRepositoryImpl.updateById(
      form.id,
      { draftVersionId: version.id },
      session,
    );

    return this.findFormById(form.id, session);
  }

  async findAllForms(query: GetQueryDto) {
    query.populate =
      query.populate || 'category publishedVersion draftVersion creator';
    return this.findAll(query);
  }

  async findFormById(id: string, session?: ClientSession) {
    const form = await this.formRepositoryImpl.findById(
      id,
      'category publishedVersion draftVersion creator',
      session,
    );
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    return form;
  }

  async updateFormMeta(id: string, dto: UpdateFormDto) {
    const form = await this.formRepositoryImpl.findById(id);
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    if (form.status === FormStatus.ARCHIVED) {
      throw new BadRequestException('فرم بایگانی‌شده قابل ویرایش مشخصات نیست.');
    }
    if (dto.categoryId) {
      const category = await this.formCategoryRepositoryImpl.findById(
        dto.categoryId,
      );
      if (!category) {
        throw new BadRequestException('دسته‌بندی انتخاب‌شده معتبر نیست.');
      }
    }
    await this.formRepositoryImpl.updateById(id, dto);
    return this.findFormById(id);
  }

  private async getDraftVersionOrFail(formId: string) {
    const form = await this.formRepositoryImpl.findById(formId);
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    if (!form.draftVersionId) {
      throw new BadRequestException(
        'این فرم پیش‌نویس باز ندارد؛ برای ویرایش ساختاری ابتدا یک نسخه جدید بسازید.',
      );
    }
    const version = await this.formVersionRepositoryImpl.findById(
      form.draftVersionId,
    );
    if (!version || version.status !== FormVersionStatus.DRAFT) {
      throw new BadRequestException('نسخه پیش‌نویس معتبری یافت نشد.');
    }
    return { form, version };
  }

  async upsertDraftQuestions(formId: string, dto: UpsertFormVersionDto) {
    this.validateQuestions(dto.questions);
    const { version } = await this.getDraftVersionOrFail(formId);

    const sortedQuestions = [...dto.questions].sort(
      (a, b) => a.order - b.order,
    );

    await this.formVersionRepositoryImpl.updateById(version.id, {
      questions: sortedQuestions,
    });
    return this.formVersionRepositoryImpl.findById(version.id);
  }

  async listVersions(formId: string) {
    const form = await this.formRepositoryImpl.findById(formId);
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    return this.formVersionRepositoryImpl.find(
      { formId },
      '_id versionNo status publishedAt createdAt',
      null,
      null,
      { versionNo: -1 },
    );
  }

  async getVersionById(formId: string, versionId: string) {
    const version = await this.formVersionRepositoryImpl.findOne({
      _id: versionId,
      formId,
    });
    if (!version) {
      throw new NotFoundException('نسخه مورد نظر یافت نشد.');
    }
    return version;
  }

  async publishForm(formId: string, userId: string, session?: ClientSession) {
    const form = await this.formRepositoryImpl.findById(formId);
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    if (form.status === FormStatus.ARCHIVED) {
      throw new BadRequestException('فرم بایگانی‌شده قابل انتشار نیست.');
    }
    if (!form.draftVersionId) {
      throw new BadRequestException('این فرم پیش‌نویس بازی برای انتشار ندارد.');
    }
    const draft = await this.formVersionRepositoryImpl.findById(
      form.draftVersionId,
    );
    if (!draft || draft.status !== FormVersionStatus.DRAFT) {
      throw new BadRequestException('نسخه پیش‌نویس معتبری یافت نشد.');
    }
    if (!draft.questions?.length) {
      throw new BadRequestException(
        'برای انتشار، فرم باید حداقل یک سوال داشته باشد.',
      );
    }

    await this.formVersionRepositoryImpl.updateById(
      draft.id,
      {
        status: FormVersionStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      session,
    );

    await this.formRepositoryImpl.updateById(
      formId,
      {
        status: FormStatus.PUBLISHED,
        publishedVersionId: draft.id,
        draftVersionId: null,
      },
      session,
    );

    return this.findFormById(formId, session);
  }

  async createNewDraftVersion(
    formId: string,
    userId: string,
    session?: ClientSession,
  ) {
    const form = await this.formRepositoryImpl.findById(formId);
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    if (form.status !== FormStatus.PUBLISHED) {
      throw new BadRequestException(
        'نسخه جدید فقط برای فرم‌های منتشرشده قابل ایجاد است.',
      );
    }
    if (form.draftVersionId) {
      throw new BadRequestException('این فرم همین الان یک پیش‌نویس باز دارد.');
    }

    const publishedVersion = await this.formVersionRepositoryImpl.findById(
      form.publishedVersionId,
    );
    const siblingVersions = await this.formVersionRepositoryImpl.find(
      { formId },
      'versionNo',
      null,
      null,
      { versionNo: -1 },
    );
    const nextVersionNo = (siblingVersions[0]?.versionNo ?? 0) + 1;

    const [newVersion] = await this.formVersionRepositoryImpl.create(
      {
        formId,
        versionNo: nextVersionNo,
        status: FormVersionStatus.DRAFT,
        questions: publishedVersion?.questions ?? [],
        createdBy: userId,
      },
      session,
    );

    await this.formRepositoryImpl.updateById(
      formId,
      { draftVersionId: newVersion.id },
      session,
    );

    return this.findFormById(formId, session);
  }

  async archiveForm(formId: string, userId: string) {
    const form = await this.formRepositoryImpl.findById(formId);
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    if (form.status === FormStatus.ARCHIVED) {
      return form;
    }
    await this.formRepositoryImpl.updateById(formId, {
      status: FormStatus.ARCHIVED,
      archivedBy: userId,
      archivedAt: new Date(),
    });
    return this.findFormById(formId);
  }

  async generateRawFormPdf(formId: string, preferDraft = false) {
    const form = await this.formRepositoryImpl.findById(formId, 'category');
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    const versionId = preferDraft
      ? form.draftVersionId || form.publishedVersionId
      : form.publishedVersionId || form.draftVersionId;
    if (!versionId) {
      throw new BadRequestException('این فرم هنوز نسخه‌ای ندارد.');
    }
    const version = await this.formVersionRepositoryImpl.findById(versionId);
    if (!version) {
      throw new NotFoundException('نسخه فرم یافت نشد.');
    }

    const buffer = await this.formPdfService.buildRawFormPdf(
      {
        title: form.title,
        code: form.code,
        category: (form as any).category?.title,
        description: form.description,
      },
      version,
    );
    return { buffer, filename: `${form.code}.pdf` };
  }
}
