const { gql } = require("apollo-server-express");

const typeDefs = gql`
  enum Role {
    ADMIN
    USER
    GUEST
  }

  enum Status {
    SUCCESS
    FAILED
    LOGOUT
  }

  type Login {
    token: String!
    result: User!
  }

  type User {
    id: String
    firstName: String
    lastName: String
    mobile: String
    email: String
    avatar: String
    status: Boolean
    role: [Role]
    competitions: [Competition]
    pay: [Pay]
    titles: Int
  }

  type Pay {
    competition: Competition
    status: Boolean
  }

  type Competition {
    id: String
    price: Int
    image: String
    champion: Team
    winner: User
    title: String
    isFinish: Boolean
    url: String
    activePeriod: Period
    championPredictionDateTime: String
    teams: [Team]
  }

  type Period {
    id: String
    name: String
    competition: Competition
    bestUser: User
    bestUserPoint: Int
  }

  type Match {
    id: String
    home: Team
    away: Team
    matchDateTime: String
    homeGoal: Int
    awayGoal: Int
    period: Period
    sentDateTime: String
    myPrediction: Prediction
    myPoint: Int
  }

  type Team {
    id: String
    name: String
    country: String
    city: String
    logo: String
    status: Boolean
  }

  type Prediction {
    id: String
    user: User
    match: Match
    homeGoal: Int
    awayGoal: Int
  }

  type Table {
    user: User
    point: Int
  }

  type Point {
    user: User
    competition: Competition
    match: Match
    point: Int
  }

  type Champion {
    point: Int
    myPrediction: Team
  }

  type Predictions {
    user: User
    point: Int
    myPredictionScore: Prediction
    myPredictionChampion: Team
  }

  type ChampionPrediction {
    id: String
    user: User
    competition: Competition
    team: Team
  }

  type Job {
    id: String
    user: User
    title: String
    description: String
    link: String
    phone: String
    status: Boolean
  }

  type Title {
    id: String
    user: User
    competition: Competition
  }

  type TableDetails {
    exact: Int
    difference: Int
    winner: Int
    wrong: Int
    empty: Int
    champion: Boolean
  }

  type Setting {
    servicePrice: Int
  }

  type Register {
    id: String
    firstName: String
    lastName: String
    mobile: String
    email: String
  }

  type Output {
    status: Status!
    message: String
    token: String
    user: User
    users: [User]
    competitions: [Competition]
    competition: Competition
    periods: [Period]
    period: Period
    matches: [Match]
    match: Match
    predictions: [Predictions]
    champion: Champion
    table: [Table]
    tableDetails: TableDetails
    jobs: [Job]
    job: Job
    titles: [Title]
    winners: [User]
    settings: Setting
    teams: [Team]
  }

  type Query {
    user: Output!

    competitions: Output!
    competition(url: String!): Output!
    periods(url: String!): Output!
    period(id: String!): Output!
    matches(period: String!): Output!
    match(id: String!): Output!
    table(url: String!): Output!
    tableDetails(url: String!, userId: String!): Output!
    champion(url: String!): Output!
    stats(url: String!): Output!
    predictions(type: String!, url: String!, match: String): Output!
    jobs: Output!
    hallOfFame: Output!
    settings: Output!

    teams(url: String): Output!
    adminMatches(period: String!): Output!
    users: Output!
  }

  type Mutation {
    login(email: String!, password: String!): Output!
    forget(email: String!): Output!
    register(
      firstName: String!
      lastName: String!
      email: String!
      mobile: String!
      password: String!
    ): Output!

    predict(match: String!, homeGoal: Int!, awayGoal: Int!): Output!
    championPredict(url: String!, team: String!): Output!
    registerCompetition(competition: String!): Output!
    changePassword(currentPassword: String!, newPassword: String!): Output!
    editInformation(
      firstName: String!
      lastName: String!
      mobile: String!
    ): Output!
    editJob(
      title: String!
      description: String!
      phone: String!
      link: String!
      status: Boolean!
    ): Output!
    uploadAvatar(avatar: Upload!): Output!

    addTeam(logo: Upload!, name: String!): Output!
    deleteTeam(id: String!): Output!
    statusTeam(id: String!, status: Boolean!): Output!
    addCompetition(
      title: String!
      price: String!
      url: String!
      championPredictionDateTime: String!
      image: Upload!
      teams: [String]!
    ): Output!
    editCompetition(
      id: String!
      title: String!
      price: String!
      url: String!
      championPredictionDateTime: String!
      teams: [String]!
    ): Output!
    deleteCompetition(id: String!): Output!
    addPeriod(name: String!, url: String!): Output!
    editPeriod(id: String!, name: String!, url: String!): Output!
    deletePeriod(id: String!, url: String!): Output!
    activePeriod(id: String!, url: String!): Output!
    addMatch(
      home: String!
      away: String!
      period: String!
      url: String!
    ): Output!
    editMatch(id: String!, home: String!, away: String!): Output!
    deleteMatch(id: String!): Output!
    submitScore(
      id: String!
      url: String!
      homeGoal: Int!
      awayGoal: Int!
    ): Output!
    submitTime(id: String!, matchDateTime: String!): Output!
    addUser(
      firstName: String!
      lastName: String!
      email: String!
      mobile: String!
    ): Output!
    editUser(
      id: String!
      firstName: String!
      lastName: String!
      email: String!
      mobile: String!
    ): Output!
    roleUser(id: String!, role: [String]!): Output!
    statusUser(id: String!, status: Boolean!): Output!
    deleteUser(id: String!): Output!
    acceptRegister(id: String!): Output!
  }
`;

module.exports = typeDefs;
