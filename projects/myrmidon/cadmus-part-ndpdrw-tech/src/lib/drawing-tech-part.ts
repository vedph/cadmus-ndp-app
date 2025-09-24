import { Part } from '@myrmidon/cadmus-core';

import { PhysicalMeasurement } from '@myrmidon/cadmus-mat-physical-size';

/**
 * The DrawingTech part model.
 */
export interface DrawingTechPart extends Part {
  material: string;
  features?: string[];
  measures?: PhysicalMeasurement[];
  techniques?: string[];
  colors?: string[];
  note?: string;
}

/**
 * The type ID used to identify the DrawingTechPart type.
 */
export const DRAWING_TECH_PART_TYPEID = 'it.vedph.ndp.drawing-tech';

/**
 * JSON schema for the DrawingTech part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const DRAWING_TECH_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/ndp/' + DRAWING_TECH_PART_TYPEID + '.json',
  type: 'object',
  title: 'DrawingTechPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'material',
  ],
  properties: {
    timeCreated: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    creatorId: {
      type: 'string',
    },
    timeModified: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    userId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    itemId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    typeId: {
      type: 'string',
      pattern: '^[a-z][-0-9a-z._]*$',
    },
    roleId: {
      type: ['string', 'null'],
      pattern: '^([a-z][-0-9a-z._]*)?$',
    },
    material: {
      type: 'string',
    },
    features: {
      type: 'array',
      items: { type: 'string' },
    },
    measures: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tag: { type: 'string' },
          value: { type: 'number' },
          unit: { type: 'string' },
        },
        required: ['tag', 'value', 'unit'],
      },
    },
    techniques: {
      type: 'array',
      items: { type: 'string' },
    },
    colors: {
      type: 'array',
      items: { type: 'string' },
    },
    note: {
      type: 'string',
    },
  },
};
