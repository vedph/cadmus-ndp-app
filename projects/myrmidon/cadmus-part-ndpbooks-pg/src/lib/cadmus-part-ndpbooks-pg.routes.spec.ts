import { pendingChangesGuard } from '@myrmidon/cadmus-core';
import { PRINT_FONTS_PART_TYPEID } from '@myrmidon/cadmus-part-ndpbooks-fonts';
import {
  PRINT_FIG_PLAN_PART_TYPEID,
  PRINT_FIG_PLAN_IMPL_PART_TYPEID,
} from '@myrmidon/cadmus-part-ndpbooks-fig-plan';

import { CADMUS_PART_NDPBOOKS_PG_ROUTES } from './cadmus-part-ndpbooks-pg.routes';

describe('CADMUS_PART_NDPBOOKS_PG_ROUTES', () => {
  it('should define a route for the print fonts part', () => {
    const route = CADMUS_PART_NDPBOOKS_PG_ROUTES.find((r) =>
      r.path?.startsWith(PRINT_FONTS_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${PRINT_FONTS_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define a route for the print fig plan part', () => {
    const route = CADMUS_PART_NDPBOOKS_PG_ROUTES.find((r) =>
      r.path?.startsWith(PRINT_FIG_PLAN_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${PRINT_FIG_PLAN_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define a route for the print fig plan impl part', () => {
    const route = CADMUS_PART_NDPBOOKS_PG_ROUTES.find((r) =>
      r.path?.startsWith(PRINT_FIG_PLAN_IMPL_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${PRINT_FIG_PLAN_IMPL_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define exactly three routes', () => {
    expect(CADMUS_PART_NDPBOOKS_PG_ROUTES.length).toBe(3);
  });
});
