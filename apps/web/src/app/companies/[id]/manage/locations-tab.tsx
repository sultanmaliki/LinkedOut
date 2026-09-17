'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useConfirmDialog } from '@/lib/use-confirm-dialog';
import type { CompanyLocation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';

export function LocationsTab({ companyId, token }: { companyId: string; token: string }) {
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { requestConfirm, dialog } = useConfirmDialog();

  function load() {
    apiFetch<CompanyLocation[]>(`/companies/${companyId}/locations`)
      .then(setLocations)
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [companyId]);

  async function handleDelete(locationId: string) {
    await apiFetch(`/companies/${companyId}/locations/${locationId}`, {
      method: 'DELETE',
      token,
    });
    load();
  }

  function confirmDelete(location: CompanyLocation) {
    requestConfirm({
      title: 'Delete location?',
      description: `"${location.locationName}" will be removed from your company profile.`,
      onConfirm: () => handleDelete(location.id),
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[14px] text-fg-muted">Where your company operates.</p>
        {!isAdding && (
          <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            <Plus className="h-3.5 w-3.5" /> Add location
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4">
          <AddLocationForm
            companyId={companyId}
            token={token}
            onCancel={() => setIsAdding(false)}
            onSaved={() => {
              setIsAdding(false);
              load();
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-canvas" />
      ) : locations.length === 0 ? (
        <p className="text-[14px] text-fg-faint">No locations added yet.</p>
      ) : (
        <div className="space-y-3">
          {locations.map((location) => (
            <Card key={location.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-fg-faint" />
                <div>
                  <p className="text-[14px] font-medium text-fg">{location.locationName}</p>
                  <div className="mt-0.5 flex gap-1.5">
                    {location.isHeadquarters && <Badge tone="emerald">HQ</Badge>}
                    {location.isRemote && <Badge>Remote</Badge>}
                    <span className="text-[12.5px] text-fg-faint">
                      {[location.city, location.state, location.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => confirmDelete(location)}
                className="rounded-lg p-2 text-fg-faint hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-600/10"
                aria-label="Delete location"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
      {dialog}
    </div>
  );
}

function AddLocationForm({
  companyId,
  token,
  onCancel,
  onSaved,
}: {
  companyId: string;
  token: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [locationName, setLocationName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/companies/${companyId}/locations`, {
        method: 'POST',
        token,
        body: { locationName, country, city: city || undefined, isRemote, isHeadquarters },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add location');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="locationName">Label</Label>
              <Input
                id="locationName"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Headquarters"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-[13.5px] text-fg-muted">
              <input
                type="checkbox"
                checked={isHeadquarters}
                onChange={(e) => setIsHeadquarters(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-emerald-600"
              />
              Headquarters
            </label>
            <label className="flex items-center gap-2 text-[13.5px] text-fg-muted">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-emerald-600"
              />
              Remote
            </label>
          </div>
          {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Adding…' : 'Add location'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
