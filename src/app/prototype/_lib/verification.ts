import { protoFetch } from "./api";
import type { VerificationRequest } from "./types";

export async function getMyVerificationRequest() {
  return (await protoFetch<VerificationRequest | null>("/verification-requests/me")).data;
}

export async function createVerificationRequest(input: {
  display_name: string;
  proof_link: string;
  note?: string;
}) {
  return (
    await protoFetch<VerificationRequest>("/verification-requests", {
      method: "POST",
      body: JSON.stringify(input),
    })
  ).data;
}
