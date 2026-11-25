import { validateSync } from 'class-validator';
import { DevicePlatform, RegisterDeviceDto } from './register-device.dto';

describe('RegisterDeviceDto', () => {
  it('accepts a token of 255 characters', () => {
    const dto = Object.assign(new RegisterDeviceDto(), {
      token: 't'.repeat(255),
      platform: DevicePlatform.ANDROID,
    });

    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects a token longer than the database column', () => {
    const dto = Object.assign(new RegisterDeviceDto(), {
      token: 't'.repeat(256),
      platform: DevicePlatform.ANDROID,
    });

    expect(
      validateSync(dto).some(
        ({ property, constraints }) =>
          property === 'token' && Boolean(constraints?.maxLength),
      ),
    ).toBe(true);
  });
});
