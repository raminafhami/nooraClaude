import {
  MiddlewareConsumer,
  Module,
  OnModuleInit,
  Post,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AppConfigModule } from './config/app/config.module';
import { MongoConfigModule } from './config/database/mongo/config.module';
import { RedisConfigModule } from './config/database/redis/config.module';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './config/database/mongo/config.service';
import { IamModule } from './modules/iam/iam.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { FilesModule } from './modules/files/files.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ProcessInstancesModule } from './modules/process-instances/process-instances.module';
import { ProcessDefinitionsModule } from './modules/process-definitions/process-definitions.module';
import { PersonnelModule } from './modules/personnel/personnel.module';
import { ExpertiseModule } from './modules/expertise/expertise.module';
import { JobDescriptionModule } from './modules/job-description/job-description.module';
import { PersonnelExpertiseModule } from './modules/personnel-expertise/personnel-expertise.module';
import { UserGroupsModule } from './modules/user-groups/user-groups.module';
import { WorkingTimeRegulationsModule } from './modules/working-time-regulations/working-time-regulations.module';
import { PersonnelAttendanceModule } from './modules/personnel-attendance/personnel-attendance.module';
import { PersonnelRequestModule } from './modules/personnel-request/personnel-request.module';
import { FinancialModule } from './modules/financial/financial.module';
import { AssetRequirementModule } from './modules/asset-requirement/asset-requirement.module';
import { PaymentRuleModule } from './modules/payment-rule/payment-rule.module';
import { ContractModule } from './modules/contract/contract.module';
import { EducationModule } from './modules/education/education.module';
import { FormModule } from './modules/form/form.module';
import { IndicatorModule } from './modules/indicator/indicator.module';
import { IpCheck } from './common/middlewares/ip-check.middleware';
import { PersonnelAttendanceController } from './modules/personnel-attendance/personnel-attendance.controller';
import { ProductModule } from './modules/product/product.module';
import { ProductCategoryModule } from './modules/product-category/product-category.module';
import { AuditModule } from './modules/audit/audit.module';
import { UserFilesModule } from './modules/user-files/user-files.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProjectModule } from './modules/project/project.module';
import { ProjectTaskModule } from './modules/project-task/project-task.module';
import { AppSettingsModule } from './modules/app-settings/app-settings.module';
import { SubContractorModule } from './modules/sub-contractor/sub-contractor.module';
import { CompanyFilesModule } from './modules/company-files/company-files.module';
import { PropertyModule } from './modules/property/property.module';
import { ProjectTaskLabelModule } from './modules/project-task-label/project-task-label.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { HttpModule } from '@nestjs/axios';
import { InspectionCostsModule } from './modules/inspection-costs/inspection-costs.module';
import { CommentsModule } from './modules/comments/comments.module';
import { UserRelationsModule } from './modules/user-relations/user-relations.module';
import { SmsModule } from './modules/sms/sms.module';
import { RasmioModule } from './common/providers/external/rasmio/rasmio.module';
import { CurrencyRateModule } from './common/providers/external/currency-rate/currency-rate.module';
import { RedisModule } from './modules/redis/redis.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
  CookieResolver,
} from 'nestjs-i18n';
import { IndustryModule } from './modules/industry/industry.module';
import { SeederModule } from './modules/seeders/seeder.module';
import { QueueModule } from './modules/queue/queue.module';
import { IndexingModule } from './modules/indexing/indexing.module';
import { ElasticConfigModule } from './config/database/elastic/config.module';
import { SearchModule } from './modules/search/search.module';
import { ContractNumberModule } from './modules/contract-number/contract-number.module';
import { IncomeModule } from './modules/income/income.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransactionInterceptor } from './common/interceptors/transaction.interceptor';
import { CategoryModule } from './modules/categories/category.module';
import { Connection } from 'mongoose';
import { InvoiceService } from './modules/invoice/invoice.service';
import { CronJobService } from './common/providers/cron-job.service';
import { EmailModule } from './modules/emails/email.module';
import { BullModule } from '@nestjs/bull';
import { RedisConfigService } from './config/database/redis/config.service';
import { InspectionCostsService } from './modules/inspection-costs/inspection-costs.service';
import { SamplingPriceModule } from './modules/sampling-price/sampling-price.module';
import { AppDelegateModule } from './modules/app-delegate/app-delegate.module';
import { EmailService } from './modules/emails/email.service';
import { InstanceSearchService } from './modules/search/services/instance-search.service';
import { IncomeSearchService } from './modules/search/services/income-search.service';
import { generatePdfAndHtml } from './modules/files/file.utils';
import { DispatcherCategoryModule } from './modules/dispatcher-category/dispatcher-category.module';
import { PettyCashModule } from './modules/petty-cash/petty-cash.module';
import { PettyCostModule } from './modules/petty-costs/petty-cost.module';
import { BranchModule } from './modules/branch/branch.module';
import { CategoryBudgetModule } from './modules/category-budget/category-budget.module';

@Module({
  imports: [
    RedisModule,
    CurrencyRateModule,
    RasmioModule,
    UsersModule,
    PermissionsModule,
    UserGroupsModule,
    IamModule,
    FilesModule,
    ProcessDefinitionsModule,
    ProcessInstancesModule,
    TasksModule,
    AppConfigModule,
    MongoConfigModule,
    RedisConfigModule,
    I18nModule.forRoot({
      fallbackLanguage: 'fa',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true, // Automatically reload translations on change
        global: true,
      },
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [MongoConfigModule],
      useFactory: async (mongoConfigService: MongoConfigService) => {
        const userPassConfig =
          process.env.APP_ENV != 'test'
            ? {
                user: mongoConfigService.user,
                pass: mongoConfigService.pass,
              }
            : {};

        return {
          uri: mongoConfigService.uri,
          dbName: mongoConfigService.dbName,
          ...userPassConfig,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [MongoConfigService],
    }),

    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'statics'),
      serveRoot: '/statics',
      serveStaticOptions: {
        cacheControl: true,
        extensions: [
          'jpg',
          'jpeg',
          'png',
          'mp3',
          'wav',
          'zip',
          'pdf',
          'xlsx',
          'csv',
          'doc',
          'docx',
        ],
        fallthrough: false, // Show error if file is not found.
      },
    }),
    BullModule.forRootAsync({
      imports: [RedisConfigModule],
      useFactory: (redisConfigService: RedisConfigService) => {
        return {
          redis: {
            host: redisConfigService.host,
            port: redisConfigService.port,
            db: redisConfigService.dbIndex,
          },
        };
      },
      inject: [RedisConfigService],
    }),
    PersonnelModule,
    ExpertiseModule,
    JobDescriptionModule,
    PersonnelExpertiseModule,
    WorkingTimeRegulationsModule,
    PersonnelAttendanceModule,
    PersonnelRequestModule,
    FinancialModule,
    AssetRequirementModule,
    PaymentRuleModule,
    ContractModule,
    EducationModule,
    FormModule,
    IndicatorModule,
    ProductModule,
    ProductCategoryModule,
    AuditModule,
    UserFilesModule,
    TicketModule,
    NotificationsModule,
    AppSettingsModule,
    CompanyFilesModule,
    PaymentModule,
    ProjectModule,
    ProjectTaskModule,
    AppSettingsModule,
    SubContractorModule,
    CompanyFilesModule,
    PropertyModule,
    ProjectTaskLabelModule,
    HttpModule,
    InspectionCostsModule,
    CommentsModule,
    UserRelationsModule,
    SmsModule,
    IndustryModule,
    SeederModule,
    QueueModule,
    IndexingModule,
    SearchModule,
    ContractNumberModule,
    IncomeModule,
    InvoiceModule,
    CategoryModule,
    SamplingPriceModule,
    AppDelegateModule,
    EmailModule,
    DispatcherCategoryModule,
    PettyCashModule,
    CategoryBudgetModule,
    PettyCostModule,
    BranchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CronJobService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly invoiceService: InvoiceService,
    private readonly cronJobService: CronJobService,
    private readonly inspectionCostService: InspectionCostsService,
    private readonly emailService: EmailService,
    private readonly instanceSearchService: InstanceSearchService,
    private readonly incomeSearchService: IncomeSearchService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IpCheck)
      .forRoutes({ path: '/personnel-attendance', method: RequestMethod.POST });
  }

  async onModuleInit() {
    this.cronJobService.startJob(
      '01 00 * * *',
      async () => {
        const session = await this.connection.startSession();
        try {
          console.log(`addOverdueCharge started at ${new Date()}`);

          session.startTransaction();
          await this.invoiceService.addOverdueCharge(
            {
              id: '64fc34ccac4d2e3326f95a5c',
              branchId: null,
              email: null,
              fullName: 'sysadmin',
              groups: ['system-admin'],
              phoneNo: null,
              type: null,
            },
            session,
          );
          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          console.error('Transaction aborted due to an error:', error);
        } finally {
          // Ensure the session is ended after all operations are completed
          await session.endSession();
        }
      },
      'Asia/Tehran',
      'addOverdueCharge',
    );

    this.cronJobService.startJob(
      '01 01 * * *',
      async () => {
        try {
          console.log(`updateCurrencyRates started at ${new Date()}`);
          await this.inspectionCostService.updateCurrencyRates();
        } catch (error) {
          console.error('Error on job updateCurrencyRates', error);
        } finally {
          // Ensure the session is ended after all operations are completed
        }
      },
      'Asia/Tehran',
      'updateCurrencyRates',
    );

    if (process.env.APP_ENV == 'production') {
      this.cronJobService.startJob(
        '01 01 * * 0', // Runs every Sunday at 01:01 AM
        // '*/1 * * * *', // Every 1 minutes
        async () => {
          try {
            console.log(
              `send weekly report to managers started at ${new Date()}`,
            );
            const instanceData =
              await this.instanceSearchService.weeklyProcessReport();
            const incomeData =
              await this.incomeSearchService.weeklyPidIncomes();
            const mergedData = { ...instanceData, ...incomeData };
            const file = await generatePdfAndHtml({
              data: JSON.parse(JSON.stringify(mergedData)),
              download: 'html',
              outputFileName: 'weekly-report',
              templateName: 'sales-weekly-report.html',
              templatePath: './assets/templates/financial',
            });

            //       await this.emailService.sendingSystemEmail({
            //         files:null,
            //         html: file,
            //         //  `<html lang="en">
            //         // <head>
            //         //     <meta charset="UTF-8">
            //         //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
            //         //     <title>Simple HTML Page</title>
            //         //     <style>
            //         //         body {
            //         //             font-family: Arial, sans-serif;
            //         //             text-align: center;
            //         //             margin: 50px;
            //         //         }
            //         //         h1 {
            //         //             color: #333;
            //         //         }
            //         //     </style>
            //         // </head>
            //         // <body>
            //         //     <h1>Welcome to My Simple HTML Page</h1>
            //         //     <p>This is a basic HTML file with a heading and a paragraph.</p>
            //         // </body>
            //         // </html>`,
            //         isUserEmail:false,
            //         subject:`گزارش هفتگی نورا آزمابین الملل`,
            //         to: ['arefeh.yousefi98@gmail.com'],
            //         // to: ['ceo@naitco.ir' , 'cpo.mgr@naitco.ir'],
            //       }
            //       ,null);
            //     } catch (error) {
            //       console.error('Error on job send weekly report to managers', error);
            //     }
            //   },
            //   'Asia/Tehran',
            //   'weeklyReport'
            // );

            // if(process.env.APP_ENV == 'production'){
            //   this.cronJobService.startJob(
            //     '1 0 * * *', //every night at 00:01
            //     async () => {
            //       try {
            //         console.log(`sendInvoiceExpiryAlert started at ${new Date()}`);
            //         await this.invoiceService.expiryAlert();
            //       } catch (error) {
            //         console.error('Error on job sendInvoiceExpiryAlert', error);
            //       }
            //     },
            //     'Asia/Tehran',
            //     'InvoiceExpiryAlert'
            //   );
            // }
            await this.emailService.sendingSystemEmail(
              '653bf6bd24b45e79d94e8746',
              {
                files: null,
                html: file.html,
                isUserEmail: false,
                subject: `گزارش هفتگی نورا آزمابین الملل`,
                to: [
                  'ceo@naitco.ir',
                  'cpo.mgr@naitco.ir',
                  'mohammadtavassolian3@gmail.com',
                ],
              },
              null,
            );
          } catch (error) {
            console.error('Error on job send weekly report to managers', error);
          }
        },
        'Asia/Tehran',
        'weeklyReport',
      );
    }

    if (process.env.APP_ENV == 'production') {
      this.cronJobService.startJob(
        '1 0 * * *', //every night at 00:01
        async () => {
          try {
            console.log(`sendInvoiceExpiryAlert started at ${new Date()}`);
            await this.invoiceService.expiryAlert();
          } catch (error) {
            console.error('Error on job sendInvoiceExpiryAlert', error);
          }
        },
        'Asia/Tehran',
        'InvoiceExpiryAlert',
      );
    }
  }
}
