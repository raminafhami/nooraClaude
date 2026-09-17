export enum StageSubTypes {
  START = 'start',
  END = 'end',
  TIMER = 'timer',
  INTERMEDIATE_EVENT = 'intermediate-event',
  TASK = 'task',
  USER_TASK = 'user-task',
  SYSTEM_TASK = 'system-task',
  COMPOUND_TASK = 'compound-task',
  SEND_TASK = 'send-task',
  RECEIVE_TASK = 'receive-task',
  MANUAL_TASK = 'manual-task',
  BUSINESS_RULE_TASK = 'business-rule-task',
  SERVICE_TASK = 'service-task',
  SCRIPT_TASK = 'script-task',
  CALL_ACTIVITY = 'call-activity',
  SUB_PROCESS = 'sub-process',
  EXCLUSIVE = 'exclusive',
  PARALLEL = 'parallel',
  INCLUSIVE = 'inclusive',
  IF_ELSE = 'if-else',
  SWITCH_CASE = 'switch-case',
}

export enum StageTypes {
  EVENT = 'event',
  ACTIVITY = 'activity',
  GATEWAY = 'gateway',
}

export enum ConnectorTypes {
  REST = 'rest',
  GRPC = 'grpc',
}

export enum Webhooks {
  CREATE_INSTANCE = 'instance:create',
  UPDATE_INSTANCE = 'instance:update',
  DELETE_INSTANCE = 'instance:delete',
  CREATE_TASK = 'task:create',
  UPDATE_TASK = 'task:update',
  DELETE_TASK = 'task:delete',
}

export enum InputStatuses {
  COMPLETE = 'complete',
  HOLD = 'hold',
  CANCEL = 'cancel',
  RESUME = 'resume',
  EMPTY = '',
}

export enum PaymentStatuses {
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  PROGRESSING = 'progressing',
  EXPIRED = 'expired',
}

export enum paymentTypes {
  BANK_GATEWAY = 'bank-gateway',
  BANK_DEPOSIT = 'bank-deposit',
  FOREIGN_ACCOUNT = 'foreign-account',
  CASH = 'cash',
}

export enum BankCodes {
  SepahNoora171800185402 = '001',
  MelliFarimaFarokhMehr = '002',
  MelliHoomanAlaei0226892601006 = '003',
  SepahPos = '004',
  TejaratNoora2904059288 = '007',
  TejaratNoora2904357033 = '008',
  PasargadHoomanAlaei2168000140202571 = '009',
  PasargadKiarashShabdiz320800514951 = '016',
  ToseeTaavonNoora31331171175461 = '017',
  ToseeTaavonNoora31311171175461 = '018',
  TejaratPos = '019',
  BankGatewayIKC = '020',
  ChinaAndy = '80002',
  India = '11750',
  Dubai = '13399',
}

export enum currencies {
  Euro = 'euro',
  Dollar = 'dollar',
  Yuan = 'yuan',
  Rial = 'rial',
}

export enum smsTemplates {
  ContractVerification = '271835',
  loginVerificationCode = '187960',
}

export enum IndustryTypes {
  MAIN = 'main',
  SUB = 'sub',
}

export enum ReferralSource {
  EXHIBITION = 'exhibition',
  WEB = 'web',
  EMPLOYEES = 'employees',
  OTHERS = 'others',
}

export enum ReminderMethod {
  SMS = 'sms',
  WEB_NOTIFICATION = 'web-notification',
}

export enum ActivityType {
  CALL = 'call',
  MEETING = 'meeting',
  TASK = 'task',
}

export enum ProjectType {
  ACTIVITY = 'activity',
  TASK = 'task',
}

export enum ElasticFilterRules {
  TERM = 'term',
  TERMS = 'terms',
  MATCH = 'match',
  NOT_MATCH = 'notMatch',
  RANGE = 'range',
  EXISTS = 'exists',
  COMPOSITE = 'composite',
  MULTI_MATCH = 'multiMatch',
  MATCH_PHRASE = 'matchPhrase',
  WILDCARD = 'wildcard',
  PREFIX = 'prefix',
  FUZZY = 'fuzzy',
  GEO_DISTANCE = 'geoDistance',
  AGGREGATION = 'aggregation',
}

export enum AggFunctions {
  SUM = 'sum',
  AVG = 'avg',
  DIFF = 'diff',
}
export enum InvoicePaymentStatuses {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partiallyPaid',
  PENDING = 'pending',
}

export enum IncomeStatuses {
  Paid = 'paid',
  Unpaid = 'unpaid',
  Partially = 'partially',
  Pending = 'pending',
  Canceled = 'canceled',
}

export enum IncomeTypes {
  Education = 'education',
  Instance = 'instance',
}

export enum InvoiceStatuses {
  Active = 'active', // Invoice has been created, but it has not been sent to the customer and it has not NO. A newly-created invoice is set to Active status by default.
  Issued = 'issued', //Invoice has been labeled by a NO and it has been sent to the customer
  Partially = 'partially',
  Pending = 'pending', //Invoice is on payment order
  Paid = 'paid',
  Canceled = 'canceled', //Manually by operator
  Expired = 'expired', // By system
}

export enum InvoiceTypes {
  Official = 'official',
  Unofficial = 'unofficial',
}

export enum UnitMeasure {
  Pieces = 'pcs',
  days = 'day',
}

export enum InstanceCaseTypes {
  Official = 'official',
  Unofficial = 'unofficial',
}

export enum DownloadTypes {
  Html = 'html',
  Pdf = 'pdf',
  Csv = 'csv',
  Excel = 'xlsx',
}

export enum CategoryTypes {
  Income = 'income',
  Cost = 'cost',
  overdue = 'overdue',
  Petty = 'petty',
}

export enum CategoryKeys {
  Insurance = 'insurance',
  Education = 'education',
  Overdue = 'overdue',
}

export enum CurrencyKeys {
  dollar = '137203',
  euro = '137204',
  UAE_dirham = '137205',
  Herat_dollar = '507001',
  British_pound = '137206',
  Turkish_lira = '137224',
  Swiss_franc = '137222',
  Chinese_yuan = '137221',
  Japanese_yen = '137209',
  South_Korean_won = '520865',
  Canadian_dollar = '137220',
  Australian_dollar = '137219',
  New_Zealand_dollar = '137231',
  Singapore_dollar = '137215',
  Indian_rupee = '137227',
  Pakistani_rupee = '137228',
  Iraqi_dinar = '137216',
  Syrian_pound = '137212',
  Afghan_afghani = '137217',
  Danish_krone = '137223',
  Swedish_krona = '137207',
  Norwegian_krone = '137208',
  Qatari_rial = '137230',
  Omani_rial = '137214',
  Kuwaiti_dinar = '137211',
  Bahraini_dinar = '137229',
  Malaysian_ringgit = '137210',
  Thai_baht = '137232',
  Hong_Kong_dollar = '137225',
  Russian_ruble = '137213',
  Azerbaijani_manat = '137218',
  Armenian_dram = '137233',
  Georgian_lari = '137234',
  Kyrgyzstani_som = '520876',
  Lebanese_pound = '520785',
  Tajikistani_somoni = '520823',
  Kazakhstani_tenge = '520783',
  Uzbekistani_som = '520866',
  Hungarian_forint = '520844',
  Turkmenistani_manat = '520824',
  Taiwanese_dollar = '520864',
  Albanian_lek = '520717',
  Barbadian_dollar = '520720',
  Bangladeshi_taka = '520721',
  South_African_rand = '520848',
  Indonesian_rupiah = '520867',
  Bulgarian_lev = '520722',
  Burundian_franc = '520723',
  Bruneian_dollar = '520726',

  TDollar = '137235',
  TEuro = '137241',
  TChinese_yuan = '816445',
}

export enum CurrencyKeysTransferRate {
  PersonalDollar = '137235',
  Euro = '137241',
  Yuan = '816445',
}

export enum PettyCostStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PENDING = 'pending',
}

export enum CostTypes {
  Official = 'official',
  Unofficial = 'unofficial',
}

export enum IKCResponseCodes {
  Canceled = '17',
}

export enum PropertyStatus {
  ACTIVE = 'active',
  UNDER_MAINTENANCE = 'underMaintenance',
  DECOMMISSIONED = 'decommissioned',
}

export enum PropertyTypes {
  Repair = 'repair',
  Upgrade = 'upgrade',
}

export enum EmailStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  SENDING = 'sending',
  SUCCESS = 'success',
  FAILED = 'failed',
}


export enum InspectionCostStatuses {
  paid = 'paid',
  unpaid = 'unpaid',
  pending = 'pending',
}