const express = require("express");
const app = express();
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const typeDefs = require("./types");

// ENV Setup
const dotenv = require("dotenv");
dotenv.config();

// Errors
const Errors = require("./errors");

// Upload File
const path = require("path");
const saveToStorage = require("./saveToStorage");
app.use(express.static(path.join(__dirname, "/public")));

// Email Server\
const Mail = require("./mail");

// Database
const databaseUrl =
  process.env.APP_ENV === "production"
    ? `${process.env.DB_CONNECTION}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
    : `${process.env.DB_CONNECTION}://localhost/pishbini`;
const database = mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.Promise = global.Promise;

// Models
const UserModel = require("./models/user");
const CompetitionModel = require("./models/competition");
const TeamModel = require("./models/team");
const PeriodModel = require("./models/period");
const MatchModel = require("./models/match");
const PredictionModel = require("./models/prediction");
const PointModel = require("./models/point");
const ChampionPrediction = require("./models/champion_prediction");
const JobModel = require("./models/job");
const TitleModel = require("./models/title");
const SettingModel = require("./models/setting");
const RegisterModel = require("./models/register");

// Point Types
const Points = require("./points");

// Resolvers
let resolvers = {
  Query: {
    // Auth
    user: async (parent, args, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      return {
        status: "SUCCESS",
        user: await UserModel.findById(user.id),
        job: await JobModel.findOne({ user: user.id }),
        settings: await SettingModel.findOne({}),
      };
    },

    // Site
    competitions: async (parent, args, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      return {
        status: "SUCCESS",
        competitions: await CompetitionModel.find({}),
      };
    },
    competition: async (parent, { url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let competitionItem = await CompetitionModel.findOne({ url: url });
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      return {
        status: "SUCCESS",
        competition: competitionItem,
      };
    },
    periods: async (parent, { url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let userItem = await UserModel.findById(user.id);

      let competitionItem = await CompetitionModel.findOne({ url: url });
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      return {
        status: "SUCCESS",
        periods: await PeriodModel.find({ competition: competitionItem.id }),
      };
    },
    period: async (parent, { id }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const period = await PeriodModel.findById(id);
      if (!period) {
        return {
          status: "SUCCESS",
          message: Errors.periodInvalid,
        };
      }

      return {
        status: "SUCCESS",
        period: period,
      };
    },
    matches: async (parent, { period }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let periodItem = await PeriodModel.findById(period);
      if (!periodItem) {
        return {
          status: "FAILED",
          message: Errors.periodInvalid,
        };
      }

      const matches = await MatchModel.find({ period: periodItem.id });

      matches.sort(function (a, b) {
        return Number(a.matchDateTime) - Number(b.matchDateTime);
      });

      return {
        status: "SUCCESS",
        matches: await matches.map(async (item) => {
          const predict = await PredictionModel.findOne({
            match: item._id,
            user: user.id,
          });

          const point = await PointModel.findOne({
            match: item._id,
            user: user.id,
          });

          return {
            ...item._doc,
            id: item._doc._id,
            myPrediction: predict ? predict : null,
            myPoint: point ? point.point : null,
          };
        }),
      };
    },
    match: async (parent, { id }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const match = await MatchModel.findById(id);
      if (!match) {
        return {
          status: "FAILED",
          message: Errors.matchInvalid,
        };
      }

      return {
        status: "SUCCESS",
        match: match,
      };
    },
    table: async (parent, { url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let competitionItem = await CompetitionModel.findOne({ url: url });
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      let allUsers = await UserModel.find({});
      let users = await allUsers.filter((item) =>
        item.competitions.includes(competitionItem.id)
      );

      return {
        status: "SUCCESS",
        table: await users.map(async (item) => {
          let points = await PointModel.find({
            competition: competitionItem.id,
            user: item.id,
          });
          var point = 0;
          await points.map((item) => {
            point += item.point;
          });
          return { user: item, point: point };
        }),
      };
    },
    tableDetails: async (parent, { url, userId }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let competitionItem = await CompetitionModel.findOne({ url: url });
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      let userItem = await UserModel.findById(userId);
      if (!userItem) {
        return {
          status: "FAILED",
          message: Errors.existUserNotFound,
        };
      }
      if (!userItem.competitions.includes(competitionItem.id)) {
        return {
          status: "FAILED",
          message: Errors.notUserForThisCompetition,
        };
      }

      var exact = 0;
      var difference = 0;
      var winner = 0;
      var wrong = 0;
      var empty = 0;
      var champion = false;

      let points = await PointModel.find({
        user: userItem.id,
        competition: competitionItem.id,
      });

      await points.map((item) => {
        switch (item.point) {
          case Points.exact:
            exact += 1;
            break;
          case Points.difference:
            difference += 1;
            break;
          case Points.winner:
            winner += 1;
            break;
          case Points.wrong:
            wrong += 1;
            break;
          case Points.empty:
            empty += 1;
            break;
          case Points.champion:
            champion = true;
            break;
          default:
            null;
        }
      });

      return {
        status: "SUCCESS",
        tableDetails: {
          exact: exact,
          difference: difference,
          winner: winner,
          wrong: wrong,
          empty: empty,
          champion: champion,
        },
      };
    },
    champion: async (parent, { url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let competitionItem = await CompetitionModel.findOne({ url: url });
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      let myPredict = await ChampionPrediction.findOne({
        user: user.id,
        competition: competitionItem.id,
      });

      let point = await PointModel.findOne({
        user: user.id,
        competition: competitionItem.id,
        point: 15,
      });

      return {
        status: "SUCCESS",
        competition: await CompetitionModel.findOne({ url: url }),
        champion: {
          point: point ? point.point : null,
          myPrediction: myPredict ? TeamModel.findById(myPredict.team) : null,
        },
      };
    },
    stats: async (parent, { url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let competitionItem = await CompetitionModel.findOne({ url: url });
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      return {
        status: "SUCCESS",
        periods: await PeriodModel.find({
          competition: competitionItem.id,
        }),
      };
    },
    predictions: async (parent, { type, url, match }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let competitionItem = await CompetitionModel.findOne({ url: url });
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      let matchItem = await MatchModel.findById(match);
      if (type === "MATCH" && !matchItem) {
        return {
          status: "FAILED",
          message: Errors.matchInvalid,
        };
      }

      if (type === "CHAMPION") {
        let allUsers = await UserModel.find({});
        let users = await allUsers.filter((item) =>
          item.competitions.includes(competitionItem.id)
        );

        return {
          status: "SUCCESS",
          predictions: await users.map(async (item) => {
            const point = await PointModel.findOne({
              user: item.id,
              competition: competitionItem.id,
              point: 15,
            });
            const championPrediction = await ChampionPrediction.findOne({
              user: item.id,
              competition: competitionItem.id,
            });
            var myPredictionChampion = null;
            if (championPrediction && championPrediction.team) {
              myPredictionChampion = await TeamModel.findById(
                championPrediction.team
              );
            }

            return {
              user: item,
              myPredictionChampion: myPredictionChampion,
              point: point ? point.point : null,
            };
          }),
        };
      } else if (type === "MATCH") {
        let allUsers = await UserModel.find({});
        let users = await allUsers.filter((item) =>
          item.competitions.includes(competitionItem.id)
        );

        return {
          status: "SUCCESS",
          predictions: await users.map(async (item) => {
            const point = await PointModel.findOne({
              user: item.id,
              competition: competitionItem.id,
              match: match,
            });
            const myPredictionScore = await PredictionModel.findOne({
              user: item.id,
              match: matchItem,
            });

            return {
              user: item,
              myPredictionScore: myPredictionScore ? myPredictionScore : null,
              point: point ? point.point : null,
            };
          }),
        };
      }
    },
    jobs: async (parent, args, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      return {
        status: "SUCCESS",
        jobs: await JobModel.find({ status: true }),
      };
    },
    hallOfFame: async (parent, args, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let users = await UserModel.find({});
      let winners = await users.filter((item) => item.titles > 0);
      await winners.sort(function (a, b) {
        return b.titles - a.titles;
      });

      return {
        status: "SUCCESS",
        titles: await TitleModel.find(),
        winners: winners,
      };
    },
    settings: async (parent, args, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let settings = await SettingModel.find({});

      return {
        status: "SUCCESS",
        settings: settings[0],
      };
    },

    // Admin
    teams: async (parent, { url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      if (url) {
        let competitionItem = await CompetitionModel.findOne({ url: url });
        if (!competitionItem) {
          return {
            status: "FAILED",
            message: Errors.urlInvalid,
          };
        }

        return {
          status: "SUCCESS",
          teams: await competitionItem.teams.map((item) =>
            TeamModel.findById(item)
          ),
        };
      }

      return {
        status: "SUCCESS",
        teams: await TeamModel.find({}),
      };
    },
    adminMatches: async (parent, { period }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let periodItem = await PeriodModel.findById(period);
      if (!periodItem) {
        return {
          status: "FAILED",
          message: Errors.periodInvalid,
        };
      }

      const matches = await MatchModel.find({ period: periodItem.id });

      matches.sort(function (a, b) {
        return Number(a.matchDateTime) - Number(b.matchDateTime);
      });

      return {
        status: "SUCCESS",
        matches: matches,
      };
    },
    users: async (parent, args, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      return {
        status: "SUCCESS",
        users: await UserModel.find({}),
      };
    },
  },
  Mutation: {
    // Auth
    login: async (parent, { email, password }, { api_secret_key }) => {
      let user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        return {
          status: "FAILED",
          message: Errors.emailInvalid,
        };
      }

      let isValid = user.comparePassword(password);
      if (!isValid) {
        return {
          status: "FAILED",
          message: Errors.passwordInvalid,
        };
      }

      if (!user.status) {
        return {
          status: "FAILED",
          message: Errors.statusFalse,
        };
      }

      return {
        status: "SUCCESS",
        token: await UserModel.createToken(user, api_secret_key, "2 days"),
        user,
        job: await JobModel.findOne({ user: user.id }),
        settings: await SettingModel.findOne({}),
      };
    },
    forget: async (parent, { email }) => {
      let user2 = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user2) {
        return {
          status: "FAILED",
          message: Errors.emailInvalid,
        };
      }

      let newPassword = Math.floor(Math.random() * 1000000);
      let hash = await UserModel.hashPassword(newPassword.toString());
      let user = await UserModel.findOneAndUpdate(email, {
        password: hash,
      });
      let info = await Mail.transporter.sendMail({
        from: Mail.email, // sender address
        to: email,
        subject: "کلمه عبور جدید", // Subject line
        text: `کلمه عبور جدید شما ${newPassword.toString()} بعد از ورود دوباره کلمه عبور خود را تغییر دهید.`, // plain text body
        html: `کلمه عبور جدید شما <b>${newPassword.toString()}</b> بعد از ورود دوباره کلمه عبور خود را تغییر دهید.`, // html body
      });

      return {
        status: "SUCCESS",
        message: Errors.successForget,
      };
    },
    register: async (
      parent,
      { firstName, lastName, email, mobile, password },
      { user }
    ) => {
      let register = RegisterModel.create({
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        email: email.toLowerCase(),
        password: await UserModel.hashPassword(password),
      });

      return {
        status: "SUCCESS",
        message: Errors.registerSuccess + " " + Errors.registerDetail,
      };
    },

    // Site
    predict: async (parent, { match, homeGoal, awayGoal }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let matchItem = await MatchModel.findOne({ _id: match });
      if (!matchItem) {
        return {
          status: "FAILED",
          message: Errors.matchInvalid,
        };
      }

      let myPredict = await PredictionModel.findOne({
        match: match,
        user: user.id,
      });
      if (myPredict) {
        let data = await PredictionModel.update(myPredict, {
          homeGoal: homeGoal,
          awayGoal: awayGoal,
        });
        if (!data) {
          return {
            status: "FAILED",
            message: Errors.predictError,
          };
        }
      } else {
        let data = await PredictionModel.create({
          match: match,
          user: user.id,
          homeGoal: homeGoal,
          awayGoal: awayGoal,
        });
        if (!data) {
          return {
            status: "FAILED",
            message: Errors.predictError,
          };
        }
      }

      return {
        status: "SUCCESS",
        message: Errors.predictSuccess,
      };
    },
    championPredict: async (parent, { url, team }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let competitionItem = await CompetitionModel.findOne({
        url: url,
      });
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      let myPredict = await ChampionPrediction.findOne({
        competition: competitionItem.id,
        user: user.id,
      });
      if (myPredict) {
        let update = await ChampionPrediction.findByIdAndUpdate(myPredict.id, {
          team: team,
        });
      } else {
        let create = await ChampionPrediction.create({
          competition: competitionItem.id,
          user: user.id,
          team: team,
        });
      }

      return {
        status: "SUCCESS",
        message: Errors.predictSuccess,
      };
    },
    registerCompetition: async (parent, { competition }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const competitionItem = await CompetitionModel.findById(competition);
      if (!competitionItem) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      const userItem = await UserModel.findById(user.id);

      let competitions = userItem.competitions;
      if (competitions.includes(competitionItem.id)) {
        return {
          status: "FAILED",
          message: Errors.againRegister,
        };
      }
      await competitions.push(competitionItem.id);

      let pay = userItem.pay;
      await pay.push({
        status: false,
        competition: competitionItem.id,
      });

      await UserModel.findOneAndUpdate(
        { _id: userItem.id },
        {
          competitions: competitions,
          pay: pay,
        }
      );

      return {
        status: "SUCCESS",
        message: Errors.registerSuccess,
        user: await UserModel.findById(user.id),
      };
    },
    changePassword: async (
      parent,
      { currentPassword, newPassword },
      { user }
    ) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let userItem = await UserModel.findById(user.id);

      const isCurrect = await userItem.comparePassword(currentPassword);
      if (!isCurrect) {
        return {
          status: "FAILED",
          message: Errors.passwordInvalid,
        };
      }

      let hash = await UserModel.hashPassword(newPassword);
      await UserModel.findOneAndUpdate(
        { _id: userItem.id },
        {
          password: hash,
        }
      );

      return {
        status: "SUCCESS",
        message: Errors.changePasswordSuccess,
      };
    },
    editInformation: async (
      parent,
      { firstName, lastName, mobile },
      { user }
    ) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let userItem = await UserModel.findById(user.id);
      await UserModel.findOneAndUpdate(
        { _id: userItem.id },
        {
          firstName: firstName,
          lastName: lastName,
          mobile: mobile,
        }
      );

      return {
        status: "SUCCESS",
        message: Errors.editInformationSuccess,
        user: await UserModel.findOne({ _id: userItem.id }),
      };
    },
    editJob: async (
      parent,
      { title, description, phone, link, status },
      { user }
    ) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let jobItem = await JobModel.findOne({ user: user.id });
      if (!jobItem) {
        return {
          status: "FAILED",
          message: Errors.jobNotFound,
        };
      }
      await JobModel.findOneAndUpdate(
        { _id: jobItem.id },
        {
          title: title,
          description: description,
          phone: phone,
          link: link,
          status: status,
        }
      );

      return {
        status: "SUCCESS",
        message: Errors.editJobSuccess,
        job: await JobModel.findOne({ _id: jobItem.id }),
      };
    },
    uploadAvatar: async (parent, { avatar }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      let userItem = await UserModel.findById(user.id);

      if (!avatar) {
        return {
          status: "FAILED",
          message: Errors.notFoundImage,
        };
      }
      const { createReadStream, filename } = await avatar;
      const stream = await createReadStream();
      const { filePath } = await saveToStorage("avatars", { stream, filename });

      await UserModel.findOneAndUpdate(
        { _id: userItem.id },
        {
          avatar: "/" + filePath,
        }
      );

      return {
        status: "SUCCESS",
        message: Errors.uploadAvatarSuccess,
        user: await UserModel.findById(userItem.id),
      };
    },

    // Admin
    addTeam: async (parent, { logo, name }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const { createReadStream, filename } = await logo;
      const stream = await createReadStream();
      const { filePath } = await saveToStorage("teams", { stream, filename });

      const addTeam = await TeamModel.create({
        name: name,
        logo: "/" + filePath,
        status: true,
      });

      return {
        status: "SUCCESS",
        message: Errors.addTeamSuccess,
      };
    },
    deleteTeam: async (parent, { id }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const team = await TeamModel.findById(id);
      if (!team) {
        return {
          status: "FAILED",
          message: Errors.notFoundTeam,
        };
      }

      const comeptitions = await CompetitionModel.find({});
      comeptitions.map((item) => {
        if (item.teams.includes(id)) {
          return {
            status: "FAILED",
            message: Errors.teamInCompetition,
          };
        }
      });

      const deleteTeam = await TeamModel.findByIdAndDelete(id);

      return {
        status: "SUCCESS",
        message: Errors.deleteTeamSuccess,
      };
    },
    statusTeam: async (parent, { id, status }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const team = await TeamModel.findById(id);
      if (!team) {
        return {
          status: "FAILED",
          message: Errors.notFoundTeam,
        };
      }

      const update = await TeamModel.findByIdAndUpdate(id, {
        status: status,
      });

      return {
        status: "SUCCESS",
        message: Errors.statusTeamSuccess,
      };
    },
    addCompetition: async (
      parent,
      { title, price, url, teams, championPredictionDateTime, image },
      { user }
    ) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const { createReadStream, filename } = await image;
      const stream = await createReadStream();
      const { filePath } = await saveToStorage("competitions", {
        stream,
        filename,
      });

      const findCompetition = await CompetitionModel.findOne({ url: url });
      if (findCompetition) {
        return {
          status: "FAILED",
          message: Errors.repetitiveCompetition,
        };
      }

      const addCompetition = await CompetitionModel.create({
        title: title,
        price: price,
        url: url,
        isFinish: false,
        championPredictionDateTime: championPredictionDateTime,
        image: "/" + filePath,
        teams: teams,
      });

      return {
        status: "SUCCESS",
        message: Errors.addCompetitionSuccess,
      };
    },
    editCompetition: async (
      parent,
      { id, title, price, url, teams, championPredictionDateTime },
      { user }
    ) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const competition = await CompetitionModel.findById(id);
      if (!competition) {
        return {
          status: "LOGOUT",
          message: Errors.urlInvalid,
        };
      }

      const updateCompetition = await CompetitionModel.findByIdAndUpdate(id, {
        title: title,
        price: price,
        url: url,
        championPredictionDateTime: championPredictionDateTime,
        teams: teams,
      });

      return {
        status: "SUCCESS",
        message: Errors.editCompetitionSuccess,
        user: await UserModel.findById(user.id),
      };
    },
    deleteCompetition: async (parent, { id }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const competition = await CompetitionModel.findById(id);
      if (!competition) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      const periods = await PeriodModel.find({
        competition: id,
      });
      if (periods.length > 0) {
        return {
          status: "FAILED",
          message: Errors.cantDeleteCompetiiton,
        };
      }

      const users = await UserModel.find({});
      await users.map((item) => {
        if (item.competitions.includes(id)) {
          return {
            status: "FAILED",
            message: Errors.cantDeleteCompetiiton,
          };
        }
      });

      const deleteCompetition = await CompetitionModel.findByIdAndDelete(id);

      return {
        status: "SUCCESS",
        message: Errors.deleteCompetitionSuccess,
      };
    },
    addPeriod: async (parent, { name, url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const competition = await CompetitionModel.findOne({ url: url });
      if (!competition) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      const allUsers = await UserModel.find({});
      const users = await allUsers.map((item) => {
        if (item.competitions.includes(competition.id)) {
          return item;
        }
      });
      const competitionUsers = await users.filter((item) => item != undefined);

      var indexNumber = Math.floor(Math.random() * competitionUsers.length);
      const addPeriod = await PeriodModel.create({
        name: name,
        competition: competition.id,
        bestUser: competitionUsers[indexNumber].id,
        bestUserPoint: 0,
      });

      return {
        status: "SUCCESS",
        message: Errors.addPeriodSuccess,
      };
    },
    editPeriod: async (parent, { id, name, url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const competition = await CompetitionModel.findOne({ url: url });
      if (!competition) {
        return {
          status: "LOGOUT",
          message: Errors.urlInvalid,
        };
      }

      const updatePeriod = await PeriodModel.findByIdAndUpdate(id, {
        name: name,
      });

      return {
        status: "SUCCESS",
        message: Errors.editPeriodSuccess,
      };
    },
    deletePeriod: async (parent, { id, url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const competition = await CompetitionModel.findOne({ url: url });
      if (!competition) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      const matches = await MatchModel.find({
        period: id,
      });
      if (matches.length > 0) {
        return {
          status: "FAILED",
          message: Errors.cantDeletePeriod,
        };
      }

      const deletePeriod = await PeriodModel.findByIdAndDelete(id);

      return {
        status: "SUCCESS",
        message: Errors.deletePeriodSuccess,
      };
    },
    activePeriod: async (parent, { id, url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const competition = await CompetitionModel.findOne({ url: url });
      if (!competition) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      const activePeriod = await CompetitionModel.findByIdAndUpdate(
        competition.id,
        {
          activePeriod: id,
        }
      );

      return {
        status: "SUCCESS",
        message: Errors.activePeriodSuccess,
      };
    },
    addMatch: async (parent, { home, away, period, url }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const competition = await CompetitionModel.findOne({ url: url });
      if (!competition) {
        return {
          status: "FAILED",
          message: Errors.urlInvalid,
        };
      }

      const periodItem = await PeriodModel.findById(period);
      if (!periodItem) {
        return {
          status: "FAILED",
          message: Errors.periodInvalid,
        };
      }

      const addMatch = await MatchModel.create({
        home: home,
        away: away,
        period: period,
        homeGoal: null,
        awayGoal: null,
        matchDateTime: null,
        sentDateTime: null,
      });

      return {
        status: "SUCCESS",
        message: Errors.addMatchSuccess,
      };
    },
    editMatch: async (parent, { id, home, away }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const match = await MatchModel.findById(id);
      if (!match) {
        return {
          status: "FAILED",
          message: Errors.matchInvalid,
        };
      }

      const updateMatch = await MatchModel.findByIdAndUpdate(id, {
        home: home,
        away: away,
      });

      return {
        status: "SUCCESS",
        message: Errors.editMatchSuccess,
      };
    },
    deleteMatch: async (parent, { id }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const predicts = await PredictionModel.find({ match: id });
      if (predicts && predicts.length > 0) {
        return {
          status: "FAILED",
          message: Errors.cantDeleteMatch,
        };
      }

      const deleteMatch = await MatchModel.findByIdAndDelete(id);

      return {
        status: "SUCCESS",
        message: Errors.deleteMatchSuccess,
      };
    },
    submitScore: async (parent, { id, url, homeGoal, awayGoal }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const matchItem = await MatchModel.findById(id);
      if (!matchItem) {
        return {
          status: "LOGOUT",
          message: Errors.matchInvalid,
        };
      }

      const competition = await CompetitionModel.findOne({ url: url });

      const users = await UserModel.find({});
      const competitionUsers = await users.filter((item) =>
        item.competitions.includes(competition.id)
      );

      await competitionUsers.map(async (item) => {
        const myPoint = await PointModel.findOne({
          match: id,
          user: item.id,
        });
        const myPredict = await PredictionModel.findOne({
          match: id,
          user: item.id,
        });

        if (myPredict && myPoint) {
          const newPoint = await Points.func(
            false,
            myPredict.homeGoal,
            myPredict.awayGoal,
            homeGoal,
            awayGoal
          );
          await PointModel.findOneAndUpdate(
            {
              match: id,
              user: item.id,
            },
            {
              point: newPoint,
            }
          );
        } else if (myPredict && !myPoint) {
          const point = await Points.func(
            false,
            myPredict.homeGoal,
            myPredict.awayGoal,
            homeGoal,
            awayGoal
          );
          await PointModel.create({
            match: id,
            competition: competition.id,
            user: item.id,
            point: point,
          });
        } else if (!myPredict && !myPoint) {
          await PointModel.create({
            match: id,
            competition: competition.id,
            user: item.id,
            point: Points.empty,
          });
        }
      });

      const matchUpdate = await MatchModel.findByIdAndUpdate(id, {
        homeGoal: homeGoal,
        awayGoal: awayGoal,
        sentDateTime: new Date(),
      });

      return {
        status: "SUCCESS",
        message: Errors.submitScoreSuccess,
      };
    },
    submitTime: async (parent, { id, matchDateTime }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const matchItem = await MatchModel.findById(id);
      if (!matchItem) {
        return {
          status: "LOGOUT",
          message: Errors.matchInvalid,
        };
      }

      if (matchDateTime.length < 1) {
        const update = await MatchModel.findByIdAndUpdate(id, {
          matchDateTime: null,
        });
      } else {
        const update = await MatchModel.findByIdAndUpdate(id, {
          matchDateTime: matchDateTime,
        });
      }

      return {
        status: "SUCCESS",
        message: Errors.submitScoreSuccess,
      };
    },
    addUser: async (
      parent,
      { firstName, lastName, email, mobile },
      { user }
    ) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const checkUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (checkUser) {
        return {
          status: "FAILED",
          message: Errors.hasThisEmailBefore,
        };
      }

      const create = await UserModel.create({
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        email: email.toLowerCase(),
        avatar: "/avatars/avatar.jpg",
        status: true,
        role: ["USER"],
        competitions: [],
        pay: [],
        password: await UserModel.hashPassword("123456"),
        titles: 0,
      });

      const job = await JobModel.create({
        title: null,
        description: null,
        user: create.id,
        phone: null,
        link: null,
        status: false,
      });

      return {
        status: "SUCCESS",
        message: Errors.addUserSuccess,
      };
    },
    editUser: async (
      parent,
      { id, firstName, lastName, mobile, email },
      { user }
    ) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const update = await UserModel.findByIdAndUpdate(id, {
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        email: email.toLowerCase(),
      });

      return {
        status: "SUCCESS",
        message: Errors.editUserSuccess,
      };
    },
    roleUser: async (parent, { id, role }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const update = await UserModel.findByIdAndUpdate(id, {
        role: role,
      });

      return {
        status: "SUCCESS",
        message: Errors.editUserSuccess,
      };
    },
    statusUser: async (parent, { id, status }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const update = await UserModel.findByIdAndUpdate(id, {
        status: status,
      });

      return {
        status: "SUCCESS",
        message: Errors.editUserSuccess,
      };
    },
    deleteUser: async (parent, { id }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const userItem = await UserModel.findById(id);
      if (userItem.competitions.length > 0) {
        return {
          status: "FAILED",
          message: Errors.cantDeleteUser,
        };
      }

      const deleteUser = await UserModel.findByIdAndDelete(id);

      return {
        status: "SUCCESS",
        message: Errors.deleteUserSuccess,
      };
    },
    acceptRegister: async (parent, { id }, { user }) => {
      if (!user) {
        return {
          status: "LOGOUT",
          message: Errors.notAuthenticated,
        };
      }

      const userItem = await RegisterModel.findById(id);
      let register = UserModel.create({
        firstName: userItem.firstName,
        lastName: userItem.lastName,
        mobile: userItem.mobile,
        email: userItem.email,
        avatar: "/avatars/avatar.jpg",
        status: true,
        role: ["USER"],
        competitions: [],
        pay: [],
        password: userItem.hashPassword,
        titles: 0,
      });

      return {
        status: "SUCCESS",
        message: Errors.addUserSuccess,
      };
    },
  },
  User: {
    competitions: async (parent, args) =>
      await parent.competitions.map(
        async (item) => await CompetitionModel.findById(item)
      ),
  },
  Competition: {
    winner: async (parent, args) => await UserModel.findById(parent.winner),
    champion: async (parent, args) => await TeamModel.findById(parent.champion),
    activePeriod: async (parent, args) =>
      await PeriodModel.findById(parent.activePeriod),
    teams: async (parent, args) =>
      await parent.teams.map(async (item) => await TeamModel.findById(item)),
  },
  Pay: {
    competition: async (parent, args) =>
      await CompetitionModel.findById(parent.competition),
  },
  Period: {
    competition: async (parent, args) =>
      await CompetitionModel.findById(parent.competition),
    bestUser: async (parent, args) => await UserModel.findById(parent.bestUser),
  },
  Match: {
    home: async (parent, args) => await TeamModel.findById(parent.home),
    away: async (parent, args) => await TeamModel.findById(parent.away),
    period: async (parent, args) => await PeriodModel.findById(parent.period),
  },
  ChampionPrediction: {
    team: async (parent, args) => await TeamModel.findById(parent.team),
  },
};

// Server
const server = new ApolloServer({
  cors: true,
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const api_secret_key = process.env.APP_KEY;
    let user = await UserModel.checkToken(req, api_secret_key);

    return {
      user,
      api_secret_key,
    };
  },
});
server.applyMiddleware({ app });

app.listen(process.env.APP_PORT, () => null);
