type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertTypeEquality = <A, B>(isEqual: Equal<A, B>) => {};

export type Chars<S extends string> = S extends `${infer C}${infer R}` ? C | Chars<R> : never;

export type ASCIIVisible =
  | Chars<"!\"#$%&'()*+,-./">
  | Chars<"0123456789:;<=>?">
  | Chars<"@ABCDEFGHIJKLMNO">
  | Chars<"PQRSTUVWXYZ[\\]^_">
  | Chars<"`abcdefghijklmno">
  | Chars<"pqrstuvwxyz{|}~">;

export type TimeStamp = number;