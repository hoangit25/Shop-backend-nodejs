import { BaseRepository } from '../../common/base.repository';
import { VoucherModel, IVoucher } from './voucher.model';

export class VoucherRepository extends BaseRepository<IVoucher> {
  constructor() {
    super(VoucherModel);
  }

  async findByCode(code: string) {
    return this.findOne({ code, deleted: false, isActive: true });
  }
}

export const voucherRepository = new VoucherRepository();
