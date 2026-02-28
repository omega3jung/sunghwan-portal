export type Mapper<TIn, TOut> = (input: TIn) => TOut;

export type ArrayMapper<TIn, TOut> = Mapper<TIn[], TOut[]>;
