import { BaseRepository } from '../../common/base.repository';
import { ReviewModel, IReview } from './review.model';

export class ReviewRepository extends BaseRepository<IReview> {
  constructor() {
    super(ReviewModel);
  }

  async findByProduct(productId: string) {
    return this.find({ product: productId, deleted: false });
  }
}

export const reviewRepository = new ReviewRepository();
