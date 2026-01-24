// filepath: src/controllers/admin-controller.ts
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AdminService } from '../services/admin-service.js';
import { CustomError } from '../middleware/errorHandler.js';

export class AdminController {
  private readonly _adminService: AdminService;

  constructor(adminService: AdminService) {
    this._adminService = adminService;
  }

  /**
   * GET /api/v1/admin/roles
   * Fetches all defined system roles.
   */
  public getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await this._adminService.getAllRoles();
      res.status(httpStatus.OK).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/users
   * Lists all users with their assigned roles.
   */
  public getAllUsersWithRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this._adminService.getUsersDashboardData();
      res.status(httpStatus.OK).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/users/:id
   * Retrieves a single user and their roles.
   */
  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this._adminService.getUserDetails(req.params.id);
      if (!user) {
        const error = new Error('User not found') as CustomError;
        error.statusCode = httpStatus.NOT_FOUND;
        throw error;
      }
      res.status(httpStatus.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/admin/user-roles
   * Links a user to a specific role.
   */
  public assignRoleToUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, roleId } = req.body;
      const assignment = await this._adminService.assignRoleToUser({ user_id: userId, role_id: roleId });
      res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Role assigned successfully',
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/user-roles/:id
   * Updates an existing user-role junction record.
   */
  public updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;

      const updated = await this._adminService.assignRoleToUser({ role_id: req.params.id, user_id: userId });
      res.status(httpStatus.OK).json({
        success: true,
        message: 'User role updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/admin/user-roles/:id
   * Removes a role from a user.
   */
  public removeRoleFromUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const deleted = await this._adminService.removeRoleFromUser(userId, req.params.id);
      if (!deleted) {
        const error = new Error('User-role assignment not found') as CustomError;
        error.statusCode = httpStatus.NOT_FOUND;
        throw error;
      }
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Role removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
