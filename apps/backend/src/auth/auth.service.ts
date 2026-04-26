import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async login(dto: LoginDto) {
    const credentials = {
      email: dto.email.trim().toLowerCase(),
      password: dto.password
    };
    const databaseUser = await this.findDatabaseUser(credentials).catch(() => null);

    if (databaseUser) {
      return this.createLoginResponse(databaseUser);
    }

    const demoUser = this.findDemoUser(credentials);

    if (!demoUser) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.createLoginResponse(demoUser);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name.trim(),
        role: dto.role ?? "user"
      }
    });

    return this.createLoginResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId
    });
  }

  private async findDatabaseUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user || !user.isActive) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId
    };
  }

  private findDemoUser(dto: LoginDto) {
    const isDemoAdmin = dto.email === "admin@erp.local" && dto.password === "admin123";

    if (!isDemoAdmin) {
      return null;
    }

    return {
      id: "admin",
      email: dto.email,
      name: "Admin",
      role: "super_admin",
      departmentId: null
    };
  }

  private createLoginResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    departmentId?: string | null;
  }) {
    return {
      user,
      accessToken: this.jwtService.sign(user)
    };
  }
}
