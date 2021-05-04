const exact = 10;
const difference = 7;
const winner = 5;
const wrong = 1;
const empty = 0;
const champion = 15;

const func = (
  champion,
  predictHomeGoal,
  predictAwayGoal,
  scoreHomeGoal,
  scoreAwayGoal
) => {
  if (predictHomeGoal === scoreHomeGoal && predictAwayGoal === scoreAwayGoal) {
    return exact;
  } else if (
    predictHomeGoal - scoreHomeGoal ===
    predictAwayGoal - scoreAwayGoal
  ) {
    return difference;
  } else if (
    (predictHomeGoal > predictAwayGoal && scoreHomeGoal > scoreAwayGoal) ||
    (predictHomeGoal < predictAwayGoal && scoreHomeGoal < scoreAwayGoal)
  ) {
    return winner;
  } else if (champion) {
    return champion;
  } else {
    return wrong;
  }
};

module.exports = {
  exact,
  difference,
  winner,
  wrong,
  empty,
  champion,
  func,
};
