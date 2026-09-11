import { NOTABLE_WORD_FORMS_PART_TYPEID } from '@myrmidon/cadmus-part-ndp-notable-word-forms';
import { TEXT_PASSAGES_PART_TYPEID } from '@myrmidon/cadmus-part-ndp-text-passages';
import { pendingChangesGuard } from '@myrmidon/cadmus-core';

import { CADMUS_PART_NDP_PG_ROUTES } from './cadmus-part-ndp-routes';

describe('CADMUS_PART_NDP_PG_ROUTES', () => {
  it('should define a route for the notable word forms part', () => {
    const route = CADMUS_PART_NDP_PG_ROUTES.find((r) =>
      r.path?.startsWith(NOTABLE_WORD_FORMS_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${NOTABLE_WORD_FORMS_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define a route for the text passages part', () => {
    const route = CADMUS_PART_NDP_PG_ROUTES.find((r) =>
      r.path?.startsWith(TEXT_PASSAGES_PART_TYPEID)
    );
    expect(route).toBeTruthy();
    expect(route!.path).toBe(`${TEXT_PASSAGES_PART_TYPEID}/:pid`);
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBeTruthy();
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define exactly two routes', () => {
    expect(CADMUS_PART_NDP_PG_ROUTES.length).toBe(2);
  });
});
