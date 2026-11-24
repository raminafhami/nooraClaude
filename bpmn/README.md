# BPMN

فایل‌های BPMN فرایندها این‌جا نگه داشته می‌شوند و با `POST /process-definitions/upload-bpmn` (فیلد `file`) بارگذاری می‌شوند. خود XML بعد از تبدیل در پایگاه ذخیره نمی‌شود.

`qazvin-sampling.bpmn` فرایند `QazvinSampling` است و فقط یک وظیفهٔ کاربر با شناسهٔ `QazvinSamplingForm` دارد. شمارهٔ پرونده از شاخص `qazvin-sampling` ساخته می‌شود (همان مدل `indicators` بقیهٔ فرایندها). گروه‌های نامزد گمرک در مخزن و پایگاه محلی نبودند؛ گروه‌های این فایل نقش‌های نمونه‌برداری در `noora-flow-main/src/modules/seeders/seeder-data.ts` هستند (`sampling-officer`، `surveyors`، `inspection-coordinator`). وقتی BPMN اصلی گمرک برسد باید جایگزین شوند.
