import { PrismaClient } from "@prisma/client";

import * as userService from "../src/domain/user/service";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: { login_name: "admin" },
  });

  if (!admin) {
    await prisma.user.create({
      data: await userService.create("admin", "admin"),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
