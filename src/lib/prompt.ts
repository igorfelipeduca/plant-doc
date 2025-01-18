import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type DiagnosisResponse = {
  response: {
    messages: {
      content: {
        text: string;
      }[];
    }[];
  };
};

export type Diagnosis = {
  isHealthy: boolean;
  flowerIdentification: {
    species: string;
    latinName: string;
    description: string;
  };
  apparentDiseases: {
    name: string;
    symptoms: string;
    description: string;
  }[];
  careSolutions: {
    type: string;
    description: string;
  }[];
};

export const diagnoseFlower = async (
  image: string,
  language: string
): Promise<DiagnosisResponse> => {
  const prompt = `
Analyze the provided image of a flower and respond with a detailed JSON object containing the following information:

1. Identify the flower with:
   - Its common name in ${language} (for the "species" field)
   - Its scientific Latin name (binomial nomenclature) (for the "latinName" field)
2. List any apparent diseases or issues visible in the image, including detailed descriptions of each.
3. Identify if the plant is healthy or not.
4. Suggest solutions for plant care, including farming practices, fertilizers, medicines, or specific chemicals, with detailed descriptions for each solution.

Please format your response as a JSON object with the following structure:

{
  "isHealthy": boolean,
  "flowerIdentification": {
    "species": "", // Common name in ${language} (e.g., "Rose" in English, "Rosa" in Spanish)
    "latinName": "", // Scientific Latin name (e.g., "Rosa gallica")
    "description": ""
  },
  "apparentDiseases": [
    {
      "name": "",
      "symptoms": "",
      "description": ""
    }
  ],
  "careSolutions": [
    {
      "type": "",
      "description": ""
    }
  ]
}

For each disease, provide a clear description explaining what it is and how it affects the plant. For each care solution, provide detailed instructions on how to apply the solution.

Important: The "species" field should be the common name in ${language}, while the "latinName" field should always be the scientific Latin name in binomial nomenclature format. All other text should be in ${language}.
`;

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    maxTokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image",
            image: image,
          },
        ],
      },
    ],
  });

  return result as DiagnosisResponse;
};
