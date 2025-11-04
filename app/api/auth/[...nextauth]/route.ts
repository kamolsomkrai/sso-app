import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- 1. Type Augmentation สำหรับ NextAuth ---
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      provider?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
  }
}

// --- 2. Interfaces สำหรับ Profile Response ---
interface HealthIdProfileData {
  account_id: string;
  first_name_th: string;
  last_name_th: string;
}

interface HealthIdProfileResponse {
  data: HealthIdProfileData;
}

interface ProviderIdProfileData {
  account_id: string;
  name_th: string;
  email?: string;
}

interface ProviderIdProfileResponse {
  data: ProviderIdProfileData;
}

// --- 3. การดึงและตรวจสอบ Environment Variables ---
const {
  HEALTHID_CLIENT_ID,
  HEALTHID_CLIENT_SECRET,
  PROVIDER_ID_CLIENT_ID,
  PROVIDER_ID_CLIENT_SECRET,
} = process.env;

if (
  !HEALTHID_CLIENT_ID ||
  !HEALTHID_CLIENT_SECRET ||
  !PROVIDER_ID_CLIENT_ID ||
  !PROVIDER_ID_CLIENT_SECRET
) {
  throw new Error(
    "Missing required environment variables for Auth providers. Please check your .env.local file."
  );
}

const HEALTHID_UAT_URL = "https://uat-moph.id.th";
const PROVIDER_ID_UAT_URL = "https://uat-provider.id.th";

// --- 4. การตั้งค่า authOptions หลัก ---
export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Credentials Provider (Username/Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.username === "admin" &&
          credentials?.password === "password123"
        ) {
          return { id: "1", name: "Admin User", email: "admin@example.com" };
        }
        return null;
      },
    }),

    // 2. HealthID Provider (Custom OAuth)
    {
      id: "healthid",
      name: "Health ID",
      type: "oauth",
      clientId: HEALTHID_CLIENT_ID,
      clientSecret: HEALTHID_CLIENT_SECRET,
      authorization: {
        url: `${HEALTHID_UAT_URL}/oauth/redirect`,
        params: { response_type: "code" },
      },
      token: `${HEALTHID_UAT_URL}/api/v1/token`,
      userinfo: `${HEALTHID_UAT_URL}/go-api/v1/profile`,
      profile(profile: HealthIdProfileResponse) {
        return {
          id: profile.data.account_id,
          name: `${profile.data.first_name_th} ${profile.data.last_name_th}`,
          email: null,
          image: null,
        };
      },
      checks: ["pkce", "state"],
    },

    // 3. Provider ID Provider (Custom OAuth)
    {
      id: "provider-id",
      name: "Provider ID",
      type: "oauth",
      clientId: PROVIDER_ID_CLIENT_ID,
      clientSecret: PROVIDER_ID_CLIENT_SECRET,
      authorization: {
        url: `${PROVIDER_ID_UAT_URL}/v1/oauth2/authorize`,
        params: {
          response_type: "code",
          scope: "cid name_th name_eng email mobile_number",
        },
      },
      token: `${PROVIDER_ID_UAT_URL}/v1/oauth2/token`,
      userinfo: {
        url: `${PROVIDER_ID_UAT_URL}/api/v1/services/profile`,
        async request(context) {
          const url = `${PROVIDER_ID_UAT_URL}/api/v1/services/profile`;

          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
              "client-id": context.provider.clientId!,
              "secret-key": context.provider.clientSecret!,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
              `Failed to fetch Provider ID profile: ${res.status} ${errorText}`
            );
          }

          return await res.json();
        },
      },
      profile(profile: ProviderIdProfileResponse) {
        return {
          id: profile.data.account_id,
          name: profile.data.name_th || null,
          email: profile.data.email || null,
          image: null,
        };
      },
      checks: ["pkce", "state"],
    },
  ],

  // --- 5. Session และ Callbacks ---
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.provider) {
          session.user.provider = token.provider;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
