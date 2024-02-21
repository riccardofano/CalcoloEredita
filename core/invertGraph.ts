import { CategoryName } from './types/Category'
import { Person, PersonList } from './types/Person'
import mappings from './invertedMappings.json'

export type InvertedPerson = {
  id: string
  name: string
  available: boolean
  relation: string
  relatedTo: string
}

export function defaultRoot(): Person {
  return {
    id: '0',
    name: 'Defunto',
    available: false,
    degree: 0,
    previous: null,
    category: 'root',
    relatives: [],
  }
}

export function invertGraph(root: Person, list: InvertedPerson[]): PersonList {
  const personList: PersonList = { '0': root }

  for (const person of list) {
    const degree = relationIdToDegree(person.relation)
    const category = relationIdToCategory(person.relation)
    const root = person.relatedTo === '' ? '0' : person.relatedTo

    personList[person.id] = {
      id: person.id,
      name: person.name,
      available: person.available,
      degree,
      previous: root,
      category,
      relatives: [],
    }
  }

  for (const person of Object.values(personList)) {
    if (!person.previous) {
      continue
    }

    personList[person.previous].relatives.push(person.id)
  }

  return personList
}

function relationIdToDegree(relation: string): number {
  const mapping = mappings[relation as keyof typeof mappings]
  if (!mapping) {
    throw new Error('Unknown relation')
  }

  return mapping.degree
}

function relationIdToCategory(relation: string): CategoryName {
  const mapping = mappings[relation as keyof typeof mappings]
  if (!mapping) {
    throw new Error('Unknown relation')
  }

  return mapping.category as CategoryName
}
