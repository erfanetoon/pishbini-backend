const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const championPredictionSchema = Schema({
    user : { type : Schema.Types.ObjectId , required : true },
    competition : { type : Schema.Types.ObjectId , required : true },
    team : { type : Schema.Types.ObjectId , required : true },
} , { timestamps : true });

module.exports = mongoose.model('ChampionPrediction' , championPredictionSchema);