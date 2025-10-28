import { Part } from '@myrmidon/cadmus-core';

import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

/**
 * A linguistically or philologically notable word form.
 */
export interface NotableWordForm {
  eid?: string;
  value: string;
  language?: string;
  rank?: number;
  tags?: string[];
  note?: string;
  referenceForm?: string;
  operations?: string[];
  isValueTarget?: boolean;
  references?: DocReference[];
  links?: AssertedCompositeId[];
}

/**
 * The NotableWordForms part model.
 */
export interface NotableWordFormsPart extends Part {
  forms: NotableWordForm[];
}

/**
 * The type ID used to identify the NotableWordFormsPart type.
 */
export const NOTABLE_WORD_FORMS_PART_TYPEID = 'it.vedph.ndp.notable-word-forms';

/**
 * JSON schema for the NotableWordForms part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const NOTABLE_WORD_FORMS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/lib/' + NOTABLE_WORD_FORMS_PART_TYPEID + '.json',
  type: 'object',
  title: 'NotableWordFormsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'forms',
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
    forms: {
      type: 'array',
      items: {
        type: 'object',
        required: ['value'],
        properties: {
          eid: { type: 'string' },
          value: { type: 'string' },
          language: { type: 'string' },
          rank: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } },
          note: { type: 'string' },
          referenceForm: { type: 'string' },
          operations: { type: 'array', items: { type: 'string' } },
          isValueTarget: { type: 'boolean' },
          references: {
            type: 'array',
            items: { $ref: '#/definitions/docReference' },
          },
          links: {
            type: 'array',
            items: { $ref: '#/definitions/assertedCompositeId' },
          },
        },
        additionalProperties: false,
      },
      minItems: 0,
    },
  },
  // nested type definitions
  definitions: {
    docReference: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        tag: { type: 'string' },
        citation: { type: 'string' },
        note: { type: 'string' },
      },
      required: ['citation'],
      additionalProperties: false,
    },
    pinTarget: {
      type: 'object',
      properties: {
        gid: { type: 'string' },
        label: { type: 'string' },
        itemId: { type: 'string' },
        partId: { type: 'string' },
        partTypeId: { type: 'string' },
        roleId: { type: 'string' },
        name: { type: 'string' },
        value: { type: 'string' },
      },
      required: ['gid', 'label'],
      additionalProperties: false,
    },
    assertion: {
      type: 'object',
      properties: {
        tag: { type: 'string' },
        rank: { type: 'number' },
        note: { type: 'string' },
        references: {
          type: 'array',
          items: { $ref: '#/definitions/docReference' },
        },
      },
      required: ['rank'],
      additionalProperties: false,
    },
    assertedCompositeId: {
      type: 'object',
      properties: {
        target: { $ref: '#/definitions/pinTarget' },
        tag: { type: 'string' },
        scope: { type: 'string' },
        assertion: { $ref: '#/definitions/assertion' },
      },
      required: ['target'],
      additionalProperties: false,
    },
  },
};
