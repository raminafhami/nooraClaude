import { Equals } from 'class-validator';

// `confirm` must literally be true - this makes the "explicit user
// confirmation before final submission" requirement (spec 13) part of the
// API contract itself, not just a client-side dialog that could be skipped.
export class FinalizeResponseDto {
  @Equals(true)
  confirm: boolean;
}
