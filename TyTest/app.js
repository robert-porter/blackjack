
var canvas;
var context;

var deck;
var playerHand = [];
var dealerHand = [];
var pot = 0;
var playerStack = 100;

var dealButton;
var hitButton;
var standButton;

var debugOut;

//enum
var playerBusted = 2;
var dealerBusted = 3;
var playerWin = 4;
var dealerWin = 5;
var tieGame = 6;
///enum

var images = [];


function Card (suit, rank) {
    this.suit = suit;
    this.rank = rank;
}

function gameOver(how) {
    hideDealerCard = false;
    dealButton.style.visibility = "visible";
    hitButton.disabled = true;
    standButton.disabled = true;

    switch (how) {
        case playerBusted:
            debugOut.value = "Player busted";
            break;
        case dealerBusted:
            debugOut.value = "Dealer busted";
            playerStack += pot;
            break;
        case playerWin:
            debugOut.value = "Player wins";
            playerStack += pot;
            break;
        case dealerWin:
            debugOut.value = "Dealer wins";
            break;
        case tieGame:
            playerStack += pot / 2;
            debugOut.value = "Tie";
            break;
    }

    pot = 0;
    document.getElementById("stack").value = playerStack;
    document.getElementById("pot").value = 0;

    drawHand(playerHand, 100, 400, 20, false);
    drawHand(dealerHand, 100, 200, 20, false);
}

function cardToImageIndex(card) {
    return (card.rank - 1) * 4 + card.suit;
}

function imageIndexToCard(index) {
    return new Card(index % 4, Math.floor(1 + index / 4));
}

function createDeck() {
    var d = [];
    for(var i = 0; i < 52; i++) {
        d[i] = imageIndexToCard(i);
    }

    return d;
}

function drawHand(cards, x, y, xOffset, hideFirst) {
    var i = 0;
    if (hideFirst && cards.length != 0) {
        i = 1;
        context.drawImage(images[52], x, y);
    }
    for(; i  < cards.length; i++) {
        var imageIndex = cardToImageIndex(cards[i]);
        context.drawImage(images[imageIndex], x + i * xOffset, y - i * xOffset * 0.5);
    }
}

function loadAllCards() {
    for (var i = 0; i < 52; i++) {
        var suits = ["h", "d", "c", "s"];
        var suitString = suits[i % 4];

        var rankString;

        var rank = Math.floor(i / 4);
        if (rank == 10)
            rankString = "j";
        else if (rank == 11)
            rankString = "q";
        else if (rank == 12)
            rankString = "k";
        else
            rankString = rank + 1;

        var filename = "images/" + suitString + rankString + ".png";

        images[i] = new Image();
        images[i].src = filename;
    }

    images[52] = new Image();
    images[52].src = "images/b1fv.png";
}

function resize() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initialize() {

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    
    window.addEventListener('resize', resize, false);

    hitButton = document.getElementById("hitButton");
    standButton = document.getElementById("standButton");
    dealButton = document.getElementById('dealButton');
    debugOut = document.getElementById("debug");

    loadAllCards();
    
    dealButton.style.visibility = "visible";
    hitButton.disabled = true;
    standButton.disabled = true;
}

function dealCardToPlayer() {
    playerHand[playerHand.length] = deck[deck.length - 1];
    deck.pop();
}

function dealCardToDealer() {
    dealerHand[dealerHand.length] = deck[deck.length - 1];
    deck.pop();
}

function shuffleDeck() {
	for (var k = 0; k < 100; k++) {
        for (var i = 0; i < 52; i++) {
			var r = Math.floor(Math.random() * 52);

			var temp = deck[i];
			deck[i] = deck[r];
			deck[r] = temp;
        }
    }
}

function getHandValue(hand) {
    var sum = 0;
    var numAces = 0;

    for (var i = 0; i < hand.length; i++) {
        if (hand[i].rank == 1)
            numAces++;
        else if (hand[i].rank >= 11)
            sum += 10;
        else
            sum += hand[i].rank;
    }

    sum = sum + numAces * 11;

    while(numAces > 0 && sum > 21)
    {
        sum -= 10;
        numAces--;
    }

    return sum;
}

function standButtonClicked() {
    if (getHandValueWithAcesLow(dealerHand) >= 17) { 

        var playerVal = getHandValue(playerHand);
        var dealerVal = getHandValue(dealerHand);
        
        if (playerVal > dealerVal)
            gameOver(playerWin);
        else if (playerVal < dealerVal)
            gameOver(dealerWin);
        else
            gameOver(tieGame);

        return;
    }

    dealCardToDealer();
    drawHand(playerHand, 100, 400, 20, false);
    drawHand(dealerHand, 100, 200, 20, hideDealerCard);

    if (getHandValueWithAcesLow(dealerHand) > 21) 
        gameOver(dealerBusted);
}

function hitButtonClicked() {
    dealCardToPlayer();

    if (getHandValueWithAcesLow(playerHand) > 21) {
        gameOver(playerBusted);
        return; // so we don't draw.
    }
    if (getHandValueWithAcesLow(dealerHand) < 17) {
        dealCardToDealer();

        if (getHandValueWithAcesLow(dealerHand) > 21) {
            gameOver(dealerBusted);
            return; // so we don't draw.
        }
    }

    drawHand(playerHand, 100, 400, 20, false);
    drawHand(dealerHand, 100, 200, 20, true);
}

function dealButtonClicked()
{
    dealButton.style.visibility = "hidden";
    hitButton.disabled = false;
    standButton.disabled = false;

    context.clearRect(0, 0, canvas.width, canvas.height);

    dealerHand = [];
    playerHand = [];
    deck = createDeck();
    shuffleDeck();

    hideDealerCard = true;

    dealCardToPlayer();
    dealCardToDealer();
    dealCardToPlayer();
    dealCardToDealer();

    drawHand(playerHand, 100, 400, 20, false);
    drawHand(dealerHand, 100, 200, 20, true);

    playerStack -= 1;
    pot += 2;

    document.getElementById("stack").value = playerStack;
    document.getElementById("pot").value = pot;
}

function getHandValueWithAcesLow(hand) {
    var sum = 0;
    for (var i = 0; i < hand.length; i++) {
        if (hand[i].rank < 11)
            sum += hand[i].rank;
        else
            sum += 10;
    }
    return sum;
}

function drawDeck() {
    for (var i = 0; i < deck.length; i++) {
        var imageIndex = cardToImageIndex(deck[i]);
        context.drawImage(images[imageIndex], i * 20, 0);
    }
}
