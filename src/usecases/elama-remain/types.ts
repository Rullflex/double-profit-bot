export interface ElamaCustomer {
  elamaId: number
  remain: number
}

export type ParsedElamaRemains = Record<number, ElamaCustomer>
