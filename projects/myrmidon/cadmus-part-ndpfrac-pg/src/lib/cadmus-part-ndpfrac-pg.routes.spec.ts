import { pendingChangesGuard } from '@myrmidon/cadmus-core';
import { COD_FR_LAYOUT_PART_TYPEID } from '@myrmidon/cadmus-part-ndpfrac-layout';
import { COD_FR_QUIRE_LABELS_PART_TYPEID } from '@myrmidon/cadmus-part-ndpfrac-quire-labels';
import { COD_FR_RULINGS_PART_TYPEID } from '@myrmidon/cadmus-part-ndpfrac-rulings';
import { COD_FR_SUPPORT_PART_TYPEID } from '@myrmidon/cadmus-part-ndpfrac-support';

import { CADMUS_PART_NDPFRAC_PG_ROUTES } from './cadmus-part-ndpfrac-pg.routes';

describe('CADMUS_PART_NDPFRAC_PG_ROUTES', () => {
  it('should define a route for the layout part', () => {
    const route = CADMUS_PART_NDPFRAC_PG_ROUTES.find((r) =>
      r.path?.startsWith(COD_FR_LAYOUT_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${COD_FR_LAYOUT_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define a route for the quire labels part', () => {
    const route = CADMUS_PART_NDPFRAC_PG_ROUTES.find((r) =>
      r.path?.startsWith(COD_FR_QUIRE_LABELS_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${COD_FR_QUIRE_LABELS_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define a route for the rulings part', () => {
    const route = CADMUS_PART_NDPFRAC_PG_ROUTES.find((r) =>
      r.path?.startsWith(COD_FR_RULINGS_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${COD_FR_RULINGS_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define a route for the support part', () => {
    const route = CADMUS_PART_NDPFRAC_PG_ROUTES.find((r) =>
      r.path?.startsWith(COD_FR_SUPPORT_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${COD_FR_SUPPORT_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define exactly four routes', () => {
    expect(CADMUS_PART_NDPFRAC_PG_ROUTES.length).toBe(4);
  });
});
