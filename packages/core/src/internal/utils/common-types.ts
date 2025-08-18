type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export const assertTypeEquality = <A, B>(isEqual: Equal<A, B>) => {};

export type Chars<S extends string> = S extends `${infer C}${infer R}` ? C | Chars<R> : never;

export type ASCIIVisible =
  | Chars<"!\"#$%&'()*+,-./">
  | Chars<"0123456789:;<=>?">
  | Chars<"@ABCDEFGHIJKLMNO">
  | Chars<"PQRSTUVWXYZ[\\]^_">
  | Chars<"`abcdefghijklmno">
  | Chars<"pqrstuvwxyz{|}~">;