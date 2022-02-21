import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import {
  Box,
  Button,
  Center,
  Code,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
} from '@chakra-ui/react'

import CategoryButton from '../components/categoryButton'

import { calculateInheritance } from '../utils/inheritance'
import { Person } from '../utils/person'
import List from '../components/list'
import React from 'react'
import { Categories, CategoryContext, categoryNames, defaultState } from '../context/Category'

const Home: NextPage = () => {
  const [deceased, setDeceased] = useState<Person>({ name: '' })

  const [categories, setCategories] = useState<Categories>(defaultState)

  const showInhertance = () => {
    const updated = calculateInheritance(deceased)
    setDeceased(updated)
  }

  return (
    <Container maxWidth="container.lg" minHeight="100vh" padding="8">
      <Head>
        <title>Calcolo eredità</title>
        <meta name="description" content="Calcola l'eredità per successione legittima." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SimpleGrid as="main" spacing="4">
        <Center>
          <Heading as="h1" size="2xl">
            Calcola eredità
          </Heading>
        </Center>
        <FormControl isInvalid={deceased.name === ''} isRequired>
          <FormLabel htmlFor="name">Nome del defunto</FormLabel>
          <Input
            id="name"
            type="text"
            value={deceased.name}
            onChange={(e) => setDeceased((state) => ({ ...state, name: e.target.value }))}
          ></Input>
        </FormControl>

        <CategoryContext.Provider value={{ categories, setCategories }}>
          <SimpleGrid spacing="4" columns={{ sm: 1, md: 2 }}>
            {categoryNames.map((c) => (
              <CategoryButton key={c} category={c}></CategoryButton>
            ))}
          </SimpleGrid>

          <List person={deceased} updatePerson={setDeceased}></List>
        </CategoryContext.Provider>

        <Box>
          <Button
            type="submit"
            colorScheme="green"
            isDisabled={
              !(
                deceased.name &&
                (deceased.children?.length ||
                  deceased.spouse?.length ||
                  deceased.parents?.length ||
                  deceased.siblings?.length)
              )
            }
            onClick={showInhertance}
          >
            Calcola
          </Button>
        </Box>

        <Code>{`${JSON.stringify({ deceased })}`}</Code>
      </SimpleGrid>
    </Container>
  )
}

export default Home
