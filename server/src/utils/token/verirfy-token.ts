import dayjs from "dayjs";
import * as jwt from "jsonwebtoken";

export const generateVerifyAccountToken = () => {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenExp = dayjs().add(1, "hour").toDate();
  return { token, tokenExp };
};

export const generateResetPasswordToken = (email: string) => {
  const tokenExp = dayjs().add(1, "hour").toDate();
  const token = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "1h",
  });
  return { token, tokenExp };
};
