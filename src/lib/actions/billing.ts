"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function activatePremium(purchaseToken: string, productId: string) {
  const user = await requireUser();

  // Verifică token-ul cu Google Play Developer API
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/md.familie.organizator/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;

  const accessToken = await getGoogleAccessToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    return { error: "Verificarea plății a eșuat. Încearcă din nou." };
  }

  const data = await res.json();

  // paymentState: 1 = plătit, 2 = perioadă de probă gratuită
  if (data.paymentState !== 1 && data.paymentState !== 2) {
    return { error: "Plata nu a fost confirmată de Google." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isPremium: true },
  });

  return { success: true };
}

export async function deactivatePremium() {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { isPremium: false },
  });
}

async function getGoogleAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "{}");

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const header = { alg: "RS256", typ: "JWT" };
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsigned = `${encode(header)}.${encode(payload)}`;

  // Semnează cu cheia privată din service account
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(serviceAccount.private_key, "base64url");

  const jwt = `${unsigned}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}
