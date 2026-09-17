import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";

import checkUserCaptcha from "./service/checkUserCaptcha";

interface Props {
  isVerify: boolean;
  onVerify: (v: boolean) => void;
}

export default function GoogleCaptcha({ isVerify, onVerify }: Props) {
  const { NEXT_PUBLIC_CAPTCHA_KEY } = process.env;
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  async function checkVerify(clientCode: string | null) {
    console.log(clientCode);
    
    if (!clientCode) {
      // No client code means the CAPTCHA wasn't completed, set verify to false
      onVerify(false);
      return;
    }

    try {
      let res = await checkUserCaptcha({ clientCode });
      // If the response is successful, set verify to true
      if (res?.result?.success) {
        onVerify(res?.result?.success);
      } else {
        onVerify(false);
        toast.error("توکن نامعتبر است!");
        recaptchaRef.current?.reset(); // Reset CAPTCHA on failure
      }
    } catch (e: any) {
      console.log(e);
      onVerify(false);
      toast.error("خطایی رخ داده است!");
      recaptchaRef.current?.reset(); // Reset CAPTCHA on error
    }
  }

  return (
    <>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={
          NEXT_PUBLIC_CAPTCHA_KEY || "6LdxFz0qAAAAAPhufpbw4C3ivVAqSAswLk2JSe4T" // Fallback site key
        }
        onChange={checkVerify} // Check verification when CAPTCHA is completed
      />
    </>
  );
}
