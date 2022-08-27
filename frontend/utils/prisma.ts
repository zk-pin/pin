// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({ log: ["query"] });
  }
  prisma = global.prisma;
}

export default prisma;

// recommended config by prisma docs, but next build fails
/*
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
declare global {
  // allow global `var` declarations
  // @ts-ignore eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export default prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
*/
