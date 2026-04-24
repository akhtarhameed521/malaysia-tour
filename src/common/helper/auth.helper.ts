import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { UserRoles } from "@types";

export const jwtSign = (
  id: number,
  employeeId: string,
  fullName: string
) => {
  return jwt.sign(
    { id, employeeId, fullName },
    process.env.JWT_SECRET,
    { expiresIn: "1y" }
  );
};

export const jwtVerify = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET) as {
    id: number;
    employeeId: string;
    fullName: string;
  };
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string, count: number) => {
  return bcrypt.hash(password, count);
};