// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      provider?: string;
      providerId?: string;
      role?: string;
      ialLevel?: number;
      organization?: any;
    };
  }

  interface User {
    id: string;
    providerId?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    ialLevel?: number;
    organization?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    providerId?: string;
    role?: string;
    ialLevel?: number;
    organization?: any;
  }
}

// Mock users สำหรับ credentials login
const mockUsers = [
  {
    id: "mock_exec_001",
    providerId: "mock_exec_001",
    name: "นพ.พร้อม ใจบริการ (Mock)",
    email: "exec@example.com",
    role: "EXECUTIVE",
    ialLevel: 3.0,
    organization: {
      hname_th: "โรงพยาบาลตัวอย่าง",
      position: "ผู้อำนวยการโรงพยาบาล",
    },
  },
  {
    id: "mock_dept_001",
    providerId: "mock_dept_001",
    name: "พญ.สมใจ ดูแลดี (Mock)",
    email: "dept@example.com",
    role: "DEPT_HEAD",
    ialLevel: 2.8,
    organization: {
      hname_th: "โรงพยาบาลตัวอย่าง",
      position: "หัวหน้าแผนกเวชปฏิบัติ",
    },
  },
  {
    id: "mock_op_001",
    providerId: "mock_op_001",
    name: "นางสาวปฏิบัติ งานดี (Mock)",
    email: "operator@example.com",
    role: "OPERATOR",
    ialLevel: 2.5,
    organization: {
      hname_th: "โรงพยาบาลตัวอย่าง",
      position: "เจ้าหน้าที่พัสดุ",
    },
  },
  {
    id: "mock_group_001",
    providerId: "mock_group_001",
    name: "นายกลุ่ม งานนำ (Mock)",
    email: "group@example.com",
    role: "GROUP_HEAD",
    ialLevel: 2.7,
    organization: {
      hname_th: "โรงพยาบาลตัวอย่าง",
      position: "หัวหน้ากลุ่มงานพัสดุ",
    },
  },
];

// ตรวจสอบว่า Provider ID environment variables มีครบหรือไม่
const isProviderIdConfigured =
  process.env.PROVIDER_ID_URL &&
  process.env.PROVIDER_ID_CLIENT_ID &&
  process.env.PROVIDER_ID_CLIENT_SECRET;

console.log("Provider ID Configuration:", {
  hasUrl: !!process.env.PROVIDER_ID_URL,
  hasClientId: !!process.env.PROVIDER_ID_CLIENT_ID,
  hasClientSecret: !!process.env.PROVIDER_ID_CLIENT_SECRET,
  isConfigured: isProviderIdConfigured,
});

const providers = [
  // 1. Credentials Provider (สำหรับ mock login) - ใช้เป็นหลัก
  CredentialsProvider({
    id: "credentials",
    name: "Mock Login",
    credentials: {
      username: {
        label: "Username",
        type: "text",
        placeholder: "exec, dept, group, or op",
      },
      password: {
        label: "Password",
        type: "password",
        placeholder: "ใช้ password อะไรก็ได้",
      },
    },
    async authorize(credentials) {
      console.log("Credentials authorize called:", credentials);

      if (!credentials?.username) {
        console.log("No username provided");
        return null;
      }

      // Map username to mock user
      let user;
      switch (credentials.username.toLowerCase()) {
        case "exec":
          user = mockUsers[0];
          break;
        case "dept":
          user = mockUsers[1];
          break;
        case "group":
          user = mockUsers[3];
          break;
        case "op":
          user = mockUsers[2];
          break;
        default:
          console.log("Invalid username:", credentials.username);
          return null;
      }

      // สำหรับ mock login รับ password ใดๆ ก็ได้
      if (user) {
        console.log("Mock user found:", user);
        return user;
      }

      return null;
    },
  }),
];

// เพิ่ม Provider ID เฉพาะเมื่อ configure ครบ
if (isProviderIdConfigured) {
  providers.push({
    id: "provider-id",
    name: "Provider ID",
    type: "oauth",
    clientId: process.env.PROVIDER_ID_CLIENT_ID!,
    clientSecret: process.env.PROVIDER_ID_CLIENT_SECRET!,
    authorization: {
      url: `${process.env.PROVIDER_ID_URL}/v1/oauth2/authorize`,
      params: {
        response_type: "code",
        scope: "cid name_th name_eng email mobile_number organization",
      },
    },
    token: `${process.env.PROVIDER_ID_URL}/v1/oauth2/token`,
    userinfo: {
      url: `${process.env.PROVIDER_ID_URL}/api/v1/services/profile`,
      async request({ tokens, provider }) {
        try {
          const response = await fetch(
            `${process.env.PROVIDER_ID_URL}/api/v1/services/profile`,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "client-id": provider.clientId!,
                "secret-key": provider.clientSecret!,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user profile");
          }

          const profileData = await response.json();
          return profileData.data;
        } catch (error) {
          console.error("Error fetching provider profile:", error);
          throw error;
        }
      },
    },
    async profile(profile) {
      // สำหรับ demo ใช้ mock data แทน
      return {
        id: profile.account_id || "provider_user_001",
        providerId: profile.account_id,
        name: profile.name_th || "Provider ID User",
        email: profile.email || "provider@example.com",
        role: "OPERATOR",
        ialLevel: profile.ial_level || 2.5,
        organization: profile.organization?.[0] || {
          hname_th: "โรงพยาบาลจาก Provider ID",
          position: "บุคลากรทางการแพทย์",
        },
      };
    },
    checks: ["pkce", "state"],
  } as any);
} else {
  console.log("⚠️ Provider ID is not configured. Using Mock Login only.");
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      console.log("JWT callback:", { token, account, user });

      if (account) {
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
        token.providerId = user.providerId;
        token.role = user.role;
        token.ialLevel = user.ialLevel;
        token.organization = user.organization;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });

      if (session.user) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
        session.user.providerId = token.providerId as string;
        session.user.role = token.role as string;
        session.user.ialLevel = token.ialLevel as number;
        session.user.organization = token.organization as any;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn callback:", { user, account, profile });
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
