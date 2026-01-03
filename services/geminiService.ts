
import { GoogleGenAI, Type } from "@google/genai";
import { ZhugeLiangAdvice, BookPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDailyAdvice = async (date: string): Promise<ZhugeLiangAdvice> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `당신은 천재 전략가 제갈량입니다. 2026년 1월 ${date}를 맞이하여, 책을 쓰고 있는 주인공에게 오늘의 조언을 해주세요.
    1. 오늘 할 일 (전략적 제언)
    2. 조심해야 할 일 (경고)
    3. 책 완성을 위한 동기부여 문구
    
    답변은 반드시 한국어로 하며, 점잖고 지혜로운 말투를 사용하십시오.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          todo: { type: Type.STRING },
          caution: { type: Type.STRING },
          motivation: { type: Type.STRING }
        },
        required: ["todo", "caution", "motivation"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as ZhugeLiangAdvice;
};

export const getBookWritingPlan = async (): Promise<BookPlan> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `당신은 천재 전략가 제갈량입니다. 2026년 1월 1일부터 1월 31일까지 한 달 안에 책 한 권을 완벽하게 탈고하기 위한 상세 계획표를 짜주세요.
    날짜별로 핵심 작업 내용을 하나씩 제시하십시오. 
    형식은 JSON 객체이며 키는 "2026-01-01"부터 "2026-01-31"까지의 날짜이고, 값은 해당 날짜의 집필 과업입니다.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        additionalProperties: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || '{}') as BookPlan;
};
