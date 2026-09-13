import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CompanyLocationService } from '../company-location.service';

describe('CompanyLocationService', () => {
  const locationRepository = {
    create: jest.fn(),
    listByCompany: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  const companyRepository = {
    findById: jest.fn(),
    isAdmin: jest.fn(),
  };

  const service = new CompanyLocationService(
    locationRepository as never,
    companyRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists locations when the company exists', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    const locations = [{ id: 'location-1' }];
    locationRepository.listByCompany.mockResolvedValue(locations);

    await expect(service.listLocations('company-1')).resolves.toEqual(locations);
  });

  it('throws when listing locations for a company that does not exist', async () => {
    companyRepository.findById.mockResolvedValue(undefined);

    await expect(service.listLocations('missing')).rejects.toThrow(
      new NotFoundException('Company not found'),
    );
  });

  it('creates a location when the user manages the company', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const dto = { locationName: 'HQ', country: 'US' };
    const created = { id: 'location-1', ...dto };
    locationRepository.create.mockResolvedValue(created);

    await expect(service.createLocation('company-1', 'user-1', dto)).resolves.toEqual(created);
    expect(locationRepository.create).toHaveBeenCalledWith('company-1', dto);
  });

  it('throws when creating a location without admin rights', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(
      service.createLocation('company-1', 'user-2', { locationName: 'HQ', country: 'US' }),
    ).rejects.toThrow(new ForbiddenException('You do not manage this company'));

    expect(locationRepository.create).not.toHaveBeenCalled();
  });

  it('updates a location that exists', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    locationRepository.findById.mockResolvedValue({ id: 'location-1' });

    const updated = { id: 'location-1', locationName: 'Remote HQ' };
    locationRepository.updateById.mockResolvedValue(updated);

    await expect(
      service.updateLocation('company-1', 'location-1', 'user-1', { locationName: 'Remote HQ' }),
    ).resolves.toEqual(updated);
  });

  it('throws when updating a location that does not exist', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    locationRepository.findById.mockResolvedValue(undefined);

    await expect(
      service.updateLocation('company-1', 'missing', 'user-1', { locationName: 'Remote HQ' }),
    ).rejects.toThrow(new NotFoundException('Company location not found'));

    expect(locationRepository.updateById).not.toHaveBeenCalled();
  });

  it('deletes a location that exists', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    locationRepository.deleteById.mockResolvedValue(true);

    await expect(
      service.deleteLocation('company-1', 'location-1', 'user-1'),
    ).resolves.toBeUndefined();
  });

  it('throws when deleting a location that does not exist', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    locationRepository.deleteById.mockResolvedValue(false);

    await expect(service.deleteLocation('company-1', 'missing', 'user-1')).rejects.toThrow(
      new NotFoundException('Company location not found'),
    );
  });
});
