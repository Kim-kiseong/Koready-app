import { client } from './client';
import type { NextStep } from './types';

export type RequiredTermItem = {
  termId: number;
  termVersionId: number;
  code: string;
  title: string;
  required: boolean;
  version: string;
  contentUrl: string;
  agreed: boolean;
  needsAgreement: boolean;
  displayOrder: number;
};

export type TermsRequiredResponse = {
  terms: RequiredTermItem[];
  allRequiredAgreed: boolean;
};

type TermsRequiredEnvelope = {
  success: true;
  code: string;
  message: string;
  data: TermsRequiredResponse;
  traceId: string;
};

// GET /terms/required — called when nextStep=TERMS or re-entering this screen.
export async function fetchRequiredTerms(): Promise<TermsRequiredResponse> {
  const response = await client.get<TermsRequiredEnvelope>('/terms/required');
  return response.data.data;
}

export type TermAgreementInput = {
  termVersionId: number;
  agreed: boolean;
};

export type TermAgreementItem = {
  termVersionId: number;
  code: string;
  required: boolean;
  agreed: boolean;
  agreedAt: string | null;
};

export type TermAgreementResponse = {
  agreements: TermAgreementItem[];
  allRequiredAgreed: true;
  nextStep: NextStep;
};

type TermAgreementEnvelope = {
  success: true;
  code: string;
  message: string;
  data: TermAgreementResponse;
  traceId: string;
};

// PUT /users/me/term-agreements — called on "다음". Rejects with 422
// REQUIRED_TERMS_NOT_AGREED if a required term is missing from the payload.
export async function submitTermAgreements(
  agreements: TermAgreementInput[],
): Promise<TermAgreementResponse> {
  const response = await client.put<TermAgreementEnvelope>('/users/me/term-agreements', {
    agreements,
  });
  return response.data.data;
}
