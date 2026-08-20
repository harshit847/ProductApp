// Password helpers keep hashing and comparison details out of the services.
import bcrypt from "bcryptjs";

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
