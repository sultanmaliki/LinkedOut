import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { CompanyLocationController } from '../company-location.controller';
import { CompanyLocationService } from '../company-location.service';

describe('CompanyLocationController', () => {
  let controller: CompanyLocationController;

  const locationService = {
    listLocations: jest.fn(),
    createLocation: jest.fn(),
    updateLocation: jest.fn(),
    deleteLocation: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyLocationController],
      providers: [
        {
          provide: CompanyLocationService,
          useValue: locationService,
        },
      ],
    }).compile();

    controller = module.get<CompanyLocationController>(CompanyLocationController);
  });

  it('lists locations for a company', async () => {
    const locations = [{ id: 'location-1' }];
    locationService.listLocations.mockResolvedValue(locations);

    await expect(controller.listLocations('company-1')).resolves.toEqual(locations);
    expect(locationService.listLocations).toHaveBeenCalledWith('company-1');
  });

  it('creates a location for the authenticated user', async () => {
    const dto = { locationName: 'HQ', country: 'US' };
    const created = { id: 'location-1', ...dto };
    locationService.createLocation.mockResolvedValue(created);

    await expect(controller.createLocation('company-1', user, dto)).resolves.toEqual(created);
    expect(locationService.createLocation).toHaveBeenCalledWith('company-1', 'user-1', dto);
  });

  it('updates a location for the authenticated user', async () => {
    const dto = { locationName: 'Remote HQ' };
    const updated = { id: 'location-1', ...dto };
    locationService.updateLocation.mockResolvedValue(updated);

    await expect(controller.updateLocation('company-1', 'location-1', user, dto)).resolves.toEqual(
      updated,
    );
    expect(locationService.updateLocation).toHaveBeenCalledWith(
      'company-1',
      'location-1',
      'user-1',
      dto,
    );
  });

  it('deletes a location for the authenticated user', async () => {
    locationService.deleteLocation.mockResolvedValue(undefined);

    await controller.deleteLocation('company-1', 'location-1', user);

    expect(locationService.deleteLocation).toHaveBeenCalledWith(
      'company-1',
      'location-1',
      'user-1',
    );
  });
});
