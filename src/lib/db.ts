import "server-only";
import { MongoClient, type Binary, type Db, type ObjectId } from "mongodb";

export type UserDoc = {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: Date;
};

export type LinkDoc = {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  url: string;
  order: number;
  clickCount: number;
  createdAt: Date;
};

export type AvatarDoc = {
  _id: ObjectId; // = userId
  data: Binary;
  contentType: string;
  updatedAt: Date;
};

type Cache = {
  client?: MongoClient;
  ready?: Promise<Db>;
};

// 개발 모드 HMR에서도 커넥션을 재사용하도록 global에 보관
const globalForMongo = globalThis as unknown as { __mongo?: Cache };
const cache: Cache = (globalForMongo.__mongo ??= {});

async function init(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다. .env.local을 확인하세요.");
  }
  cache.client ??= new MongoClient(uri);
  await cache.client.connect();
  const db = cache.client.db(process.env.MONGODB_DB || "linknamu");

  await Promise.all([
    db.collection<UserDoc>("users").createIndex({ email: 1 }, { unique: true }),
    db.collection<UserDoc>("users").createIndex({ username: 1 }, { unique: true }),
    db.collection<LinkDoc>("links").createIndex({ userId: 1, order: 1 }),
  ]);
  return db;
}

export async function getDb(): Promise<Db> {
  cache.ready ??= init().catch((err) => {
    cache.ready = undefined; // 실패 시 다음 요청에서 재시도
    throw err;
  });
  return cache.ready;
}

export async function collections() {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    links: db.collection<LinkDoc>("links"),
    avatars: db.collection<AvatarDoc>("avatars"),
  };
}
