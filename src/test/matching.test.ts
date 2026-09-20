import { matchingService } from "../services/matchingService"
import { verificationService } from "../services/verificationService"
import { calculateCategoryScore } from "../logic/matching/categoryScore"
import { calculateDescriptionScore } from "../logic/matching/descriptionScore"
import { calculateLocationScore } from "../logic/matching/locationScore"
import { calculateTimeScore } from "../logic/matching/timeScore"
import { storageService } from "../services/storageService"
import { claimsService } from "../services/claimsService"
import { handoverService } from "../services/handoverService"
import type { Item } from "../types/items"

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`)
  }
  console.log(`✓ PASS: ${msg}`)
}

async function runTests() {
  console.log("\n─── RECLAIMX MATCHING ENGINE & PROOF LOCKER TEST SUITE ───\n")
  storageService.resetDemoData()

  // 1. Same item / high signal pair -> high score (>= 80)
  const lostBackpack: Item = {
    id: "test-lost-1",
    type: "lost",
    category: "Bags",
    title: "Black Canvas Backpack",
    description: "Black canvas backpack with tear on left shoulder strap and red keychain",
    location: "Central Library",
    date: "Sep 20",
    time: "6:00 PM",
    status: "active",
    createdAt: new Date().toISOString(),
    userId: "user-1",
    characteristics: { color: "Black", marks: "Tear on strap", accessories: "Keychain" },
  }

  const foundBackpack: Item = {
    id: "test-found-1",
    type: "found",
    category: "Bags",
    title: "Black Backpack",
    description: "Black canvas backpack found near quiet study area. Left strap torn with red keychain attached",
    location: "Central Library",
    date: "Sep 20",
    time: "6:15 PM",
    status: "active",
    createdAt: new Date().toISOString(),
    userId: "user-2",
    characteristics: { color: "Black", marks: "Tear on strap", accessories: "Keychain" },
  }

  const highMatch = matchingService.scorePair(lostBackpack, foundBackpack)
  assert(highMatch.score >= 80, `Same item produces high score (actual: ${highMatch.score})`)
  assert(highMatch.confidenceLabel === "Strong potential match", "Categorized as Strong potential match")

  // 2. Same category but different location -> moderate score
  const locScoreSame = calculateLocationScore("Central Library", "Central Library").score
  const locScoreFar = calculateLocationScore("Central Library", "Sports Complex").score
  assert(locScoreSame > locScoreFar, `Nearby location (${locScoreSame}) scores higher than far location (${locScoreFar})`)

  // 3. Different category -> low score
  const diffCatScore = calculateCategoryScore("Bags", "Water Bottles").score
  assert(diffCatScore === 0, `Completely different category scores 0 (actual: ${diffCatScore})`)

  // 4. Nearby times -> higher score
  const timeNear = calculateTimeScore("Sep 20", "6:00 PM", "Sep 20", "6:15 PM").score
  const timeFar = calculateTimeScore("Sep 20", "6:00 PM", "Sep 15", "6:00 PM").score
  assert(timeNear > timeFar, `Nearby time (${timeNear}) scores higher than distant time (${timeFar})`)

  // 5. Large time difference -> lower score
  assert(timeFar <= 4, `Large time difference produces low score (actual: ${timeFar})`)

  // 6. Similar descriptions -> higher score
  const descSimilar = calculateDescriptionScore(
    "Black backpack with visible tear on strap",
    "Black backpack with small tear",
  ).score
  const descDiff = calculateDescriptionScore(
    "Black backpack with visible tear on strap",
    "Silver metal keys with green lanyard",
  ).score
  assert(descSimilar > descDiff, `Similar descriptions (${descSimilar}) score higher than different (${descDiff})`)

  // 7. Different descriptions -> lower score
  assert(descDiff <= 6, `Unrelated description produces minimal score (actual: ${descDiff})`)

  // 8. Private proof never appears in match result
  const matchKeys = JSON.stringify(highMatch)
  assert(!matchKeys.includes("expectedAnswer"), "Private expectedAnswer never appears in MatchResult")
  assert(!matchKeys.includes("locker-"), "Private locker ID details never exposed in MatchResult signals")

  // 9. Correct proof answers -> verified
  const passAnswers = [
    { clueId: "clue-1", question: "What was attached to the backpack?", answer: "red keychain" },
    { clueId: "clue-2", question: "Where was the distinctive damage or mark?", answer: "torn left strap" },
    { clueId: "clue-3", question: "What was inside the main or front compartment?", answer: "blue spiral notebook" },
  ]
  const passEval = await verificationService.evaluateVerification("RX-8834-B", passAnswers)
  assert(passEval.passed === true, "Correct answers evaluate to passed=true")
  assert(passEval.status === "verified", "Correct answers evaluate to status=verified")
  assert(passEval.matchedCount === 3, "All 3 clues matched")

  // 10. Incorrect proof answers -> rejected
  const failAnswers = [
    { clueId: "clue-1", question: "What was attached to the backpack?", answer: "green frog" },
    { clueId: "clue-2", question: "Where was the distinctive damage or mark?", answer: "no damage" },
    { clueId: "clue-3", question: "What was inside the main or front compartment?", answer: "empty" },
  ]
  const failEval = await verificationService.evaluateVerification("RX-8834-B", failAnswers)
  assert(failEval.passed === false, "Incorrect answers evaluate to passed=false")
  assert(failEval.status === "rejected", "Incorrect answers evaluate to status=rejected")

  // 11. Partial answers -> incomplete/rejected according to threshold
  const partialAnswers = [
    { clueId: "clue-1", question: "What was attached to the backpack?", answer: "red keychain" },
    { clueId: "clue-2", question: "Where was the distinctive damage or mark?", answer: "torn left strap" },
    { clueId: "clue-3", question: "What was inside the main or front compartment?", answer: "wrong item" },
  ]
  const partialEval = await verificationService.evaluateVerification("RX-8834-B", partialAnswers)
  assert(partialEval.status === "incomplete", "Partial answers evaluate to status=incomplete")
  assert(partialEval.passed === false, "Partial answers do not grant full verification")

  // 12. Claim state transitions work
  const newClaim = claimsService.createClaim("RX-LOST-101", "RX-8834-B")
  assert(newClaim.status === "verification", "Created claim starts in verification status")

  const { claim: verifiedClaim } = await claimsService.submitVerification(newClaim.id, passAnswers)
  assert(verifiedClaim.status === "handover_ready", "Verified claim advances to handover_ready")
  assert(!!verifiedClaim.handoverCode, `Handover code generated: ${verifiedClaim.handoverCode}`)

  // 13. Handover completion marks item reclaimed
  handoverService.confirmFinder(verifiedClaim.id)
  handoverService.confirmOwner(verifiedClaim.id)
  const { claim: completedClaim } = handoverService.completeHandover(verifiedClaim.id)
  assert(completedClaim.status === "completed", "Completed claim has status=completed")

  const foundItemAfter = storageService.getItemById("RX-8834-B")
  assert(foundItemAfter?.status === "reclaimed", "Target item marked as reclaimed")

  console.log("\nALL 13 MATCHING & VERIFICATION SUITE TESTS PASSED SUCCESSFULLY! ✓\n")
}

runTests().catch((err) => {
  console.error(err)
  process.exit(1)
})
