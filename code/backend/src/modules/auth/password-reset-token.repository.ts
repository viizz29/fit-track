import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PasswordResetToken } from './password-reset-token.model';

@Injectable()
export class PasswordResetTokenRepository {
  constructor(
    @InjectModel(PasswordResetToken)
    private model: typeof PasswordResetToken,
  ) {}

  async create(values: Partial<PasswordResetToken>): Promise<PasswordResetToken> {
    return this.model.create(values as any);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return this.model.findOne({ where: { token } });
  }

  async markUsed(id: string): Promise<void> {
    await this.model.update({ usedAt: new Date() }, { where: { id } });
  }

  async invalidatePreviousTokens(userId: string): Promise<void> {
    await this.model.update(
      { usedAt: new Date() },
      { where: { userId, usedAt: null } },
    );
  }
}
