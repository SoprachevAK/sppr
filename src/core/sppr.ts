import { toPlacedTableFormat, type InputTable, type Order, validateInputTable, calculatePlace } from '.';
import { createBinaryRelationshipMatrix } from './createBinaryRelationshipMatrix';
import { dominate } from './dominate';
import { block } from './block';
import { normalizeWeights } from './normalizeWeights';
import { tournament, toPlacedTableFromat as tournamentTableFromatter } from './tournament';
import { kmax, toTable as kmaxToTable, finalKmax } from './kmax';


export function sppr(table: InputTable) {

  if (validateInputTable(table) !== true) {
    return {
      normalizedWeights: [],
      binaryRelationship: [],
      dominateResult: [],
      blockResult: [],
      tournamentResult: [],
      kMax: [],
      finalKmaxResult: [],
      dominateTableResult: [],
      blockTableResult: [],
      tournamentTableResult: [],
      kmaxTableResult: [],
      finalResult: [],
      finalBestResult: []
    }
  }

  const normalizedWeights = normalizeWeights(table)
  const binaryRelationship = createBinaryRelationshipMatrix(table)
  const dominateResult = dominate(binaryRelationship)
  const blockResult = block(binaryRelationship)
  const tournamentResult = tournament(binaryRelationship)
  const kMax = kmax(binaryRelationship)
  const finalKmaxResult = finalKmax(kMax, normalizedWeights)

  const dominateTableResult = toPlacedTableFormat(dominateResult, table.names, normalizedWeights)
  const blockTableResult = toPlacedTableFormat(blockResult, table.names, normalizedWeights)
  const tournamentTableResult = tournamentTableFromatter(tournamentResult, table.names, normalizedWeights)
  const kmaxTableResult = kmaxToTable(kMax, normalizedWeights)


  const score = (place: number) => table.names.length - place
  const scoreResult = table.names
    .map((_, i) => [
      score(dominateTableResult[i].place),
      score(blockTableResult[i].place),
      score(tournamentTableResult[i].place),
      score(finalKmaxResult[i].sJpPlace),
      score(finalKmaxResult[i].sJmPlace),
    ])
    .map(t => [...t, t.reduce((a, b) => a + b, 0)])

  const placed = calculatePlace(scoreResult, t => t[t.length - 1], (a, b) => b - a)
  const finalResult = scoreResult.map((t, i) => [...t, placed.find(p => p.item == t)!.place + 1])

  const finalBestResult = finalResult.map(v => v[v.length - 1] == 1)

  return {
    normalizedWeights,
    binaryRelationship,
    dominateResult,
    blockResult,
    tournamentResult,
    kMax,
    finalKmaxResult,
    dominateTableResult,
    blockTableResult,
    tournamentTableResult,
    kmaxTableResult,
    finalResult,
    finalBestResult
  }

}