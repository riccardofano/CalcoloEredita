import { CategoryName } from '../context/Category'

export interface Person {
  id: string
  category: CategoryName
  name: string
  children: Person[]
  spouse: Person[]
  siblings: Person[]
  unilateral: Person[]
  parents: Person[]
  alive: boolean
  inheritance?: number
  degree?: number
  // if someone has the `Diritto di rappresentazione (Cod. Civ. artt. 467-469)`
  representationRight?: boolean
}
