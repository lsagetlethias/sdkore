import { IModel } from './IModel';

/**
 * Flag a model as it will have a picture to manipulate.
 */
export interface IPictureAwareModel extends IModel {
    picture?: Blob | string;
}
