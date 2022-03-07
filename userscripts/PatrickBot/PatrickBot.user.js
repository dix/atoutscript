// ==UserScript==
// @name         PatrickBot
// @namespace    https://github.com/dix/atoutscript
// @version      2022.03.07
// @description  Auto-vote on PlanITPoker based on cards' popularity
// @author       https://github.com/dix
// @match        https://www.planitpoker.com/board/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAALPSURBVDiNjVJbTFIBGP4PBzygIIpkSkoJYeZtCjWs5aXysjbTFzfnfNC2LF35UA8te2utmg9d1mv6UJKmbm2Wc4Yza5g3NiinUzMn5AVBDhyPAoLn0kPimk3ze/m3b////d9/QWAXSi8X3ZcIxdc4AmwzyE1NTbuHho3q3bl/A8tIT3leVJinT09Lds6/esvSHhvLUjjLUjj7oavNtFchdzsmVWWfr82THsVeE7MuecUF4HBQcDicEB0t3a8xcABAolIpqufo9VV5TdEflmXh0cMneEVRuX1hYQn0+oHIPR1kadWGc1pNsotct6IYDwAAHE4n9HZ2M5k2FtPpOoh9HSAILOfn5wDLMGiQjBSL4E23ThpdX0w3NNyK2KbDAQDZLYBSfsqZoU4p4aJcNC5OJjB/m/BlZWkELbpO//rGxsanAQM5Mjgsabxz4x4vJKR8i6aWcBcxExRAAAAK8nOMN+uqNU6c8ExMTgfiZDHi0uwzqEIeDwAAtlUXtHf1wBrhBkwQttLc1nFlzrLYu3MFi/VXJ8LhqE3mcbKkuFD87EWT/2VTC5oQF0NrkhOZcJGIf7uuhusJ0BAuEsaMmr4/nrMs9gEAjQIAuFyEiWWYMmmUBBs1mr1KhRyRHpLytErZms22gnX2DPBU8lgkNTUVAQBISlRG9X/5KqcYOje4OArlcjOvX63MnbcseEYNw/wA6YaIMAEwNA0nFfGbbo8fydae5iIcFA6LQ9H3+oHjPu9mws7m7fZVw/CoOfBR//nBqRRVQZJC7qUB8TldZJgyPpZjJ8hNbZoqFOOhMDJmZAfHxincTXj3O/EOMk8omo2tT5nqsmJytr+dvVtb5bt0Vssei42ZR/9fDrCCu/U/rEsXG+srFe/6Bgm9wUiFYnyBHXd7DyQAAJR12dFqnPx5hKa2hOMz8zKaZlDS6+H981kHmShSJBzi8/msx+vz/wZ4NjI8s8pztgAAAABJRU5ErkJggg==
// @grant        none
// ==/UserScript==


var currentUser = '';

var cardsSystem = [
    { index : 0, label : '0', value : 0, votes : 0},
    { index : 1, label : '½', value : 0.5, votes : 0},
    { index : 2, label : '1', value : 1, votes : 0},
    { index : 3, label : '2', value : 2, votes : 0},
    { index : 4, label : '3', value : 3, votes : 0},
    { index : 5, label : '5', value : 5, votes : 0},
    { index : 6, label : '8', value : 8, votes : 0},
    { index : 7, label : '13', value : 13, votes : 0},
    { index : 8, label : '20', value : 20, votes : 0},
    { index : 9, label : '40', value : 40, votes : 0},
    { index : 10, label : '100', value : 100, votes : 0},
];

(function() {
    'use strict';
    // Loop every half second to check if everything is loaded (dirty)
    let intervLoading = setInterval(function () { checkLoaded(intervLoading); }, 500);
})();

// Based on the DOM, checks if the board is loaded or not
// Is so, stops the check interval and starts playing
function checkLoaded(intervLoading){
    // The game is loaded when the cards are displayed
    if(document.querySelectorAll('.cards > li').length > 0){
        // Stop the refresh
        clearInterval(intervLoading);
        // Launch the actual job
        playSomeCards();
    }
}

// Starts playing by watching the players list
function playSomeCards(){
    console.info(`May the flop be with you. Always.`);

    // Retrieve current user's name at the top right of the screen
    currentUser = document.querySelector('.li-name').innerHTML;

    if (document.querySelector('.players-list')) {
        // Add an observer on the player's list to check if a new vote is needed each time a change is made to the list
        new MutationObserver(checkVotes).observe(document.querySelector('.players-list'), { subtree: true, childList: true });
        console.info(`I'm ready to play!`);
    }
}

// By comparing user's vote and other players vote, decides if a new vote is required and does it if applicable
function checkVotes(){
    let curVote = getCurrentVote();
    let nbVotes = 0;

    if(isBlockingStatus(document.querySelector('.status-message > div > :not(.ng-hide)').getAttribute('ng-show'))){
        console.info(`Blocking status : can't vote; won't vote`);
    }else{

        // Get all current votes
        document.querySelectorAll('.voting').forEach((v) => {
            // Skip user's vote
            if(currentUser != v.parentElement.querySelector('.info > .name > span').innerHTML && v.querySelector('span')){
                let val = interpretVote(v.querySelector('span').innerHTML);
                if(val >= 0){
                    // Increment count of votes for the card selected by the current player
                    cardsSystem[val].votes += 1;
                }
                nbVotes++;
            }
        });

        // Sort the cards to find the most popular
        let rank = [...cardsSystem].sort((a, b) => {
            // If tie on number of votes, the smaller value wins
            return b.votes != a.votes ? b.votes - a.votes : a.value - b.value;
        });

        // Take the first car as the new vote
        let newVote = rank[0].index;

        // Vote only if there's at least one other voter and need to change card
        if(nbVotes > 0 && curVote != newVote){
            console.info(`Vote for ${newVote}`);
            doTheVote(newVote);
        }else{
            console.info(`No new vote needed`);
        }

        // Finally, clean the list for the next round
        cleanVotes();
    }
}

// Retrieve card's index by vote value
function interpretVote(vote){
    return cardsSystem.findIndex((v) => v.label == vote);
}

// Retrieve user's card index by selected card on the board
function getCurrentVote(){
    return [...document.querySelectorAll('.cards > li')].findIndex((v) => v.classList.contains('active'));
}

// Check if the game is in a blocking status (= can't vote)
function isBlockingStatus(status){
    return '!!statusMessage.waitingModerators' == status;
}

// Pick the card on the board
function doTheVote(vote){
    document.querySelectorAll('.cards > li')[vote].querySelector('button').click();
}

// Reset the card system's number of votes
function cleanVotes(){
    cardsSystem.forEach((v) => {v.votes = 0});
}