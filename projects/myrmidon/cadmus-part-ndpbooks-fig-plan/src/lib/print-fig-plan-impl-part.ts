import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

import { Part } from '@myrmidon/cadmus-core';
import { PrintFont } from '@myrmidon/cadmus-part-ndpbooks-fonts';

import { FigPlanItem } from './print-fig-plan-part';

/**
 * A label for a figurative plan item.
 */
export interface FigPlanItemLabel {
  /**
   * The type of label, e.g. legend, topographic indication, etc.
   * Usually from thesaurus "fig-plan-item-label-types".
   */
  type: string;

  /**
   * The language(s) used in the label.
   * Usually from thesaurus "fig-plan-item-label-languages".
   */
  languages?: string[];

  /**
   * The label value, e.g. the legend text, the character
   * name, etc.
   */
  value?: string;

  /**
   * A free text note about the label.
   */
  note?: string;

  /**
   * The fonts used in the label.
   */
  fonts?: PrintFont[];
}

/**
 * Implementation of a figurative plan item.
 */
export interface FigPlanImplItem extends FigPlanItem {
  /**
   * The page location (e.g. "1r").
   */
  location?: string;

  /**
   * The type of change made to the item in this instance
   * with respect to the plan.
   * Usually from thesaurus "fig-plan-impl-change-types".
   */
  changeType?: string;

  /**
   * Any relevant features of the implemented item (e.g.
   * matrix change, frame removed, etc.).
   * Usually from thesaurus "fig-plan-impl-item-features".
   */
  features?: string[];

  /**
   * The type of matrix used for this item. Usually from thesaurus
   * "fig-plan-impl-matrix-types".
   */
  matrixType?: string;

  /**
   * The state of the matrix (e.g. a woodblock) used for this item.
   * Usually from thesaurus "fig-plan-impl-matrix-states".
   */
  matrixState?: string;

  /**
   * A free textual description of the matrix state, if any.
   */
  matrixStateDsc?: string;

  /**
   * The relative position of the item in the page
   * (e.g. in-text, upper margin, etc.).
   * Usually from thesaurus "fig-plan-impl-positions".
   */
  position?: string;

  /**
   * The size of the item.
   */
  size?: PhysicalSize;

  /**
   * Labels for this item, e.g. a legend, a character name, etc.
   */
  labels?: FigPlanItemLabel[];

  /**
   * A free text description about all the labels of this item.
   */
  labelDsc?: string;

  /**
   * The iconography of this item, if any.
   */
  iconographyId?: AssertedCompositeId;
}

/**
 * The printed book's figurative plan part model.
 */
export interface PrintFigPlanPartImpl extends Part {
  isComplete?: boolean;
  techniques: string[];
  items?: FigPlanImplItem[];
  description?: string;
  features?: string[];
}
