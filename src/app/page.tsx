"use client";

import { useRef, useState } from "react";
import SpinningFlower from "@/components/spinning-flower";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { StethoscopeIcon, Loader2, CheckIcon, XIcon } from "lucide-react";
import { diagnoseFlower, Diagnosis } from "@/lib/prompt";
import { toast } from "sonner";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<string>("en");
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

  const translations = {
    en: {
      captureButton: "Capture or upload your image",
      diagnoseButton: "Diagnose your plant",
      diagnosing: "Diagnosing...",
      replaceImage: "Replace image",
      analyzing: "Analyzing your plant...",
      waitingForImage:
        "Your plant diagnosis will be here after you upload an image...",
      species: "species",
      healthy: "Healthy",
      unhealthy: "Unhealthy",
      apparentDiseases: "Apparent diseases",
      careSolutions: "Care solutions",
      languageChangeMessage:
        "Language changed to English. If your diagnosis is ready, you'll have to run it again to see the changes.",
      commonName: "Common name",
      latinName: "Latin name",
    },
    es: {
      captureButton: "Captura o sube tu imagen",
      diagnoseButton: "Diagnostica tu planta",
      diagnosing: "Diagnosticando...",
      replaceImage: "Reemplazar imagen",
      analyzing: "Analizando tu planta...",
      waitingForImage:
        "El diagnóstico de tu planta aparecerá después de subir una imagen...",
      species: "especie",
      healthy: "Saludable",
      unhealthy: "No saludable",
      apparentDiseases: "Enfermedades aparentes",
      careSolutions: "Soluciones de cuidado",
      languageChangeMessage:
        "Idioma cambiado a Español. Si tu diagnóstico está listo, deberás ejecutarlo nuevamente para ver los cambios.",
      commonName: "Nombre común",
      latinName: "Nombre latino",
    },
    pt: {
      captureButton: "Capture ou envie sua imagem",
      diagnoseButton: "Diagnosticar sua planta",
      diagnosing: "Diagnosticando...",
      replaceImage: "Substituir imagem",
      analyzing: "Analisando sua planta...",
      waitingForImage:
        "O diagnóstico da sua planta aparecerá depois de enviar uma imagem...",
      species: "espécie",
      healthy: "Saudável",
      unhealthy: "Não saudável",
      apparentDiseases: "Doenças aparentes",
      careSolutions: "Soluções de cuidado",
      languageChangeMessage:
        "Idioma alterado para Português. Se seu diagnóstico estiver pronto, você precisará executá-lo novamente para ver as alterações.",
      commonName: "Nome comum",
      latinName: "Nome em latim",
    },
  };

  const onCaptureImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const onLanguageChange = (value: string) => {
    setLanguage(value);
    toast.info(
      translations[value as keyof typeof translations].languageChangeMessage,
      {
        action: {
          label: "OK",
          onClick: () => {},
        },
        className: "flex flex-col items-start text-[1rem] rounded-[1rem]",
      }
    );
  };

  const convertBlobToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  const onSubmit = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const base64Image = await convertBlobToBase64(selectedImage);
      const diagnosis = await diagnoseFlower(base64Image, language);

      const responseJSON = JSON.parse(
        diagnosis.response.messages[0].content[0].text.replace(
          /```json|```/g,
          ""
        )
      );

      console.log({ diagnosis, responseJSON });

      setDiagnosis(responseJSON);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-x-16 w-full max-w-[1200px]">
        <div className="w-full md:hidden">
          <Select
            onValueChange={onLanguageChange}
            value={language}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-zinc-800 border-none text-white py-[1.5rem] rounded-[1rem] dark text-[1rem] font-semibold">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full h-[30rem] md:h-[44rem] md:w-[60rem] rounded-[1rem] bg-zinc-700 flex items-center justify-center">
          {!selectedImage ? (
            <button
              type="button"
              aria-label={
                translations[language as keyof typeof translations]
                  .captureButton
              }
              className="flex flex-col gap-y-8 items-center"
              onClick={onCaptureImage}
            >
              <SpinningFlower />
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-zinc-300 font-bold text-md"
              >
                {
                  translations[language as keyof typeof translations]
                    .captureButton
                }
              </motion.span>
            </button>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="Selected"
                className="h-full w-full object-cover rounded-[1rem]"
                width={600}
                height={500}
              />
              <div className="absolute inset-0 backdrop-blur-sm rounded-[1rem]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="flex flex-col gap-y-2 items-center">
                  <motion.button
                    type="button"
                    className="rounded-[1rem] flex flex-col sm:flex-row items-center gap-x-2 bg-white text-black font-semibold text-[1.3rem] px-4 py-2 hover:bg-zinc-200 transition-colors duration-300"
                    onClick={onSubmit}
                    disabled={isLoading}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <StethoscopeIcon className="w-6 h-6" />
                    )}
                    {isLoading
                      ? translations[language as keyof typeof translations]
                          .diagnosing
                      : translations[language as keyof typeof translations]
                          .diagnoseButton}
                  </motion.button>

                  <button
                    type="button"
                    className="font-semibold text-[1rem] bg-transparent border-none text-white"
                    onClick={() => {
                      setSelectedImage(null);
                      setDiagnosis(null);
                      // Reset the file input or else reuploading the same image will not trigger handleFileChange
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    disabled={isLoading}
                  >
                    {
                      translations[language as keyof typeof translations]
                        .replaceImage
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex flex-col gap-y-4">
          <div className="hidden md:block">
            <Select
              onValueChange={onLanguageChange}
              value={language}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-zinc-800 border-none text-white w-[20rem] py-[1.5rem] rounded-[1rem] dark text-[1rem] font-semibold">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <motion.div
            className={`w-full md:w-[20rem] rounded-[1rem] bg-zinc-800 px-4 md:h-[40rem] md:overflow-y-auto ${
              !diagnosis ? "py-[5rem]" : "p-8"
            }`}
            animate={{
              scale: isLoading ? [1, 1.02, 1] : 1,
              transition: {
                duration: 1.5,
                repeat: isLoading ? Infinity : 0,
                ease: "easeInOut",
              },
            }}
          >
            <span className="text-zinc-300 font-bold text-md text-center">
              {!diagnosis ? (
                <>
                  {isLoading
                    ? translations[language as keyof typeof translations]
                        .analyzing
                    : translations[language as keyof typeof translations]
                        .waitingForImage}
                </>
              ) : (
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col">
                    <div className="flex flex-col">
                      <span className="text-[0.7rem] text-left font-light uppercase">
                        {
                          translations[language as keyof typeof translations]
                            .commonName
                        }
                      </span>
                      <h1 className="text-[1rem] font-bold text-white text-left">
                        {diagnosis.flowerIdentification.species}
                      </h1>

                      <span className="text-[0.7rem] mt-4 text-left font-light uppercase">
                        {
                          translations[language as keyof typeof translations]
                            .latinName
                        }
                      </span>
                      <h1 className="text-[1rem] font-bold text-left text-white">
                        {diagnosis.flowerIdentification.latinName}
                      </h1>
                    </div>

                    <div
                      className={`rounded-[1rem] py-2 px-4 mt-4 flex items-center justify-center gap-x-2 ${
                        diagnosis.isHealthy ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {diagnosis.isHealthy ? (
                        <CheckIcon className={`w-5 h-5 text-white`} />
                      ) : (
                        <XIcon className={`w-5 h-5 text-white`} />
                      )}

                      <span className={`font-bold text-md text-white`}>
                        {diagnosis.isHealthy
                          ? translations[language as keyof typeof translations]
                              .healthy
                          : translations[language as keyof typeof translations]
                              .unhealthy}
                      </span>
                    </div>
                  </div>

                  <h3 className="italic text-zinc-300 font-light text-[0.8rem] text-left">
                    {diagnosis.flowerIdentification.description}
                  </h3>

                  {!diagnosis.isHealthy && diagnosis.apparentDiseases && (
                    <div className="flex flex-col gap-y-2 items-start mt-4">
                      <h3 className="text-white font-bold text-[1rem]">
                        {
                          translations[language as keyof typeof translations]
                            .apparentDiseases
                        }
                      </h3>

                      <div className="flex flex-col gap-y-2">
                        {diagnosis.apparentDiseases.map((disease) => (
                          <div className="flex flex-col" key={disease.name}>
                            <h3 className="text-left font-medium text-zinc-400 text-[1rem]">
                              {disease.name}
                            </h3>
                            <p className="text-left text-zinc-500 text-[0.9rem]">
                              {disease.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagnosis.careSolutions && (
                    <div className="flex flex-col gap-y-2 items-start mt-4">
                      <h3 className="text-white font-bold text-[1rem]">
                        {
                          translations[language as keyof typeof translations]
                            .careSolutions
                        }
                      </h3>

                      <div className="flex flex-col gap-y-4">
                        {diagnosis.careSolutions.map((solution) => (
                          <div className="flex flex-col" key={solution.type}>
                            <h3 className="text-left font-medium text-zinc-300 text-[1rem]">
                              {solution.type}
                            </h3>
                            <p className="text-left text-zinc-500 font-medium text-[0.9rem]">
                              {solution.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
