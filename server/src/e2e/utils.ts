import { prisma } from "../libs/prisma";
import { hashedPassword } from "../utils/helpers/bcrypt";

export class UserTest {
  static async findUserTest() {
    const user = await prisma.user.findFirst({
      where: {
        email: "bianskiza@gmail.com",
      },
    });
    return user;
  }

  static async createUserTest() {
    await prisma.user.create({
      data: {
        email: "bianskiza@gmail.com",
        username: "test",
        password: hashedPassword("testtest"),
        isVerified: true,
        userToken: { create: { verification_token: "123456" } },
      },
    });
  }

  static async deleteUserTest() {
    const user = await prisma.user.findFirst({
      where: {
        email: "bianskiza@gmail.com",
      },
    });
    await prisma.userToken.delete({ where: { userId: user?.id } });
    await prisma.user.delete({ where: { email: "bianskiza@gmail.com" } });
  }
}
