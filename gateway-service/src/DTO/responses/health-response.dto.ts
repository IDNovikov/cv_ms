import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDTO {
  @ApiProperty({
    example: 'ok',
  })
  public status: string;

  @ApiProperty({
    example: '2026-02-02T08:51:02.751Z',
  })
  public timeStamp: string;
}
