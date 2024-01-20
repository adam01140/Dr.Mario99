"use strict";
import Game from "./Game.js";

// Initialize two games for two players
const game1 = new Game();
const game2 = new Game();

// Get the containers for each game
const gameContainer1 = document.getElementById("game1");
const gameContainer2 = document.getElementById("game2");

// Append each game to its respective container
gameContainer1.append(game1);
gameContainer2.append(game2);

// You may need to add additional logic here to control each game independently
