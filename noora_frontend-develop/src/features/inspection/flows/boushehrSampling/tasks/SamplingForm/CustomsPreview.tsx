import moment from "jalali-moment";
import Image from "next/image";
import React from "react";

import logo from "@/assets/images/nait-logo.png";

import { FormData } from "./PhasePage";

export const CustomsPreview = ({ data }: { data: FormData }) => {
  return (
    <div className="bg-gray-50 flex justify-center">
      <div className="py-5">
        <div className="bg-white p-4" style={{ width: "21cm", height: "29.7" }}>
          <div className="overflow-hidden block my-0 mx-auto text-xs">
            <div className="m-5 mb-1">
              <div className="flex justify-between">
                <div className="pb-2">
                  <Image src={logo} alt="logo" width={80} height={80} />
                </div>
                <div className="text-center mb-5">
                  <div className="text-lg">نورا آزما بین الملل</div>
                  <div>بازرسی و خدمات آزمایشگاهی</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    تاریخ:{" "}
                    {getDatesIngregorian(new Date().toLocaleDateString())}
                  </div>
                  <div>شماره:</div>
                </div>
              </div>
              <div className="border border-black">
                <div className="border-b border-black p-2 text-xs flex flex-col gap-2">
                  <div className="font-bold">
                    موضـــــوع: گزارش نمونه برداری
                  </div>
                  <div className="font-bold">با سلام</div>
                  <div>
                    به استناد مقررات صادرات و واردات سازمان ملی استاندارد ایران
                    از محمــوله:
                  </div>
                  <div>
                    با عنوان <span className="font-bold">{data.Title}</span> با
                    مشخصات مندرج در جدول زیر نمونه برداری و صحت مقاد آنرا تایید
                    می نمایم.
                  </div>
                </div>
                <div>
                  <table className="w-full">
                    <tr className="border-b border-black ">
                      <td
                        colSpan={2}
                        className="w-1/2 border-l border-black py-2 px-1 text-center text-xsm font-bold"
                      >
                        مشخصات اسنادی محموله
                      </td>
                      <td
                        colSpan={2}
                        className="w-1/2 py-2 px-1 text-center text-xsm font-bold"
                      >
                        مشخصات نمونه
                      </td>
                    </tr>
                    <tr className="border-b border-black w-full">
                      <th className="w-20 border border-black border-r-0 text-xs font-light py-2 px-1">
                        شماره و تاریخ کوتاژ
                      </th>
                      <td className="w-36 py-2 px-1 text-center text-xsm font-bold border border-black ">
                        {data.CottageNo} - {data.CottageDate}
                      </td>
                      <th className="w-20 border border-black border-r-0 text-xs font-light py-2 px-1">
                        مکان نمونه برداری <br />
                        شماره قبض انبار
                      </th>
                      <td className="w-36 py-2 px-1 text-center text-xsm font-bold ">
                        {data.Place}
                      </td>
                    </tr>
                    <tr className="border-b border-black ">
                      <th className="border border-black border-r-0 text-xs font-light py-2 px-1">
                        نام فروشنده
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black  ">
                        {data.SellerName}
                      </td>
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        نام نمونه مقدار آن
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black border-l-0 ">
                        {data.ProductsData.map((product, index) => (
                          <span key={index}>
                            {product.ProductName} - {product.SampleAmount}{" "}
                            {product.Unit?.split("/")[0]?.trim()}
                            {index < data.ProductsData.length - 1 ? " | " : ""}
                          </span>
                        ))}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        نام خریدار یا صاحب کالا
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black ">
                        {data.BuyerName}
                      </td>
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        نحوه مهار شماره پلمپ
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black  border-l-0">
                        {data.ProductsData.map((product, index) =>
                          [
                            product.PackingType?.includes("seal")
                              ? product.SealNo
                                ? `پلمپ:  ${product?.SealNo.split(",")
                                    .map((seal) => "NAIT" + seal)
                                    .join(",")}`
                                : ""
                              : "",

                            product.PackingType?.includes("bigLabel")
                              ? product?.BigLabelNo
                                ? `برچسب امنیتی ۴*۲۱: ${product?.BigLabelNo.split(
                                    ","
                                  )
                                    .map((BigLabel) => "NAIT" + BigLabel)
                                    .join(",")}`
                                : ""
                              : "",

                            product.PackingType?.includes("smallLabel")
                              ? product.SmallLabelNo
                                ? `برچسب امنیتی ۳*۱۰: ${product?.SmallLabelNo.split(
                                    ","
                                  )
                                    .map((SmallLabel) => "NAIT" + SmallLabel)
                                    .join(",")}`
                                : ""
                              : "",
                          ]
                            .filter((x) => x)
                            .join(" - ")
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        شماره ملی
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black ">
                        {data.NationalNo}
                      </td>
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        شماره اقتصادی
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black border-l-0 ">
                        {data.EconomicalNo}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        نام کشور سازنده
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black ">
                        {data.ProductsData.map((product, index) => (
                          <span key={index}>
                            {product.ManufactureCountry}
                            {index < data.ProductsData.length - 1 ? " | " : ""}
                          </span>
                        ))}
                      </td>
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        روش استاندارد مرجع نمونه برداری
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black  border-l-0">
                        {data.ProductsData.map((product, index) => (
                          <span key={index}>
                            {product.StandardMethod}
                            {index < data.ProductsData.length - 1 ? " | " : ""}
                          </span>
                        ))}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        نام مارک و مدل کالا
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black  ">
                        {data.ProductsData.map((product, index) => (
                          <span key={index}>
                            {product.Brand}
                            {index < data.ProductsData.length - 1 ? " | " : ""}
                          </span>
                        ))}
                      </td>
                      <th className="border border-black text-xs border-r-0 font-light py-2 px-1">
                        مشخصات نمونه <br />
                        مارک، مدل و شماره سریال
                      </th>
                      <td className="py-2 px-1 text-center text-xsm font-bold border border-black border-l-0 ">
                        {data.ProductsData.map((product, index) => (
                          <span key={index}>
                            {product.Model}
                            {index < data.ProductsData.length - 1 ? " | " : ""}
                          </span>
                        ))}
                      </td>
                    </tr>
                  </table>
                </div>

                <div className="p-2 text-xs border-b border-black leading-7">
                  در تطبیق مشخصات محموله رویت شده فوق الذکر با اسناد گمرکی
                  مربوطه مغایرتی بین محموله و اسناد گمرکی مشاهده نشده بشرح ذیل
                  گزارش می گردد:
                </div>
                <div className="border-b border-black p-2 text-xs leading-7">
                  مبلغ{" "}
                  {data.ProductsData.length < 6
                    ? data.ProductsData.length * 3440000
                    : data.ProductsData.length * 200000 +
                      data.ProductsData.length * 3440000}{" "}
                  ریال بابت حق الزحمه نمونه برداری و{" "}
                  {data.ProductsData.length * (3440000 * 0.09)} ریال مالیات ارزش
                  افزوده و عوارض به جمع کل{" "}
                  {data.ProductsData.length < 6
                    ? data.ProductsData.length * 3440000 * 0.09 + 3440000
                    : data.ProductsData.length * 200000 +
                      data.ProductsData.length * 3440000 * 0.09 +
                      3440000}{" "}
                  ریال دریافت گردید.
                </div>
                <div className="border-b border-black p-2 text-xs flex items-center gap-5 leading-7">
                  سایر ملاحظات --------------
                  <span className="flex items-center gap-1">
                    <input type="checkbox" id="1" className="accent-black" />
                    <label htmlFor="1">ندارد</label>
                  </span>
                  -----------
                  <span className="flex items-center gap-1">
                    <input type="checkbox" id="2" className="accent-black" />
                    <label htmlFor="2">دارد</label>
                  </span>
                  به شرح ذیل:
                </div>
                <div className="border-t border-black p-2">
                  <table className="w-full">
                    <tr>
                      <td className="py-2 px-1 text-center text-xsm font-bold ">
                        امضاء نماینده صاحب کالا <br />
                        <div className="w-20 h-20"></div>
                      </td>
                      <td className="py-2 px-1 text-center text-xsm font-bold ">
                        امضاء نمونه بردار <br />
                        {data?.SamplerSignature ? (
                          <Image
                            src={data?.SamplerSignature}
                            alt=""
                            width={80}
                            height={80}
                            className="mx-auto"
                          />
                        ) : (
                          <div className="w-20 h-20"></div>
                        )}
                      </td>
                      <td className="text-py-2 px-1 text-center text-xsm font-bold xs">
                        امضاء هماهنگ کننده و مهر شرکت بازرسی <br />
                        <div className="w-20 h-20"></div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-1 text-center text-xsm  ">
                        نام و نام خانوادگی: {data.ProductOwner}
                      </td>
                      <td className="py-2 px-1 text-center text-xsm ">
                        نام و نام خانوادگی: {data.SamplerName}
                      </td>
                      <td className="py-2 px-1 text-center text-xsm  ">
                        نام و نام خانوادگی: {data.Coordinator}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-4 text-xs">
              <div className="border-b border-black pb-2">
                <div className="flex justify-center items-center pb-1 gap-5">
                  <span className="ml-5">نسخه سفید: اداره استاندارد</span>
                  <span className="ml-5">نسخه قرمز مشتری</span>
                  <span className="ml-5">نسخه زرد: شرکت بازرسی</span>
                </div>
                <div>
                  <span className="font-bold">توجه:</span>
                  <span className="leading-5">
                    این فرم در سربرگ شرکت بازرسی تنظیم و جهت نمونه برداری یک
                    نمونه معتبر میباشد، درصورتیکه از محموله چندین نمونه اخذ گردد
                    بایستی در ملاحطات تعداد نمونه‌ها و نوع آنها مشخص گردد. ضمنا
                    چنانچه به دلایلی این گزارش نمونه برداری بدون امضاء ارزیاب
                    گمرک و نماینده صاحب کالا و نماینده انبارهای عمومی تنظیم گردد
                    و صرفا با مهر شرکت بازرسی و امضاء نمونه بردار با درج نام و
                    نام خانوادگی باشد معتبر خواهد بود.
                  </span>
                </div>
              </div>
              <div className="pt-2 leading-7">
                <div>
                  <span className="font-bold">آدرس دفتر تهران: </span>
                  زعفرانیه، خیابان پسیان، نبش جامی شرقی، پلاک ۲۸، ساختمان
                  پیدایش، واحد C شمالی
                  <span className="pr-5">
                    <svg
                      height="10"
                      viewBox="0 0 48 48"
                      width="10"
                      xmlns="http://www.w3.org/2000/svg"
                      className="rotate-90 inline"
                    >
                      <path d="M0 0h48v48H0z" fill="none" />
                      <path d="M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59L.59 26.18c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42C6.68 17.55 14.93 14 24 14s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21C30.3 18.5 27.21 18 24 18z" />
                    </svg>
                    ۹۱۳۰۴۵۰۰-۰۲۱
                  </span>
                </div>
                <div>
                  <span className="font-bold">آدرس شعبه گمرگ تهران:</span> پنجره
                  واحد تجاری، واحد ۱۲ <span className="pr-5">۰۹۱۹۵۲۳۹۸۸۷</span>
                  <span className="pr-5">
                    <svg
                      height="10"
                      viewBox="0 0 48 48"
                      width="10"
                      xmlns="http://www.w3.org/2000/svg"
                      className="rotate-90 inline"
                    >
                      <path d="M0 0h48v48H0z" fill="none" />
                      <path d="M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59L.59 26.18c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42C6.68 17.55 14.93 14 24 14s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21C30.3 18.5 27.21 18 24 18z" />
                    </svg>
                    ۰۲۱-۹۱۳۰۴۵۰۰ داخلی ۱۷۰
                  </span>
                </div>
                <div>
                  <span className="font-bold">آدرس شعبه بندرعباس:</span> خ
                  دانشگاه، ک دانشگاه ۲، ساختمان بانو، ط ۴، واحد ۴، تلفن تماس:
                  ۰۹۳۶۵۰۶۵۵۰۰
                  <span className="pr-5">
                    <svg
                      height="10"
                      viewBox="0 0 48 48"
                      width="10"
                      xmlns="http://www.w3.org/2000/svg"
                      className="rotate-90 inline"
                    >
                      <path d="M0 0h48v48H0z" fill="none" />
                      <path d="M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59L.59 26.18c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42C6.68 17.55 14.93 14 24 14s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21C30.3 18.5 27.21 18 24 18z" />
                    </svg>
                    ۰۷۶۳۳۶۲۱۵۵۳
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export function getDatesIngregorian(date: string): string {
  return moment(date, "MM-DD-YYYY").locale("fa").format("jYYYY/jMM/jDD");
}
