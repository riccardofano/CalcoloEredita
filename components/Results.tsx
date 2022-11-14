import { Dispatch, SetStateAction, useState } from 'react'
import Fraction from 'fraction.js'
import { Person, PersonList } from '../utils/types/Person'
import { CategoryName } from '../utils/types/Category'

import { useModeContext } from '../context/ModeContext'
import { useMoneyContext } from '../context/MoneyContext'
import { usePeopleContext } from '../context/PeopleContext'

function getOrderedRelatives(id: string, list: PersonList): string[] {
  function recurse(person: Person): string[] {
    const sortedDirectRelatives = [...person.relatives].sort((a, b) => relativesSort(list[a], list[b]))

    const allSubRelatives = []
    for (const relativeId of sortedDirectRelatives) {
      allSubRelatives.push(relativeId, ...recurse(list[relativeId]))
    }
    return allSubRelatives
  }

  return recurse(list[id])
}

function relativesSort(a: Person, b: Person): number {
  const categoryOrder: CategoryName[] = ['children', 'spouse', 'ascendants', 'bilateral', 'unilateral', 'others']
  return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
}

const categoryRelation: Record<CategoryName, string> = {
  children: 'Figlio/a di',
  spouse: 'Coniuge di',
  ascendants: 'Genitore di',
  bilateral: 'Fratello/Sorella di',
  unilateral: 'Fratello/Sorella unil. di',
  others: 'Parente di',
}

interface ResultsProps {
  inheritance: Record<string, string>
  setEditing: Dispatch<SetStateAction<boolean>>
}

function Results({ inheritance, setEditing }: ResultsProps) {
  const [showMoney, setShowMoney] = useState(false)

  const mode = useModeContext()
  const list = usePeopleContext()
  const money = useMoneyContext()

  const root = list['0']
  const intMoney = Number(money) ?? 0
  const moneyIsValid = !isNaN(intMoney) && intMoney > 0

  const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
  const availableInFraction = inheritance['available'] ?? '0'
  const available = currencyFormatter.format(new Fraction(availableInFraction).valueOf() * intMoney)

  const allRelatives = getOrderedRelatives('0', list)

  return (
    <div className="max-w-xl">
      <h2 className="text-lg md:text-xl">
        Eredità della famiglia di: <span className="font-medium">{root.name}</span>
      </h2>

      {mode === 'patrimony' && moneyIsValid && (
        <div className="mt-2 rounded-md bg-primary-900 p-4 text-primary-100">
          <p className="border-b border-white/10 pb-2 text-base md:text-lg">
            Valore totale:
            <span className="text-xl font-medium text-white md:text-2xl"> {currencyFormatter.format(intMoney)}</span>
          </p>
          <p className="pt-2 text-base md:text-lg">
            Valore disponibile:
            <span className="text-xl font-medium text-white md:text-2xl">
              {' '}
              {showMoney ? available : availableInFraction}
            </span>
          </p>
        </div>
      )}

      {moneyIsValid && (
        <label className="mt-4 flex items-center">
          <input
            className="mr-2"
            type="checkbox"
            checked={showMoney}
            onChange={(e) => setShowMoney(e.target.checked)}
          />
          Mostra eredità in €
        </label>
      )}

      <table className="mt-5 w-full table-auto border">
        <thead className="border bg-gray-50 text-left">
          <tr>
            <th className="p-4">Nome</th>
            <th className="w-20 p-4">Quota</th>
          </tr>
        </thead>
        <tbody>
          {allRelatives.map((relativeId) => {
            const relative = list[relativeId]
            if (relative.root === null) return

            const relativeInheritance = inheritance[relativeId]
            const width = `${new Fraction(relativeInheritance).valueOf() * 100}%`

            const relation = categoryRelation[relative.category]

            return (
              <tr key={relativeId} className="border-t">
                <td className="px-4 py-2">
                  <p className="font-medium text-gray-800">{relative.name}</p>
                  <p className="text-sm text-gray-600 md:text-base">
                    {relation} {list[relative.root].name}
                  </p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-center text-gray-800">{relativeInheritance ?? 0}</p>
                  <p className="relative h-2 w-16 overflow-hidden rounded-sm bg-gray-200">
                    <span className="absolute inset-y-0 left-0 bg-primary-400" style={{ width }}></span>
                  </p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="mx-auto mt-5 max-w-prose rounded-md border border-primary-400 bg-primary-50/50 p-4 text-gray-600">
        Ricordiamo che questi risultati so approssimativi, molte leggi che protrebbero influenzare i risultati per
        questo consigliamo di contattare un nostro esperto per avera una panoramica più completa.
      </p>

      <div className="flex justify-between">
        <button className="btn btn-inverted mt-5" onClick={() => setEditing(true)}>
          Riprova
        </button>
        <button className="btn btn-primary mt-5">Contatta un&apos;esperto</button>
      </div>
    </div>
  )
}

export default Results
