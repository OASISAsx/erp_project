import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { AuthenticatedRequest, JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminService } from "./admin.service";
import {
  AssignUserDepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentMenuPermissionsDto
} from "./dto";

@Controller("admin")
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  findUsers(@Req() request: AuthenticatedRequest) {
    return this.adminService.findUsers(request.user);
  }

  @Patch("users/:id/department")
  assignUserDepartment(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: AssignUserDepartmentDto
  ) {
    return this.adminService.assignUserDepartment(request.user, id, dto);
  }

  @Get("departments")
  findDepartments(@Req() request: AuthenticatedRequest) {
    return this.adminService.findDepartments(request.user);
  }

  @Post("departments")
  createDepartment(@Req() request: AuthenticatedRequest, @Body() dto: CreateDepartmentDto) {
    return this.adminService.createDepartment(request.user, dto);
  }

  @Get("menu-permissions")
  findMenuPermissions(@Req() request: AuthenticatedRequest, @Query("departmentId") departmentId: string) {
    return this.adminService.findMenuPermissions(request.user, departmentId);
  }

  @Put("menu-permissions/:departmentId")
  updateMenuPermissions(
    @Req() request: AuthenticatedRequest,
    @Param("departmentId") departmentId: string,
    @Body() dto: UpdateDepartmentMenuPermissionsDto
  ) {
    return this.adminService.updateMenuPermissions(request.user, departmentId, dto);
  }
}
