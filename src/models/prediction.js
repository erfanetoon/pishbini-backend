const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const predictionSchema = Schema({
    user : { type : Schema.Types.ObjectId , required : true },
    match : { type : Schema.Types.ObjectId , required : true },
    homeGoal : { type : Number ,  required : true },
    awayGoal : { type : Number ,  required : true },
} , { timestamps : true });

module.exports = mongoose.model('Prediction' , predictionSchema);