// ==========================================
// /api/auth - 简易邮箱登录 + 匿名游客
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { createUser, createAnonymousUser, getUserByEmail, getUserById } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "tongwei-universe-secret-key-change-me"
);

const COOKIE_NAME = "user_token";
const USER_ID_COOKIE = "user_id";

async function generateToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.sub || null;
  } catch {
    return null;
  }
}

function setAuthCookies(response: NextResponse, token: string, userId: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  response.cookies.set(USER_ID_COOKIE, userId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "anonymous": {
        const user = await createAnonymousUser();
        const token = await generateToken(user.id);
        const response = NextResponse.json({
          success: true,
          data: { user, token },
        });
        setAuthCookies(response, token, user.id);
        return response;
      }

      case "register": {
        const { email, password, nickname } = body;
        if (!email || !password) {
          return NextResponse.json(
            { success: false, error: "邮箱和密码不能为空" },
            { status: 400 }
          );
        }

        const existing = await getUserByEmail(email).catch(() => null);
        if (existing) {
          return NextResponse.json(
            { success: false, error: "该邮箱已注册" },
            { status: 409 }
          );
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await createUser(email, passwordHash, nickname);
        const token = await generateToken(user.id);

        const response = NextResponse.json({
          success: true,
          data: { user, token },
        });
        setAuthCookies(response, token, user.id);
        return response;
      }

      case "login": {
        const { email, password } = body;
        if (!email || !password) {
          return NextResponse.json(
            { success: false, error: "邮箱和密码不能为空" },
            { status: 400 }
          );
        }

        const user = await getUserByEmail(email).catch(() => null);
        if (!user) {
          return NextResponse.json(
            { success: false, error: "邮箱未注册" },
            { status: 401 }
          );
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return NextResponse.json(
            { success: false, error: "密码错误" },
            { status: 401 }
          );
        }

        const token = await generateToken(user.id);
        const response = NextResponse.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              nickname: user.nickname,
              isAnonymous: user.isAnonymous,
              createdAt: user.createdAt,
            },
            token,
          },
        });
        setAuthCookies(response, token, user.id);
        return response;
      }

      case "verify": {
        const token = req.cookies.get(COOKIE_NAME)?.value || body.token;
        if (!token) {
          return NextResponse.json(
            { success: false, error: "未登录" },
            { status: 401 }
          );
        }

        const userId = await verifyToken(token);
        if (!userId) {
          return NextResponse.json(
            { success: false, error: "token无效" },
            { status: 401 }
          );
        }

        const user = await getUserById(userId).catch(() => null);
        if (!user) {
          return NextResponse.json(
            { success: false, error: "用户不存在" },
            { status: 401 }
          );
        }

        return NextResponse.json({ success: true, data: { user } });
      }

      case "logout": {
        const response = NextResponse.json({ success: true });
        response.cookies.delete(COOKIE_NAME);
        response.cookies.delete(USER_ID_COOKIE);
        return response;
      }

      default:
        return NextResponse.json(
          { success: false, error: "未知操作" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "认证失败" },
      { status: 500 }
    );
  }
}
