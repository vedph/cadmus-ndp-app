import { pendingChangesGuard } from '@myrmidon/cadmus-core';
import { DRAWING_TECH_PART_TYPEID } from '@myrmidon/cadmus-part-ndpdrw-tech';

import { CADMUS_PART_NDPDRAWING_PG_ROUTES } from './cadmus-part-ndpdrw-routes';

describe('CADMUS_PART_NDPDRAWING_PG_ROUTES', () => {
  it('should define a route for the drawing tech part', () => {
    const route = CADMUS_PART_NDPDRAWING_PG_ROUTES.find((r) =>
      r.path?.startsWith(DRAWING_TECH_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${DRAWING_TECH_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define exactly one route', () => {
    expect(CADMUS_PART_NDPDRAWING_PG_ROUTES.length).toBe(1);
  });
});
