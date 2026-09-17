"use client";

import moment from "moment-jalaali";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/images/noorazmalogo.png";
import { Button } from "@/components/ui/button";
import { ContractStatus } from "@/hrm/contract/enums/ContractStatus";
import { initializePersonnelContract } from "@/hrm/contract/flows/personnel-contract/services/initializePersonnelContract";
import { createContract } from "@/hrm/contract/services/createContract";
import { updateContract } from "@/hrm/contract/services/updateContract";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { Loading } from "@/ui/Loader";
import { toFarsiNum } from "@/utils/string/toFarsiNum";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { FormData } from "../../[id]/edit/_components/ContractEditForm";

interface ContractPreview {
  contractDetails: FormData;
  personnel: Personnel | undefined;
}

export function ContractPreview({
  contractDetails,
  personnel,
}: ContractPreview) {
  const [loading, setLoading] = useState<boolean>(false);
  const [draftLoading, setDraftLoading] = useState<boolean>(false);
  const router = useRouter();

  function isPersonnelDataComplete(
    personnelData: any,
    propertiesToCheck: string[],
  ): boolean {
    return propertiesToCheck.every(
      (property) =>
        personnelData[property] !== undefined && personnelData[property] !== "",
    );
  }
  const propertiesToCheck = [
    "fullname",
    "nationalCode",
    "fatherName",
    "birthCertificateNo",
    "birthDate",
    "birthPlace",
    "address",
    "landlineNo",
    "phoneNo",
    "academics",
    "address",
    "landlineNo",
  ];
  const isComplete = isPersonnelDataComplete(personnel, propertiesToCheck);

  const handleClick = async () => {
    setLoading(true);
    if (personnel?.userId) {
      const contract = await createContract({
        userId: personnel?.userId,
        ...contractDetails,
        jobs: contractDetails.jobs.map((job) => job.id),
        startDate: getDatesIngregorian(contractDetails.startDate),
        endDate: getDatesIngregorian(contractDetails.endDate),
        signDate: getDatesIngregorian(contractDetails.signDate),
        status: ContractStatus.Pending,
      });
      if (contract.id) {
        await initializePersonnelContract(contract);

        setLoading(false);
        router.push(getDynamicUrl("/dashboard/hr-management"));
      } else {
        toast.error("ثبت قرارداد با خطا مواجه شد");
        setLoading(false);
      }
    }
  };

  const handleNewDraftClick = async () => {
    setDraftLoading(true);
    if (personnel?.userId) {
      const contract = await createContract({
        userId: personnel?.userId,
        ...contractDetails,
        jobs: contractDetails.jobs.map((job) => job.id),
        startDate: getDatesIngregorian(contractDetails.startDate),
        endDate: getDatesIngregorian(contractDetails.endDate),
        signDate: getDatesIngregorian(contractDetails.signDate),
        status: ContractStatus.Draft,
      });
      if (!contract.id) {
        toast.error("ثبت قرارداد با خطا مواجه شد");
        setDraftLoading(false);
      } else {
        setDraftLoading(false);
        router.push("/dashboard/hr-management/contract");
      }
    }
  };

  const handleDraftClick = async () => {
    setLoading(true);
    if (personnel?.userId) {
      const contract = await updateContract(contractDetails.id as string, {
        ...contractDetails,
        jobs: contractDetails.jobs.map((job) => job.id),
        startDate: getDatesIngregorian(contractDetails.startDate),
        endDate: getDatesIngregorian(contractDetails.endDate),
        signDate: getDatesIngregorian(contractDetails.signDate),
        status: contractDetails.id
          ? ContractStatus.Pending
          : ContractStatus.Draft,
      });

      if (contract) {
        await initializePersonnelContract(contract);

        setLoading(false);
        router.push("/dashboard/hr-management/contract");
      } else {
        toast.error("ثبت قرارداد با خطا مواجه شد");
        setLoading(false);
      }
    }
  };
  const handleDraftUpdateClick = async () => {
    setDraftLoading(true);
    if (personnel?.userId) {
      const contract = await updateContract(contractDetails.id as string, {
        ...contractDetails,
        jobs: contractDetails.jobs.map((job) => job.id),
        startDate: getDatesIngregorian(contractDetails.startDate),
        endDate: getDatesIngregorian(contractDetails.endDate),
        signDate: getDatesIngregorian(contractDetails.signDate),
      });

      if (!contract) {
        toast.error("ثبت قرارداد با خطا مواجه شد");
        setDraftLoading(false);
      } else {
        setDraftLoading(false);
        router.push("/dashboard/hr-management/contract");
      }
    }
  };

  return (
    <div className="bg-gray-50 w-full">
      <div dir="rtl" className={`text-2xs px-2 w-full my-0`}>
        <div className="bg-white h-[29.7cm] w-a4-portrait leading-6 mx-auto text-justify pb-5 px-3">
          {/* Header */}
          {/* <div className="bg-primary-400 text-center text-white w-1/2 mx-auto mb-5 px-5">
                شرکت بازرسی و خدمات آزمایشگاهی نورا آزما بین الملل
              </div> */}
          <div className="flex justify-between items-center px-12">
            <div>
              <Image className="w-[3cm]" src={logo} alt="Logo" />
            </div>
            <div className="text-center pb-4">قرارداد کار مدت موقت</div>
            <div>
              <div>تاریخ: {toFarsiNum(contractDetails?.signDate)}</div>
              <div>
                شماره:{" "}
                <span className="text-right" dir="ltr">
                  {toFarsiNum(contractDetails?.contractNo)}
                </span>
              </div>
            </div>
          </div>
          {/* Form */}
          <div className="border-2 w-full p-3 mx-auto">
            <div>
              این قرار داد به موجب ماده (۱۰) قانون کار جمهوری اسلامی ایران و
              تبصره (۳) الحاقی به ماده (۷) قانون کار موضوع بند (الف) ماده (۸)
              قانون رفع برخی از موانع تولید و سرمایه گذاری صنعتی مصوب ۱۳۸۷/۸/۲۵
              مجمع تشخیص مصلحت نظام بین کارفرما / نماینده قانونی کار فرما و
              کارگر(کارمند)منعقد میشود.
            </div>
            <br />
            <ol className="divst-decimal mr-2" type="1">
              <div>
                ۱- مشخصات طرفین: کارفرما / نماینده قانونی کارفرما
                <br />
                شركت بازرسی نورا آزما بین الملل به شناسه ملی ۱۰۳۰۰۰۷۲۲۰۶ به
                نشانی تهران، زعفرانیه، پسیان، نبش جامی شرقی، ساختمان پیدایش،
                پلاک ۲۸، واحد c شمالی.
              </div>
              <div>
                ۲- مشخصات کارگر(کارمند): {personnel?.fullname}
                <div className="flex grow justify-start gap-14">
                  <div>فرزند: {personnel?.fatherName}</div>
                  <div>متولد: {toFarsiNum(personnel?.birthDate)}</div>
                  <div>محل تولد: {personnel?.birthPlace}</div>
                </div>
                <div className="flex grow justify-start gap-40">
                  <div>
                    شماره شناسنامه: {toFarsiNum(personnel?.birthCertificateNo)}
                  </div>
                  <div>کدملی: {toFarsiNum(personnel?.nationalCode)}</div>
                </div>
                <div className="flex grow justify-start gap-40">
                  <div>
                    میزان تحصیلات:{" "}
                    {
                      personnel?.academics[personnel.academics.length - 1]
                        ?.level
                    }
                  </div>
                  <div>
                    رشته تحصیلی:{" "}
                    {personnel?.academics[personnel.academics.length - 1]?.name}
                  </div>
                </div>
                <div>به نشانی: {toFarsiNum(personnel?.address)}</div>
                <div className="flex grow justify-start gap-40">
                  <div>تلفن ثابت: {toFarsiNum(personnel?.landlineNo)}</div>
                  <div>تلفن همراه: {toFarsiNum(personnel?.phoneNo)}</div>
                </div>
              </div>
              <div>۳- نوع قرارداد: قرارداد کار مدت موقت</div>
              <div>
                ۴- نوع کار یا مسئولیت:
                {contractDetails.jobs.map((job, index) => (
                  <span key={job.id}>
                    {job.name}{" "}
                    {job.goodsInspectionField && (
                      <span>({job.goodsInspectionField})</span>
                    )}{" "}
                    {index !== contractDetails.jobs.length - 1 && "-"}{" "}
                  </span>
                ))}
              </div>
              <div>۵- محل انجام: {contractDetails.workplace}</div>
              <div>
                ۶- تاریخ انعقاد قرار داد از{" "}
                {toFarsiNum(contractDetails?.startDate)} تاریخ: الی{" "}
                {toFarsiNum(contractDetails?.endDate)}
              </div>
              <div>
                ۷- مدت قرارداد: {toFarsiNum(contractDetails?.period)} ماه
              </div>
              <div>
                ۸- ساعت کار: میزان ساعات کار و ساعت شروع و پایان آن با توافق
                طرفین تعیین می گردد. ساعات کار نمی تواند بیش از میزان مندرج در
                قانون کار تعیین شود لیکن کمتر از آن مجاز است .
              </div>
              <div>
                ۹- حق السعی: مزد ثابت / مبنا روزانه / ساعتی - روزانه{" "}
                {toFarsiNum(contractDetails?.salaryAmount)} ریال
              </div>
              <div>
                ۱۰- حقوق و مزایا: بصورت هفتگی / ماهانه کارگر (کارمند)به حساب
                شماره
                {toFarsiNum(contractDetails.bankAccountNumber)} نزد بانک{" "}
                {contractDetails.bankName} شعبه‌‌ ‌{contractDetails.bankBranch}{" "}
                توسط کار فرما یا نماینده قانونی وی پرداخت میگردد.
              </div>
              <div>
                ۱۱- بیمه: به موجب ماده (۱۴۸) قانون کار،کار فرما مکلف است
                کارگر(کارمند) را نزد سازمان تامین اجتماعی و یا سایر دستگاههای
                بیمه گذار بیمه نماید.
              </div>
              <div>
                ۱۲- عیدی و پاداش سالانه: به موجب ماده واحده قانون مربوط به تعیین
                عیدی و پاداش سالانه کارگران شاغل در کارگاههای مشمول قانون
                کار-مصوب ۱۳۷۰/۱۲/۰۶ مجلس شورای اسلامی – به ازای یک سال کار معادل
                شصت روز مزد ثابت / مبنا ( سقف نود روز حداقل مزد روزانه قانونی
                کارگران) به عنوان عیدی و پاداش سالانه به کارگر(کارمند) پرداخت
                میشود. برای کار کمتر از یک سال میزان عیدی و پاداش و سقف مربوط به
                نسبت محاسبه خواهد شد.
              </div>
              <div>
                ۱۳- حق سنوات یا مزایای پایان کار: هنگام فسخ یا خاتمه قرارداد کار
                حق سنوات مطابق قانون و مصوبه ۷۸/۰۸/۲۵ مجمع تشخیص مصلحت نظام بر
                اساس نسبت کارکرد کارگر(کارمند) پرداخت می شود.
              </div>
              <div>
                ۱۴- میزان تعطیلات و مرخصی ها : بر اساس قانون کار و زمان استفاده
                از آن به استناد ماده ۶۹ قانون کار با توافق طرفین تعیین می گردد.
              </div>
              <div>
                ۱۵- شرایط فسخ قرارداد: این قرارداد در موارد ذیل توسط هر یک از
                طرفین قابل فسخ است. فسخ قرارداد یکماه قبل به طرف مقابل کتبا
                اعلام میشود. (ضمن رعایت موارد در بند ۴-۱۷ در ذیل این قرارداد )
              </div>
              <div>
                ۱۶- سایر موضوعات مندرج در قانون کار و مقررات تبعی از جمله حق
                مسکن، حق بن کارگری، حق تأهل و حق اولاد پس از پایان قرارداد،
                کارفرما الزامی به تمدید آن نخواهد داشت.
              </div>
            </ol>
          </div>
        </div>

        <div className="bg-white h-[29.7cm] w-a4-portrait leading-6 mx-auto text-justify pb-5 px-3">
          {/* Header */}
          {/* <div className="bg-primary-400 text-center text-white w-1/2 mx-auto mb-5 px-5">
                شرکت بازرسی و خدمات آزمایشگاهی نورا آزما بین الملل
              </div> */}
          <div className="flex justify-between items-center px-12">
            <div>
              <Image className="w-[3cm]" src={logo} alt="Logo" />
            </div>
            <div>
              <div>تاریخ: {toFarsiNum(contractDetails?.signDate)}</div>
              <div>
                شماره:{" "}
                <span className="text-right" dir="ltr">
                  {toFarsiNum(contractDetails?.contractNo)}
                </span>
              </div>
            </div>
          </div>
          <div className="border-2 h-fit w-full p-3">
            <div>۱۷- رعایت محرمانگی در قرارداد:</div>
            <div>
              ۱۷-۱ « طرف قرارداد» با امضاي ذيل اين قرارداد و در بازه زمانی
              قرارداد کاری مذکور، حق فعاليت در موارد مشابه با پروژه ها و يا
              فعاليتهايي كه رأسًا و يا جزئًا در اين شركت، مسئول و عهده دار انجام
              آنها بوده است را در شرکت های رقیب یا مشابه فعالیت با نورا آزما بین
              الملل سلب مينمايد؛ منظور از فعاليت مزبور عبارت است از كليه عملياتي
              كه به نحوي از انحاء، «شركت» را دچار ضرر و زيان مالي و يا معنوي
              بنمايد اعم از مشاوره، خدمات، مديريت،
            </div>
            <div>
              ۱۷-۲ «طرف قرارداد» با امضاي ذيل اين قرارداد، حق ايجاد هرگونه رابطه
              تجاري، فني و خدماتي را با اشخاص حقيقي و حقوقي كه به واسطه «شركت»
              تجارت، بازاریابی و يا بازرگاني در موارد مربوطه. در اين صورت «طرف
              قرارداد» مسئول جبران تمامي خسارتهاي وارده به «شركت» مي¬باشد. (اعم
              از مستقيم يا غير مستقيم) با آنها آشنا ميگردد در حین همکاری با شرکت
              نورا آزما بین الملل و بازه زمانی این قرارداد به نفع شخصی خود یا
              موسسه تجاری دیگری را سلب مي نمايد. هــرگونه انعقاد قرارداد همكاري
              يا تعهدات توسعه يا سرويس و یا خدمات و ساير موارد مشابه، داخل در
              اين موضوع بوده و شركت محق در پيگيري، ابطال و سلب اثر از آن و
              مطالبه خسارت وفق بند ۱۷-۱ خواهد بود
            </div>

            <div>
              ۱۷-۳ «طرف قرارداد» با امضاء ذيل اين قرار داد خود را متعهد به حفظ و
              عدم افشاء كليه اطلاعات شركت و مشتريان آن را (اعم ازاطلاعات فني،
              مالي، بازرگاني و مشتریان يا هر نوع اطلاعات مرتبط ديگر) در مدت زمان
              قرارداد و پس از آن ميداند و هر گونه تخطي از اين بند حسب شرايط
              مصداق « خيانت در امانت » خواهد بود و پيگيري موارد حقوقي و كيفري
              مربوطه را نيز دنبال خواهد داشت
            </div>
            <div>
              ۱۷-۴ بديهي است كه «طرف قرارداد» ملزم به ادامه همكاري تا پایان
              قرارداد مي¬باشد و متعهد ميگردد چنانچه در طول قرار داد به هر دليلي
              تقاضاي قطع همكاري نمايد و علاقمند به ادامه همكاري با نورا آزما بین
              الملل نباشد لازم است كه یک ماه قبل از ترك كار و يا خاتمه قرارداد،
              مراتب را نيز كتبا به شركت اعلام نمايد و كليه اقدامات لازم از نظر
              جایگزینی فرد جانشین و ارائه مستندات و تحويل كار و آموزش و توجيه
              فرد جايگزين را به انجام رساند و تاييد كتبي مديريت واحد و مدیرعامل
              را در رابطه با انجام موارد مذكور اخذ نمايد. «شركت» نيز در صورتيكه
              در طول مدت قرارداد علاقمند به ادامه همكاري با «طرف قرارداد» نباشد
              موظف است تا مراتب را حداقل يك ماه جلوتر به «طرف قرارداد» اعلام
              نمايد
            </div>
            <div>شرایط فسخ:</div>
            <div>
              ۱- برابر ماده ۲۷ قانون کار، هرگاه کارگر(کارمند) در انجام وظایف
              محوله قصور ورزد و یا آیین نامه های انظباطی (شرح وظایف تایید شده
              موجود در پرونده ) کارگاه را پس از تذکرات کتبی نقض نماید
            </div>
            <div>
              ۲- در صورت قصور یا سهل انگاری کارمند یا عدم رعایت اصول ایمنی و
              انظباط اداری و مقررات محل انجام کار و یا انجام هرگونه عملی از طرف
              کارگر وی ودر صورت عدم تکاپو از هر روش قانونی ممکن استفاده نماید
            </div>
            <div>سایر شرایط:</div>
            <div>
              چنانچه کارگر (کارمند) عمدا یا سهوا اطلاعات ناقص یا اشتباه در هنگام
              بازرسی بازرسان سازمان تامین اجتماعی و یا ارگان های مربوطه ارائه
              دهد مسئولیت سایر شرایط: جبران کلیه خسارت های ناشی از آن بر عهده
              ایشان خواهد بود.
            </div>
            <div>
              چنانچه کارگر(کارمند) بخواهد قرارداد خود را بدون رضایت و موافقت
              کتبی کارفرما فسخ نماید، ملزم به پرداخت خسارت روزانه‌‌ ‌
              {toFarsiNum(contractDetails.damages)} ریال از زمان فسخ یکجانبه
              قرارداد تا اتمام آن‌ ‌ به کارفرما خواهد بود. مبلغ مذکور ابتدا از
              محل مطالبات کارگر(کارمند) نزد کارفرما و در صورت عدم تکاپو از محل
              ضمانت حسن انجام کار یا هر روش قانونی دیگر استفاده خواهد شد
            </div>
            <div>
              ۱۸- این قرارداد در تاریخ {toFarsiNum(contractDetails.startDate)}{" "}
              در دو نسخه، ۱۸ بند و دو صفحه تهیه و تنظیم می شود که یک نسخه نزد
              کار فرما و یک نسخه نزد کارگر(کارمند) نگهداری میگردد
            </div>

            <div className="my-16 flex justify-around items-center">
              <div className="flex flex-col justify-center items-center">
                <div>شرکت بازرسی نورا آزما بین الملل </div>
                <div>مدیر عامل</div>
                <div className="w-20 h-20"></div>
              </div>
              <div className="flex flex-col">
                <div>محل امضاء و اثر انگشت کارگر /کارپذیر</div>
                <div className="w-20 h-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex flex-col gap-2">
          <Button
            disabled={loading || !isComplete}
            className="mt-5 mr-20"
            onClick={contractDetails.id ? handleDraftClick : handleClick}
          >
            {loading ? (
              <Loading size="sm" intent={"white"}>
                در حال ارسال اطلاعات...
              </Loading>
            ) : (
              "تایید و ثبت قرارداد"
            )}
          </Button>
          {!isComplete && (
            <span className="mr-20 mb-5 text-xs text-red-700">
              اطلاعات پرسنل کامل نیست
            </span>
          )}
        </div>

        <Button
          disabled={draftLoading}
          className="mt-5 mr-2 mb-5"
          onClick={
            contractDetails.id ? handleDraftUpdateClick : handleNewDraftClick
          }
        >
          {draftLoading ? (
            <Loading size="sm" intent={"white"}>
              در حال ارسال اطلاعات...
            </Loading>
          ) : (
            "ثبت قرارداد بصورت پیش نویس"
          )}
        </Button>
      </div>
    </div>
  );
}
export function getDatesIngregorian(date: string): string {
  return moment(date, "jYYYY/jMM/jDD").format("YYYY-MM-DD");
}
