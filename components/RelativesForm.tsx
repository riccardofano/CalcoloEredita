import { ChangeEvent, FormEvent, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Person, PersonList } from '../utils/types/Person'

import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { useSelectedIdContext, useSetSelectedIdContext } from '../context/SelectedIdContext'

import Categories from './Categories'
import MoneyForm from './MoneyForm'

interface RelativesFormProps {
  isLoading: boolean
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export default function RelativesForm({ isLoading, onSubmit }: RelativesFormProps) {
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward')

  const list = usePeopleContext()
  const dispatch = usePeopleDispatchContext()

  const id = useSelectedIdContext()
  const setSelectedId = useSetSelectedIdContext()
  if (!list || !setSelectedId) return null

  const me = list[id]
  const isRoot = me.id === '0'
  const pagination = getPagination(list, me)

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (!dispatch) return
    dispatch({ type: 'UPDATE_NAME', payload: { id, name: e.target.value } })
  }

  function setDirectionBackward() {
    setAnimationDirection('backward')
  }

  function setDirectionForward() {
    setAnimationDirection('forward')
  }

  const header = (
    <header className="space-y-2">
      {isRoot ? (
        <>
          <label className="text-xs" htmlFor="deceased-name">
            Nome del defunto
            <input className="input-field" type="text" id="deceased-name" value={me.name} onChange={onNameChange} />
          </label>

          <MoneyForm />
        </>
      ) : (
        <nav>
          {pagination.reverse().map((p, i) => {
            const isLast = i === pagination.length - 1
            return (
              <span key={p.id}>
                {isLast ? (
                  <span className="text-lg text-black font-semibold">{p.name}</span>
                ) : (
                  <button
                    className="text-sm text-gray-400"
                    type="button"
                    onMouseEnter={() => setDirectionBackward()}
                    onFocus={() => setDirectionBackward()}
                    onClick={() => setSelectedId(p.id)}
                  >
                    {p.name}
                  </button>
                )}
                {!isLast && <span> / </span>}
              </span>
            )
          })}
        </nav>
      )}
    </header>
  )

  const initialX = animationDirection === 'forward' ? 110 : -110
  const endingX = initialX * -1

  return (
    <AnimatePresence initial={false}>
      <motion.form
        key={id}
        initial={{ opacity: 0, x: `${initialX}%` }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: `${endingX}%`, width: '100%', position: 'absolute' }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
        onSubmit={onSubmit}
      >
        {header}

        <p>Seleziona le tipologie di parenti di questa persona.</p>
        <Categories id={id} setDirectionForward={setDirectionForward} />

        <div>
          {isRoot ? (
            <button
              type="submit"
              disabled={isLoading || isSubmitDisabled(list)}
              className="flex items-center btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Spinner />}
              Calcola eredità
            </button>
          ) : (
            <button
              key="back"
              type="button"
              className="btn btn-inverted"
              onMouseEnter={() => setDirectionBackward()}
              onFocus={() => setDirectionBackward()}
              onClick={() => {
                if (!me.root) return
                setSelectedId(me.root)
              }}
            >
              Indietro
            </button>
          )}
        </div>
      </motion.form>
    </AnimatePresence>
  )
}

export function toNonEmptyName(name: string): string {
  return name === '' ? 'Senza nome' : name
}

function getPagination(list: PersonList, me: Person): { id: string; name: string }[] {
  const pagination = [{ id: me.id, name: toNonEmptyName(me.name) }]
  let root = me.root
  while (root !== null) {
    const parent = list[root]
    pagination.push({ id: parent.id, name: toNonEmptyName(parent.name) })
    root = parent.root
  }

  return pagination
}

function isSubmitDisabled(list: PersonList): boolean {
  const root = list['0']
  if (!root || root.relatives.length < 1) return true

  let disabled = false
  const queue = [root.id]

  while (!disabled && queue.length > 0) {
    const currentId = queue.pop() as string
    const current = list[currentId]
    if (!current || !current.name) {
      disabled = true
      break
    }
    queue.push(...current.relatives)
  }

  return disabled
}

function Spinner() {
  return (
    <svg className="w-6 h-6 mr-2 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M434.67 285.59v-29.8c0-98.73-80.24-178.79-179.2-178.79a179 179 0 00-140.14 67.36m-38.53 82v29.8C76.8 355 157 435 256 435a180.45 180.45 0 00140-66.92"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32"
      />
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32"
        d="M32 256l44-44 46 44M480 256l-44 44-46-44"
      />
    </svg>
  )
}
