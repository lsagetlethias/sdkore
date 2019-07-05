type BaseModel<ID extends string, IDTYPE> = { readonly [key in ID]?: IDTYPE };

/**
 * The base model to each resource of the Wynd API
 */
export type IModel<ID extends string = 'id', IDTYPE = number> = BaseModel<ID, IDTYPE> & {
    /**
     * Remove when everything is complete
     * @todo
     */
    [P: string]: any;
};
