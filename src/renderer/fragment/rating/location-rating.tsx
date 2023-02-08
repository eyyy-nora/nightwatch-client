import { Rating } from "src/entity/rating";

export interface LocationRatingProps {
  rating: Rating;
  onRatingChange?(rating: Rating): void;
}
export function LocationRating({ rating, onRatingChange }: LocationRatingProps) {
  return;
}
