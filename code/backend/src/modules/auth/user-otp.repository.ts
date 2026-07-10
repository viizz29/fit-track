import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserOtp } from './user-otp.model';
import { Op } from 'sequelize';

@Injectable()
export class UserOtpRepository {
  constructor(
    @InjectModel(UserOtp)
    private model: typeof UserOtp,
  ) {}

  async create(values: Partial<UserOtp>): Promise<UserOtp> {
    return this.model.create(values as any);
  }

  async findValidByUserIdAndOtp(
    userId: string,
    otp: string,
    type: string = 'login_2fa',
  ): Promise<UserOtp | null> {
    return this.model.findOne({
      where: {
        userId,
        otp,
        type,
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      raw: true,
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.model.update({ usedAt: new Date() }, { where: { id } });
  }

  async invalidatePrevious(userId: string, type: string): Promise<void> {
    await this.model.update(
      { usedAt: new Date() },
      { where: { userId, type, usedAt: null } },
    );
  }
}
