import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const encoder = new TextEncoder();

async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }

  return difference === 0;
}

async function isValidAccessCode(value: unknown) {
  const expectedAccessCode = process.env.UPLOAD_ACCESS_CODE;
  if (typeof value !== "string" || !expectedAccessCode) return false;

  const [provided, expected] = await Promise.all([
    digest(value),
    digest(expectedAccessCode),
  ]);
  return equalBytes(provided, expected);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/upload/login",
  },
  providers: [
    Credentials({
      credentials: {
        accessCode: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        if (!(await isValidAccessCode(credentials.accessCode))) return null;

        return {
          id: "upload-admin",
          name: "Upload administrator",
        };
      },
    }),
  ],
});
