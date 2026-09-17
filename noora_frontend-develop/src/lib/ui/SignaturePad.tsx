import React, { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { PiSignature } from "react-icons/pi";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface SignaturePadProp {
  disabled?: boolean;
  setSignature: (Signature: string) => void;
  clearSignature?: () => void;
  signature?: string;
  containerClass?: string;
  buttonClass?: string;
}

const SignaturePad = ({
  disabled = false,
  setSignature,
  signature,
  clearSignature,
  containerClass,
  buttonClass,
}: SignaturePadProp) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const signatureCanvasRef = useRef<SignatureCanvas | null>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState<boolean>(true);

  const clear = () => {
    signatureCanvasRef.current?.clear();
    setIsSignatureEmpty(true);
    clearSignature && clearSignature();
  };
  const save = () => {
    const signatureImage = signatureCanvasRef.current?.toDataURL();
    signatureImage && setSignature(signatureImage);
    toast.success("امضا ذخیره شد");
    setIsModalOpen(false);
    setIsSignatureEmpty(true);
  };

  useEffect(() => {
    if (signatureCanvasRef.current && signature && isModalOpen) {
      signatureCanvasRef.current.fromDataURL(signature);
    } else {
      signatureCanvasRef.current?.clear();
    }
  }, [signature, isModalOpen]);

  return (
    <div>
      <div className={`${containerClass} flex items-center gap-2`}>
        <Button
          disabled={disabled}
          type="button"
          className={`${buttonClass} flex items-center gap-2 min-w-fit`}
          onClick={() => setIsModalOpen(true)}
        >
          <span className="inline-block min-w-fit">
            {signature ? "مشاهده امضا" : "افزودن امضا"}
          </span>
          <PiSignature className="block" size={18} />
        </Button>
        {signature && (
          <FaCheckCircle
            size={20}
            className="text-green-600  min-h-[20px] min-w-[20px]"
          />
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-white p-2 rounded-lg">
            <SignatureCanvas
              ref={signatureCanvasRef}
              penColor="#284283"
              canvasProps={{
                className: "signature-canvas bg-white",
                style: {
                  border: "2px solid gray",
                  borderRadius: "10px",
                  width: "350px",
                  height: "350px",
                },
              }}
              onBegin={() => setIsSignatureEmpty(true)}
              onEnd={() => setIsSignatureEmpty(false)}
            />
            <div className="flex gap-3 mt-2 justify-between">
              <div>
                <Button
                  type="button"
                  className="border text-black border-gray-400 mx-2 bg-gray-200 hover:bg-yellow-400"
                  variant="destructive"
                  onClick={clear}
                >
                  پاک کردن
                </Button>
                <Button
                  disabled={isSignatureEmpty}
                  type="button"
                  onClick={save}
                  className={`mx-2 !bg-gray-500 ${
                    !isSignatureEmpty && "!bg-blue-600 hover:!bg-blue-700"
                  }`}
                >
                  ذخیره کردن
                </Button>
              </div>
              <Button
                type="button"
                onClick={() => {
                  !signature && clear();
                  setIsModalOpen(false);
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                بستن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
