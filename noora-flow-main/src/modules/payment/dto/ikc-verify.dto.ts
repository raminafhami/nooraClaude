import { ApiProperty } from '@nestjs/swagger';

export class IKCVerifyDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  token: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  amount: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  paymentId: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  systemTraceAuditNumber: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  retrievalReferenceNumber: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  responseCode: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  requestId: string;
}
