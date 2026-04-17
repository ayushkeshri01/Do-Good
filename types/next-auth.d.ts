import type { Role } from "./Role";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      points: number;
      adminMessage?: string | null;
    };
  }
}
