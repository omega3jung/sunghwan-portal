/** Generic one-value transformation contract shared by mapper modules. */
export type Mapper<TIn, TOut> = (input: TIn) => TOut;

/** Mapper contract for transforming one array into another. */
export type ArrayMapper<TIn, TOut> = Mapper<TIn[], TOut[]>;
